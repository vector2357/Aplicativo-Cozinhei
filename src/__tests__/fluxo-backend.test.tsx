import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { entrarRemoto } from '@/features/auth/autenticacaoRemota';
import * as bancoLocal from '@/features/execucoes/bancoLocal';
import {
  atualizarExecucao,
  buscarExecucao,
  buscarPrato,
  criarExecucao,
  garantirDadosDoDono,
  listarExecucoes,
  listarHistoricoPorMes,
  listarPratos,
  listarReceitasGuia,
  obterEstatisticas,
  removerExecucao,
} from '@/features/execucoes/repositorio';

jest.mock('@/services/supabase');

const falso = jest.requireMock('@/services/supabase') as typeof import('@/services/__mocks__/supabase');

const DONO = 'marina@exemplo.com';
const SENHA = 'senha-boa';

const RASCUNHO = {
  prato: 'Bolo de cenoura',
  tempoMinutos: 70,
  custo: 13.5,
  nota: 4,
  qualidade: 'massa fofa',
  defeito: '',
};

/** Liga o backend falso e entra numa conta — o estado de onde tudo parte. */
async function entrarNoServidor(email = DONO, nome = 'Marina Cintra Marinho') {
  falso.ligarBackendFalso();
  falso.semearConta(email, SENHA, nome);
  await entrarRemoto({ email, senha: SENHA });
}

beforeEach(() => {
  falso.reiniciarBackendFalso();
});

// ---------------------------------------------------------------------------
// O fluxo completo de negócio, na camada de dados
// ---------------------------------------------------------------------------

describe('fluxo completo de negócio contra o servidor · criar → ver → alterar → excluir', () => {
  beforeEach(entrarNoServidor);

  it('atravessa as quatro operações e cada uma se confirma na leitura seguinte', async () => {
    // criar
    const criada = await criarExecucao(DONO, RASCUNHO);
    expect(criada.prato).toBe('Bolo de cenoura');
    expect(criada.tentativa).toBe('01');
    expect(criada.tempo).toBe('1h10');

    // visualizar
    const listadas = await listarExecucoes(DONO);
    expect(listadas).toHaveLength(1);
    expect((await buscarExecucao(criada.id, DONO))?.nota).toBe(4);

    // alterar
    const alterada = await atualizarExecucao(DONO, criada.id, {
      tempoMinutos: 75,
      custo: 14,
      nota: 5,
      qualidade: 'massa fofa',
      defeito: 'assou de menos',
    });
    expect(alterada?.nota).toBe(5);
    expect((await buscarExecucao(criada.id, DONO))?.tempo).toBe('1h15');
    expect((await buscarExecucao(criada.id, DONO))?.chips).toHaveLength(2);

    // excluir
    await removerExecucao(DONO, criada.id);
    expect(await listarExecucoes(DONO)).toEqual([]);
    expect(await buscarExecucao(criada.id, DONO)).toBeNull();
  });

  it('o que foi criado está no servidor, e não no banco local', async () => {
    const criada = await criarExecucao(DONO, RASCUNHO);

    expect(falso.linhasGuardadas().map((l) => l.id)).toContain(criada.id);
    // A etapa 05 não espelha: no modo conectado o servidor é a fonte da verdade.
    expect(bancoLocal.lerExecucoes(DONO).map((e) => e.id)).not.toContain(criada.id);
  });

  it('a falha do servidor sobe como exceção, para a tela cair no estado de erro', async () => {
    falso.proximaOperacaoDeDadosFalha('connection refused');
    await expect(listarExecucoes(DONO)).rejects.toThrow();
  });

  it('remover o que o servidor recusa não finge sucesso', async () => {
    const criada = await criarExecucao(DONO, RASCUNHO);
    falso.proximaOperacaoDeDadosFalha('timeout');

    await expect(removerExecucao(DONO, criada.id)).rejects.toThrow();
    expect(await listarExecucoes(DONO)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// A etapa 04 continua valendo sobre dados remotos
// ---------------------------------------------------------------------------

describe('integração com a etapa 04 · as derivações continuam as mesmas', () => {
  beforeEach(entrarNoServidor);

  it('a numeração de tentativas segue agrupando pelo nome do prato', async () => {
    const primeira = await criarExecucao(DONO, RASCUNHO);
    const segunda = await criarExecucao(DONO, { ...RASCUNHO, prato: 'bolo de cenoura' });
    const outra = await criarExecucao(DONO, { ...RASCUNHO, prato: 'Pão de queijo' });

    // Mesmo nome sem acento nem caixa cai na mesma série, igual ao modo local.
    expect(segunda.tentativa).toBe('02');
    expect(segunda.pratoId).toBe(primeira.pratoId);

    // Nome diferente começa série própria.
    expect(outra.tentativa).toBe('01');
    expect(outra.pratoId).not.toBe(primeira.pratoId);
  });

  it('prato continua derivado das execuções, com média e tira de evolução', async () => {
    await criarExecucao(DONO, { ...RASCUNHO, nota: 2 });
    await criarExecucao(DONO, { ...RASCUNHO, nota: 4 });

    const [prato] = await listarPratos(DONO);
    expect(prato.tentativas).toBe(2);
    expect(prato.notaMedia).toBe(3);
    // Cronológica: a mais antiga primeiro.
    expect(prato.evolucao).toEqual([2, 4]);
    expect((await buscarPrato(prato.id, DONO))?.nome).toBe('Bolo de cenoura');
  });

  it('o histórico continua agrupado por mês', async () => {
    await criarExecucao(DONO, RASCUNHO);
    const meses = await listarHistoricoPorMes(DONO);

    expect(meses).toHaveLength(1);
    expect(meses[0].execucoes).toHaveLength(1);
  });

  it('as estatísticas do perfil somam os números do servidor', async () => {
    await criarExecucao(DONO, { ...RASCUNHO, custo: 10, nota: 4 });
    await criarExecucao(DONO, { ...RASCUNHO, custo: 5.5, nota: 2, prato: 'Pão de queijo' });

    const numeros = await obterEstatisticas(DONO);
    expect(numeros.execucoes).toBe(2);
    expect(numeros.pratos).toBe(2);
    expect(numeros.custoTotal).toBe(15.5);
    expect(numeros.notaMedia).toBe(3);
  });

  it('o defeito recorrente continua sendo calculado, não guardado', async () => {
    await criarExecucao(DONO, { ...RASCUNHO, defeito: 'massa crua no meio' });
    await criarExecucao(DONO, { ...RASCUNHO, defeito: 'massa crua no meio' });

    const [prato] = await listarPratos(DONO);
    expect(prato.defeitoRecorrente).toBe('massa crua no meio');
  });
});

describe('integração com a etapa 04 · a semente é coisa do modo local', () => {
  it('conta de servidor nasce vazia: o conjunto de exemplo não é semeado', async () => {
    await entrarNoServidor();
    await garantirDadosDoDono(DONO, true);

    expect(await listarExecucoes(DONO)).toEqual([]);
    expect(falso.linhasGuardadas()).toEqual([]);
  });

  it('conta de servidor não recebe as receitas-guia de exemplo', async () => {
    await entrarNoServidor();
    expect(await listarReceitasGuia(DONO)).toEqual([]);
  });

  it('sem backend configurado, a etapa 04 segue intacta: semeia e grava no SQLite', async () => {
    const soLocal = 'local@exemplo.com';
    await garantirDadosDoDono(soLocal, true);

    const semeadas = await listarExecucoes(soLocal);
    expect(semeadas).toHaveLength(21);

    const criada = await criarExecucao(soLocal, RASCUNHO);
    expect(bancoLocal.lerExecucoes(soLocal).map((e) => e.id)).toContain(criada.id);
    // E nada foi pedido ao servidor.
    expect(falso.chamadasFeitas()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Segurança
// ---------------------------------------------------------------------------

describe('segurança', () => {
  it('as execuções de uma conta não aparecem para outra', async () => {
    await entrarNoServidor('a@exemplo.com', 'Conta A');
    const daA = await criarExecucao('a@exemplo.com', RASCUNHO);

    // Troca de conta no mesmo aparelho.
    await entrarNoServidor('b@exemplo.com', 'Conta B');

    const daB = await listarExecucoes('b@exemplo.com');
    expect(daB).toEqual([]);
    expect(daB.map((e) => e.id)).not.toContain(daA.id);
  });

  it('o aplicativo nunca envia o dono: quem o decide é o servidor', async () => {
    await entrarNoServidor();
    await criarExecucao(DONO, RASCUNHO);

    for (const chamada of falso.chamadasFeitas()) {
      if (!chamada.carga) continue;
      expect(Object.keys(chamada.carga)).not.toContain('usuario_id');
    }
  });

  it('a senha não é persistida em lugar nenhum', async () => {
    await entrarNoServidor();

    const chaves = await AsyncStorage.getAllKeys();
    const valores = await Promise.all(chaves.map((c) => AsyncStorage.getItem(c)));

    for (const valor of valores) {
      expect(valor ?? '').not.toContain(SENHA);
    }
  });
});

// ---------------------------------------------------------------------------
// Pelas telas, no roteador real
// ---------------------------------------------------------------------------

/** Monta o app a partir das rotas reais. */
async function montarEm(url: string) {
  const promessa = renderRouter('src/app', { initialUrl: url });
  const render = await promessa;
  return {
    caminho: () => promessa.getPathname(),
    desmontar: () => render.unmount(),
  };
}

/** O modo conectado não tem atraso simulado: só precisa esvaziar a fila. */
async function deixarResolver() {
  await act(async () => {
    jest.advanceTimersByTime(100);
  });
}

describe('pelas telas · entrada contra o servidor', () => {
  it('credenciais erradas mostram o estado de erro, com as duas saídas', async () => {
    falso.ligarBackendFalso();
    falso.semearConta(DONO, SENHA, 'Marina');

    const app = await montarEm('/');

    await fireEvent.changeText(screen.getByLabelText('e-mail'), DONO);
    await fireEvent.changeText(screen.getByLabelText('senha'), 'senha-errada');
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    await deixarResolver();

    // Ficou na espera, e não entrou.
    expect(app.caminho()).toBe('/entrando');
    expect(screen.getByText('não consegui entrar')).toBeTruthy();
    expect(screen.getByText('e-mail ou senha incorretos.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'tentar de novo' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'voltar para a entrada' })).toBeTruthy();

    app.desmontar();
  });

  it('"voltar para a entrada" devolve ao login', async () => {
    falso.ligarBackendFalso();
    falso.semearConta(DONO, SENHA, 'Marina');

    const app = await montarEm('/');

    await fireEvent.changeText(screen.getByLabelText('e-mail'), DONO);
    await fireEvent.changeText(screen.getByLabelText('senha'), 'senha-errada');
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    await deixarResolver();

    await fireEvent.press(screen.getByRole('button', { name: 'voltar para a entrada' }));
    await deixarResolver();

    expect(app.caminho()).toBe('/');

    app.desmontar();
  });

  it('credenciais certas atravessam até as abas', async () => {
    falso.ligarBackendFalso();
    falso.semearConta(DONO, SENHA, 'Marina Cintra Marinho');

    const app = await montarEm('/');

    await fireEvent.changeText(screen.getByLabelText('e-mail'), DONO);
    await fireEvent.changeText(screen.getByLabelText('senha'), SENHA);
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    await deixarResolver();

    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('o formulário inválido não chega a falar com o servidor', async () => {
    falso.ligarBackendFalso();

    const app = await montarEm('/');
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));

    expect(app.caminho()).toBe('/');
    expect(screen.getByText('informe seu e-mail')).toBeTruthy();
    expect(falso.chamadasFeitas()).toEqual([]);

    app.desmontar();
  });
});

describe('pelas telas · o fluxo de ponta a ponta com backend', () => {
  it('entra, registra pelo +, e a ficha aparece no histórico', async () => {
    falso.ligarBackendFalso();
    falso.semearConta(DONO, SENHA, 'Marina Cintra Marinho');

    const app = await montarEm('/');

    await fireEvent.changeText(screen.getByLabelText('e-mail'), DONO);
    await fireEvent.changeText(screen.getByLabelText('senha'), SENHA);
    await fireEvent.press(screen.getByRole('button', { name: 'entrar' }));
    await deixarResolver();
    expect(app.caminho()).toBe('/inicio');

    // Conta de servidor nasce vazia: é o convite que aparece, não a lista.
    await fireEvent.press(screen.getByRole('button', { name: 'registrar execução' }));
    await fireEvent.press(screen.getByRole('button', { name: /preencher à mão/ }));
    await deixarResolver();
    expect(app.caminho()).toBe('/execucao/ficha');

    await fireEvent.changeText(screen.getByLabelText('prato'), 'Bolo de cenoura');
    await fireEvent.changeText(screen.getByLabelText('tempo'), '70');
    await fireEvent.changeText(screen.getByLabelText('custo'), '13,50');
    await fireEvent.press(screen.getByRole('button', { name: 'salvar execução' }));
    await deixarResolver();

    // Gravou no servidor.
    expect(falso.linhasGuardadas()).toHaveLength(1);
    expect(falso.linhasGuardadas()[0].prato).toBe('Bolo de cenoura');

    await fireEvent.press(screen.getByRole('tab', { name: 'histórico' }));
    await deixarResolver();

    // Por rótulo, e não por texto: o cartão é um alvo único de acessibilidade,
    // e o que está dentro dele não é nó de texto consultável. `find*` porque a
    // aba monta agora e a busca dela é assíncrona — o primeiro quadro é o
    // esqueleto, não a lista.
    expect(await screen.findByLabelText(/^Bolo de cenoura, tentativa 01/)).toBeTruthy();

    app.desmontar();
  });
});

describe('pelas telas · a abertura do aplicativo com sessão no servidor', () => {
  it('reabrir com sessão válida cai direto no início, sem passar pela entrada', async () => {
    falso.ligarBackendFalso();
    falso.semearConta(DONO, SENHA, 'Marina Cintra Marinho');
    // A sessão já existe antes de o aplicativo montar: é o estado de quem
    // encerrou o app e abriu de novo.
    await entrarRemoto({ email: DONO, senha: SENHA });

    const app = await montarEm('/');
    await deixarResolver();

    expect(app.caminho()).toBe('/inicio');

    app.desmontar();
  });

  it('execução criada antes de encerrar continua lá na reabertura', async () => {
    await entrarNoServidor();
    const criada = await criarExecucao(DONO, RASCUNHO);

    const app = await montarEm('/');
    await deixarResolver();
    await fireEvent.press(screen.getByRole('tab', { name: 'histórico' }));
    await deixarResolver();

    expect(await screen.findByLabelText(/^Bolo de cenoura, tentativa 01/)).toBeTruthy();
    expect(criada.id).toBeTruthy();

    app.desmontar();
  });

  it('a fonte da sessão que não responde NÃO prende o aplicativo na splash', async () => {
    // A lição da etapa 04: o portão que segura a splash não tem tela montada,
    // então o que travar lá trava o app sem mensagem nenhuma. O teto vale para
    // as duas fontes de sessão, e este caso é o do caminho novo.
    falso.ligarBackendFalso();
    falso.travarLeituraDaSessao();

    const app = await montarEm('/');

    // Antes do teto, nada renderiza — é a splash, de propósito.
    await act(async () => {
      jest.advanceTimersByTime(2500);
    });

    // Passado o teto, vale como "sem sessão": o app abre pedindo para entrar.
    expect(app.caminho()).toBe('/');
    expect(screen.getByLabelText('e-mail')).toBeTruthy();

    app.desmontar();
  });
});

describe('pelas telas · o invariante do portão da abertura', () => {
  it('falha inesperada ao verificar a sessão abre o app, em vez de travá-lo', async () => {
    // Enquanto a sessão não é verificada não há tela montada — logo não há onde
    // mostrar erro. Por isso a bandeira é marcada no `finally`: qualquer
    // caminho que não a marque deixa o aplicativo parado na splash para
    // sempre, que foi o defeito da etapa 04.
    falso.quebrarPortao();

    const app = await montarEm('/');
    await deixarResolver();

    expect(app.caminho()).toBe('/');
    expect(screen.getByLabelText('e-mail')).toBeTruthy();

    app.desmontar();
  });
});
