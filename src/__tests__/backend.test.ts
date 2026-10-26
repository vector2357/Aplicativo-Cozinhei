import {
  criarContaRemota,
  entrarRemoto,
  ErroDeAutenticacao,
  sairRemoto,
  sessaoRemota,
  usuarioDaSessao,
} from '@/features/auth/autenticacaoRemota';
import * as bancoLocal from '@/features/execucoes/bancoLocal';
import * as bancoRemoto from '@/features/execucoes/bancoRemoto';
import { fonte } from '@/features/execucoes/fonteDeDados';
import type { Execucao } from '@/types/dominio';

jest.mock('@/services/supabase');

const falso = jest.requireMock('@/services/supabase') as typeof import('@/services/__mocks__/supabase');

const EXECUCAO: Execucao = {
  id: 'e-teste',
  pratoId: 'p-teste',
  prato: 'Pão de queijo',
  mes: 'outubro de 2026',
  tentativa: '01',
  data: '22 out',
  tempo: '0h40',
  custo: 9.5,
  nota: 4,
  chips: [{ texto: 'casquinha boa', tipo: 'qualidade' }],
};

beforeEach(() => {
  falso.reiniciarBackendFalso();
});

describe('fonteDeDados — quem responde pelos dados', () => {
  it('sem backend configurado, responde o banco local', () => {
    expect(fonte().lerExecucoes).not.toBe(bancoRemoto.lerExecucoes);
  });

  it('com backend configurado, responde o banco remoto', () => {
    falso.ligarBackendFalso();
    expect(fonte().lerExecucoes).toBe(bancoRemoto.lerExecucoes);
  });

  it('a escolha é feita a cada chamada, não fixada na carga do módulo', () => {
    const antes = fonte();
    falso.ligarBackendFalso();
    expect(fonte()).not.toBe(antes);
  });

  it('as quatro operações existem nas duas fontes, com a mesma forma', () => {
    const operacoes = ['lerExecucoes', 'inserirExecucao', 'atualizarExecucao', 'apagarExecucao'];

    for (const operacao of operacoes) {
      expect(typeof (fonte() as Record<string, unknown>)[operacao]).toBe('function');
      expect(typeof (bancoLocal as Record<string, unknown>)[operacao]).toBe('function');
      expect(typeof (bancoRemoto as Record<string, unknown>)[operacao]).toBe('function');
    }
  });
});

describe('bancoRemoto — as quatro operações contra o servidor', () => {
  beforeEach(async () => {
    falso.ligarBackendFalso();
    falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina Cintra Marinho');
    await entrarRemoto({ email: 'marina@exemplo.com', senha: 'senha-boa' });
  });

  it('grava e lê de volta a execução inteira', async () => {
    await bancoRemoto.inserirExecucao('ignorado', EXECUCAO, 1000);

    const lidas = await bancoRemoto.lerExecucoes('ignorado');
    expect(lidas).toEqual([EXECUCAO]);
  });

  it('a leitura devolve da mais recente para a mais antiga', async () => {
    await bancoRemoto.inserirExecucao('x', { ...EXECUCAO, id: 'velha' }, 100);
    await bancoRemoto.inserirExecucao('x', { ...EXECUCAO, id: 'nova' }, 200);

    const ids = (await bancoRemoto.lerExecucoes('x')).map((e) => e.id);
    expect(ids).toEqual(['nova', 'velha']);
  });

  it('não envia `usuario_id`: quem decide o dono é o servidor', async () => {
    await bancoRemoto.inserirExecucao('marina@exemplo.com', EXECUCAO, 1000);

    const insercao = falso.chamadasFeitas().find((c) => c.operacao === 'insert');
    expect(insercao?.carga).toBeDefined();
    expect(Object.keys(insercao!.carga!)).not.toContain('usuario_id');
    expect(Object.keys(insercao!.carga!)).not.toContain('dono');
  });

  it('altera só as cinco colunas que a edição permite', async () => {
    await bancoRemoto.inserirExecucao('x', EXECUCAO, 1000);
    await bancoRemoto.atualizarExecucao('x', { ...EXECUCAO, nota: 5, prato: 'Pão de queijo' });

    const alteracao = falso.chamadasFeitas().find((c) => c.operacao === 'update');
    expect(Object.keys(alteracao!.carga!).sort()).toEqual([
      'chips',
      'custo',
      'nota',
      'prato',
      'tempo',
    ]);
  });

  it('a alteração não mexe em `criado_em` nem em `prato_id`', async () => {
    await bancoRemoto.inserirExecucao('x', EXECUCAO, 777);
    await bancoRemoto.atualizarExecucao('x', { ...EXECUCAO, nota: 5 });

    const [linha] = falso.linhasGuardadas();
    expect(linha.criado_em).toBe(777);
    expect(linha.prato_id).toBe(EXECUCAO.pratoId);
  });

  it('remove a execução', async () => {
    await bancoRemoto.inserirExecucao('x', EXECUCAO, 1000);
    await bancoRemoto.apagarExecucao('x', EXECUCAO.id);

    expect(await bancoRemoto.lerExecucoes('x')).toEqual([]);
  });

  it('`numeric` que volta como texto é convertido em número', async () => {
    // O PostgREST pode serializar `numeric` como string. Sem a conversão,
    // somar o custo no perfil concatenaria em vez de somar.
    falso.semearExecucaoRemota(falso.donoDaSessaoFalsa()!, EXECUCAO, 1000);
    const linhas = falso.linhasGuardadas();
    (linhas[0] as unknown as Record<string, unknown>).custo = '9.50';
    (linhas[0] as unknown as Record<string, unknown>).nota = '4.0';

    const [lida] = await bancoRemoto.lerExecucoes('x');
    expect(lida.custo).toBe(9.5);
    expect(lida.nota).toBe(4);
    expect(typeof lida.custo).toBe('number');
  });

  it('`chips` chega como texto e volta como lista', async () => {
    falso.semearExecucaoRemota(falso.donoDaSessaoFalsa()!, EXECUCAO, 1000);
    const linhas = falso.linhasGuardadas();
    linhas[0].chips = JSON.stringify(EXECUCAO.chips);

    const [lida] = await bancoRemoto.lerExecucoes('x');
    expect(lida.chips).toEqual(EXECUCAO.chips);
  });

  describe('falha do servidor', () => {
    it('a leitura lança, em vez de devolver lista vazia', async () => {
      falso.proximaOperacaoDeDadosFalha('connection refused');
      await expect(bancoRemoto.lerExecucoes('x')).rejects.toThrow(/leitura das execuções falhou/);
    });

    it('a gravação lança', async () => {
      falso.proximaOperacaoDeDadosFalha('duplicate key');
      await expect(bancoRemoto.inserirExecucao('x', EXECUCAO, 1)).rejects.toThrow(
        /gravação da execução falhou/,
      );
    });

    it('a alteração lança', async () => {
      falso.proximaOperacaoDeDadosFalha('timeout');
      await expect(bancoRemoto.atualizarExecucao('x', EXECUCAO)).rejects.toThrow(
        /alteração da execução falhou/,
      );
    });

    it('a remoção lança', async () => {
      falso.proximaOperacaoDeDadosFalha('timeout');
      await expect(bancoRemoto.apagarExecucao('x', 'e1')).rejects.toThrow(
        /remoção da execução falhou/,
      );
    });
  });
});

describe('autenticacaoRemota', () => {
  beforeEach(() => {
    falso.ligarBackendFalso();
  });

  it('criar conta devolve o usuário do domínio, com o nome dos metadados', async () => {
    const usuario = await criarContaRemota({
      nome: 'Marina Cintra Marinho',
      email: 'nova@exemplo.com',
      senha: 'senha-boa',
    });

    expect(usuario.nome).toBe('Marina Cintra Marinho');
    expect(usuario.email).toBe('nova@exemplo.com');
    expect(usuario.iniciais).toBe('MM');
    expect(usuario.totalExecucoes).toBe(0);
  });

  it('entrar devolve o usuário de uma conta que já existe', async () => {
    falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina Cintra Marinho');

    const usuario = await entrarRemoto({ email: 'marina@exemplo.com', senha: 'senha-boa' });
    expect(usuario.email).toBe('marina@exemplo.com');
    expect(usuario.desde).toBe('cozinhando desde abril de 2026');
  });

  it('o e-mail é aparado antes de ir ao servidor', async () => {
    falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina');
    const usuario = await entrarRemoto({ email: '  marina@exemplo.com  ', senha: 'senha-boa' });
    expect(usuario.email).toBe('marina@exemplo.com');
  });

  it('sem nome nos metadados, usa a parte local do e-mail', () => {
    const usuario = usuarioDaSessao({
      user: {
        id: 'u1',
        email: 'quem@exemplo.com',
        created_at: '2026-04-10T12:00:00.000Z',
        user_metadata: {},
      },
    } as never);

    expect(usuario.nome).toBe('quem');
  });

  describe('as mensagens de falha chegam em português e em caixa baixa', () => {
    it('credenciais erradas', async () => {
      falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina');

      await expect(
        entrarRemoto({ email: 'marina@exemplo.com', senha: 'senha-errada' }),
      ).rejects.toThrow('e-mail ou senha incorretos.');
    });

    it('e-mail já cadastrado', async () => {
      falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina');

      await expect(
        criarContaRemota({ nome: 'Outra', email: 'marina@exemplo.com', senha: 'senha-boa' }),
      ).rejects.toThrow('este e-mail já tem uma conta. tente entrar.');
    });

    it('senha curta', async () => {
      await expect(
        criarContaRemota({ nome: 'Alguém', email: 'novo@exemplo.com', senha: 'abc' }),
      ).rejects.toThrow('a senha precisa de pelo menos 6 caracteres.');
    });

    it('a falha é do tipo que a tela de espera reconhece', async () => {
      falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina');

      await expect(
        entrarRemoto({ email: 'marina@exemplo.com', senha: 'errada' }),
      ).rejects.toBeInstanceOf(ErroDeAutenticacao);
    });

    it('nenhuma mensagem vaza o texto do servidor em inglês', async () => {
      falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina');

      const falha = await entrarRemoto({
        email: 'marina@exemplo.com',
        senha: 'errada',
      }).catch((e: Error) => e);

      const mensagem = (falha as Error).message;
      expect(mensagem).not.toMatch(/invalid|credentials|error/i);
      expect(mensagem).toBe(mensagem.toLowerCase());
    });
  });

  it('a sessão do servidor é o que restaura o usuário na abertura', async () => {
    falso.semearConta('marina@exemplo.com', 'senha-boa', 'Marina');
    expect(await sessaoRemota()).toBeNull();

    await entrarRemoto({ email: 'marina@exemplo.com', senha: 'senha-boa' });
    expect((await sessaoRemota())?.email).toBe('marina@exemplo.com');

    await sairRemoto();
    expect(await sessaoRemota()).toBeNull();
  });
});

describe('falha de configuração do servidor não vira "tente de novo"', () => {
  // Incidente real, 26/10/2026: o provedor de e-mail estava desligado no painel
  // do projeto, o servidor respondeu `400 email_provider_disabled`, e a tela
  // mostrou a frase genérica — que convida a insistir num caminho que nunca
  // funcionaria, e esconde de quem desenvolve o que precisa ser mudado.
  beforeEach(() => {
    falso.ligarBackendFalso();
  });

  const casos: [string, string][] = [
    ['Email signups are disabled', 'o cadastro por e-mail está desligado no servidor.'],
    ['Signups not allowed for this instance', 'o servidor não está aceitando contas novas agora.'],
  ];

  for (const [doServidor, naTela] of casos) {
    it(`"${doServidor}" chega à tela dizendo o que está errado`, async () => {
      falso.proximaAutenticacaoFalha(doServidor);

      await expect(
        criarContaRemota({ nome: 'Alguém', email: 'novo@exemplo.com', senha: 'senha-boa' }),
      ).rejects.toThrow(naTela);
    });
  }

  it('o que não é mapeado continua caindo na frase genérica', async () => {
    falso.proximaAutenticacaoFalha('Some brand new server failure');

    await expect(
      criarContaRemota({ nome: 'Alguém', email: 'novo@exemplo.com', senha: 'senha-boa' }),
    ).rejects.toThrow('não consegui entrar agora. tente de novo.');
  });

  it('a falha de configuração também é traduzida ao entrar', async () => {
    falso.proximaAutenticacaoFalha('Email signups are disabled');

    await expect(
      entrarRemoto({ email: 'alguem@exemplo.com', senha: 'senha-boa' }),
    ).rejects.toThrow('o cadastro por e-mail está desligado no servidor.');
  });
});
