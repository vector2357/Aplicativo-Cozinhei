import {
  atualizarExecucao,
  buscarExecucao,
  buscarPrato,
  criarExecucao,
  donoDe,
  garantirDadosDoDono,
  listarExecucoes,
  listarExecucoesDoPrato,
  listarExecucoesRecentes,
  listarHistoricoPorMes,
  listarPratos,
  listarReceitasGuia,
  obterEstatisticas,
  obterResumoDoMes,
  removerExecucao,
} from '@/features/execucoes/repositorio';
import { EXECUCOES, MES_CORRENTE, USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';

/**
 * Cada conjunto de testes tem o seu dono, e por isso nenhum precisa limpar o
 * banco: as linhas são por e-mail, e um dono não vê as do outro.
 */
const DONO = 'marina@exemplo.com';
const DONO_NOVO = 'conta-nova@exemplo.com';
const DONO_CRUD = 'crud@exemplo.com';

beforeAll(async () => {
  await garantirDadosDoDono(DONO, true);
  await garantirDadosDoDono(DONO_NOVO, false);
  await garantirDadosDoDono(DONO_CRUD, false);
});

describe('donoDe', () => {
  it('normaliza o e-mail: a mesma conta não pode virar dois conjuntos', () => {
    expect(donoDe({ ...USUARIO_EXEMPLO, email: '  Marina@Exemplo.COM ' })).toBe(DONO);
  });
});

describe('garantirDadosDoDono', () => {
  it('é reentrante: restaurar a sessão não semeia o conjunto duas vezes', async () => {
    await garantirDadosDoDono(DONO, true);

    await expect(listarExecucoes(DONO)).resolves.toHaveLength(EXECUCOES.length);
  });

  it('conta que não traz o conjunto de exemplo nasce sem nenhuma execução', async () => {
    await expect(listarExecucoes(DONO_NOVO)).resolves.toEqual([]);
  });
});

describe('buscarExecucao', () => {
  it('devolve a execução do id pedido', async () => {
    // Do próprio conjunto, para o teste não depender de qual prato é o primeiro.
    const esperada = EXECUCOES[0];

    const execucao = await buscarExecucao(esperada.id, DONO);

    expect(execucao?.id).toBe(esperada.id);
    expect(execucao?.prato).toBe(esperada.prato);
    expect(execucao?.tentativa).toBe(esperada.tentativa);
  });

  /** O id vem da rota, e rota é entrada externa. */
  it('devolve null para id desconhecido, em vez de estourar', async () => {
    await expect(buscarExecucao('nao-existe', DONO)).resolves.toBeNull();
  });

  it('devolve null para id vazio', async () => {
    await expect(buscarExecucao('', DONO)).resolves.toBeNull();
  });

  it('é assíncrona: por baixo dela há uma consulta ao banco', () => {
    expect(buscarExecucao('e1', DONO)).toBeInstanceOf(Promise);
  });

  it('não devolve a execução de outro dono', async () => {
    await expect(buscarExecucao(EXECUCOES[0].id, DONO_NOVO)).resolves.toBeNull();
  });
});

describe('listagens', () => {
  it('listarExecucoes devolve todas as execuções', async () => {
    await expect(listarExecucoes(DONO)).resolves.toHaveLength(EXECUCOES.length);
  });

  it('listarExecucoesRecentes devolve um recorte das execuções', async () => {
    const recentes = await listarExecucoesRecentes(DONO);
    const todas = await listarExecucoes(DONO);

    expect(recentes.length).toBeGreaterThan(0);
    expect(recentes.length).toBeLessThanOrEqual(todas.length);
    recentes.forEach((execucao) => {
      expect(todas).toContainEqual(execucao);
    });
  });

  it('listarReceitasGuia devolve receitas com nome, tempo e fonte', async () => {
    const receitas = await listarReceitasGuia(DONO);

    expect(receitas.length).toBeGreaterThan(0);
    receitas.forEach((receita) => {
      expect(receita.id).toBeTruthy();
      expect(receita.nome).toBeTruthy();
      expect(receita.fonte).toBeTruthy();
      expect(receita.tempo).toBeTruthy();
    });
  });

  /** Importar receita-guia é de etapa posterior: conta nova não tem nenhuma. */
  it('conta nova não tem receitas-guia', async () => {
    await expect(listarReceitasGuia(DONO_NOVO)).resolves.toEqual([]);
  });
});

describe('integridade dos dados que as telas consomem', () => {
  it('toda execução tem id único', async () => {
    const execucoes = await listarExecucoes(DONO);
    const ids = execucoes.map((execucao) => execucao.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda execução tem nota na faixa de 0 a 5 e tentativa com dois dígitos', async () => {
    const execucoes = await listarExecucoes(DONO);

    execucoes.forEach((execucao) => {
      expect(execucao.nota).toBeGreaterThanOrEqual(0);
      expect(execucao.nota).toBeLessThanOrEqual(5);
      expect(execucao.tentativa).toMatch(/^\d{2}$/);
    });
  });

  it('todo chip é qualidade ou defeito — não existe terceiro tipo', async () => {
    const execucoes = await listarExecucoes(DONO);

    execucoes.forEach((execucao) => {
      execucao.chips.forEach((chip) => {
        expect(['qualidade', 'defeito']).toContain(chip.tipo);
        expect(chip.texto).toBeTruthy();
      });
    });
  });

  /** Guardadas em JSON numa coluna: custo e nota precisam voltar como número. */
  it('custo e nota voltam do banco como número, não como texto', async () => {
    const execucoes = await listarExecucoes(DONO);

    execucoes.forEach((execucao) => {
      expect(typeof execucao.custo).toBe('number');
      expect(typeof execucao.nota).toBe('number');
    });
  });
});

describe('listarHistoricoPorMes', () => {
  it('agrupa as execuções por mês, do mais recente ao mais antigo', async () => {
    const meses = await listarHistoricoPorMes(DONO);

    expect(meses.length).toBeGreaterThan(1);
    expect(meses[0].rotulo).toBe(EXECUCOES[0].mes);
    // Nenhum mês aparece duas vezes: seria sinal de agrupamento furado.
    const rotulos = meses.map((mes) => mes.rotulo);
    expect(new Set(rotulos).size).toBe(rotulos.length);
  });

  it('não perde nenhuma execução no caminho', async () => {
    const meses = await listarHistoricoPorMes(DONO);
    const total = meses.reduce((soma, mes) => soma + mes.execucoes.length, 0);

    expect(total).toBe(EXECUCOES.length);
  });

  it('toda execução de um grupo pertence àquele mês', async () => {
    const meses = await listarHistoricoPorMes(DONO);

    meses.forEach((mes) => {
      mes.execucoes.forEach((execucao) => {
        expect(execucao.mes).toBe(mes.rotulo);
      });
    });
  });

  it('conta nova não tem histórico', async () => {
    await expect(listarHistoricoPorMes(DONO_NOVO)).resolves.toEqual([]);
  });
});

describe('listarPratos', () => {
  it('deriva um prato por pratoId distinto', async () => {
    const pratos = await listarPratos(DONO);
    const idsNasExecucoes = new Set(EXECUCOES.map((execucao) => execucao.pratoId));

    expect(pratos).toHaveLength(idsNasExecucoes.size);
  });

  it('conta as tentativas e tira a média das notas', async () => {
    const pratos = await listarPratos(DONO);

    pratos.forEach((prato) => {
      const suas = EXECUCOES.filter((execucao) => execucao.pratoId === prato.id);
      const media = suas.reduce((soma, e) => soma + e.nota, 0) / suas.length;

      expect(prato.tentativas).toBe(suas.length);
      expect(prato.notaMedia).toBeCloseTo(media, 5);
      expect(prato.evolucao).toHaveLength(suas.length);
    });
  });

  /** A tira de evolução lê este vetor da esquerda para a direita. */
  it('a evolução vai da primeira tentativa para a última', async () => {
    const pratos = await listarPratos(DONO);
    const bolo = pratos.find((prato) => prato.nome === 'Bolo de cenoura');

    // Os dados de exemplo do projeto: 2,0 → 3,0 → 3,0 → 4,5.
    expect(bolo?.evolucao).toEqual([2, 3, 3, 4.5]);
  });

  it('ordena por quem foi repetido mais vezes', async () => {
    const pratos = await listarPratos(DONO);

    for (let i = 1; i < pratos.length; i++) {
      expect(pratos[i - 1].tentativas).toBeGreaterThanOrEqual(pratos[i].tentativas);
    }
  });

  it('aponta o defeito que mais volta, e só quando ele de fato volta', async () => {
    const pratos = await listarPratos(DONO);
    const bolo = pratos.find((prato) => prato.nome === 'Bolo de cenoura');
    const feijoada = pratos.find((prato) => prato.nome === 'Feijoada');

    expect(bolo?.defeitoRecorrente).toBe('massa crua no meio');
    // Uma execução só: não há o que ser recorrente.
    expect(feijoada?.defeitoRecorrente).toBeUndefined();
  });

  it('conta nova não tem pratos', async () => {
    await expect(listarPratos(DONO_NOVO)).resolves.toEqual([]);
  });
});

describe('buscarPrato', () => {
  it('devolve o prato pedido, com a evolução montada', async () => {
    const pratos = await listarPratos(DONO);
    const alvo = pratos[0];

    const prato = await buscarPrato(alvo.id, DONO);

    expect(prato).toEqual(alvo);
  });

  it('devolve null para id desconhecido', async () => {
    await expect(buscarPrato('nao-existe', DONO)).resolves.toBeNull();
  });
});

describe('listarExecucoesDoPrato', () => {
  it('traz só as execuções daquele prato', async () => {
    const pratos = await listarPratos(DONO);
    const alvo = pratos[0];

    const execucoes = await listarExecucoesDoPrato(alvo.id, DONO);

    expect(execucoes).toHaveLength(alvo.tentativas);
    execucoes.forEach((execucao) => expect(execucao.pratoId).toBe(alvo.id));
  });
});

describe('obterResumoDoMes', () => {
  it('devolve período, contagem, nota média e o insight em três partes', async () => {
    const resumo = await obterResumoDoMes(DONO);

    expect(resumo.periodo).toBeTruthy();
    expect(resumo.execucoes).toBeGreaterThanOrEqual(0);
    expect(resumo.notaMedia).toBeGreaterThanOrEqual(0);
    expect(resumo.notaMedia).toBeLessThanOrEqual(5);
    // O destaque é grifado em vinho: precisa vir separado do resto da frase.
    expect(resumo.insight).toEqual({
      antes: expect.any(String),
      destaque: expect.any(String),
      depois: expect.any(String),
    });
  });

  /** Os números do cartão são contados, não escritos. */
  it('conta as execuções do mês corrente a partir dos dados', async () => {
    const doMes = EXECUCOES.filter((execucao) => execucao.mes === MES_CORRENTE);
    const media = doMes.reduce((soma, e) => soma + e.nota, 0) / doMes.length;

    const resumo = await obterResumoDoMes(DONO);

    expect(resumo.execucoes).toBe(doMes.length);
    expect(resumo.notaMedia).toBeCloseTo(media, 5);
  });

  /** O mês não é constante: é o da execução mais recente do próprio dono. */
  it('tira o mês corrente dos dados, e não de uma constante', async () => {
    const resumo = await obterResumoDoMes(DONO);

    expect(resumo.periodo).toBe(`${MES_CORRENTE.split(' de ')[0]} até aqui`);
  });

  it('conta nova tem resumo zerado, sem quebrar na divisão', async () => {
    const resumo = await obterResumoDoMes(DONO_NOVO);

    expect(resumo.execucoes).toBe(0);
    expect(resumo.notaMedia).toBe(0);
    expect(Number.isNaN(resumo.notaMedia)).toBe(false);
  });
});

describe('obterEstatisticas', () => {
  it('soma execuções, pratos distintos, média e custo', async () => {
    const estatisticas = await obterEstatisticas(DONO);

    expect(estatisticas.execucoes).toBe(EXECUCOES.length);
    expect(estatisticas.pratos).toBe(new Set(EXECUCOES.map((e) => e.pratoId)).size);
    expect(estatisticas.custoTotal).toBeCloseTo(
      EXECUCOES.reduce((soma, e) => soma + e.custo, 0),
      5,
    );
  });

  it('conta nova zera tudo sem dividir por zero', async () => {
    const estatisticas = await obterEstatisticas(DONO_NOVO);

    expect(estatisticas).toEqual({ execucoes: 0, pratos: 0, notaMedia: 0, custoTotal: 0 });
  });
});

describe('criarExecucao', () => {
  it('grava a execução e ela passa a aparecer na listagem', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Pão de queijo',
      tempoMinutos: 45,
      custo: 10.5,
      nota: 4,
      qualidade: 'cresceu bem',
    });

    const execucoes = await listarExecucoes(DONO_CRUD);

    expect(execucoes.map((execucao) => execucao.id)).toContain(criada.id);
    expect(criada.tentativa).toBe('01');
    expect(criada.chips).toEqual([{ texto: 'cresceu bem', tipo: 'qualidade' }]);
  });

  it('formata o tempo a partir dos minutos, e a tela não monta a string', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Feijoada',
      tempoMinutos: 220,
      custo: 62,
      nota: 3,
    });

    expect(criada.tempo).toBe('3h40');
  });

  /** É o que faz a tentativa numerar e a tira de evolução crescer. */
  it('o mesmo prato reaproveita o pratoId e numera a tentativa seguinte', async () => {
    const primeira = await criarExecucao(DONO_CRUD, {
      prato: 'Risoto de cogumelos',
      tempoMinutos: 55,
      custo: 38.4,
      nota: 2.5,
    });
    const segunda = await criarExecucao(DONO_CRUD, {
      prato: 'Risoto de cogumelos',
      tempoMinutos: 50,
      custo: 36,
      nota: 4,
    });

    expect(segunda.pratoId).toBe(primeira.pratoId);
    expect(primeira.tentativa).toBe('01');
    expect(segunda.tentativa).toBe('02');

    const prato = await buscarPrato(primeira.pratoId, DONO_CRUD);
    expect(prato?.tentativas).toBe(2);
    expect(prato?.evolucao).toEqual([2.5, 4]);
  });

  it('o nome do prato compara sem caixa nem acento', async () => {
    const comAcento = await criarExecucao(DONO_CRUD, {
      prato: 'Lasanha à bolonhesa',
      tempoMinutos: 90,
      custo: 44.7,
      nota: 4,
    });
    const semAcento = await criarExecucao(DONO_CRUD, {
      prato: 'lasanha a bolonhesa',
      tempoMinutos: 95,
      custo: 41,
      nota: 3,
    });

    expect(semAcento.pratoId).toBe(comAcento.pratoId);
    expect(semAcento.tentativa).toBe('02');
  });

  it('campo opcional vazio não cria chip', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Frango assado',
      tempoMinutos: 80,
      custo: 27.8,
      nota: 3.5,
      qualidade: '   ',
      defeito: '',
    });

    expect(criada.chips).toEqual([]);
  });

  it('entra no topo da listagem: é a execução mais recente', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Arroz de forno',
      tempoMinutos: 55,
      custo: 18.4,
      nota: 4,
      defeito: 'salgado demais',
    });

    const execucoes = await listarExecucoes(DONO_CRUD);

    expect(execucoes[0].id).toBe(criada.id);
  });
});

describe('atualizarExecucao', () => {
  it('troca nota, custo, tempo e chips, e a mudança é lida de volta', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Panqueca de carne',
      tempoMinutos: 60,
      custo: 23.1,
      nota: 3.5,
      defeito: 'massa grossa',
    });

    await atualizarExecucao(DONO_CRUD, criada.id, {
      tempoMinutos: 50,
      custo: 24.5,
      nota: 5,
      qualidade: 'massa fina',
    });

    const lida = await buscarExecucao(criada.id, DONO_CRUD);

    expect(lida?.nota).toBe(5);
    expect(lida?.custo).toBe(24.5);
    expect(lida?.tempo).toBe('50 min');
    expect(lida?.chips).toEqual([{ texto: 'massa fina', tipo: 'qualidade' }]);
  });

  /** Editar não move a execução de série nem a renumera. */
  it('preserva pratoId, tentativa, data e mês', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Strogonoff de frango',
      tempoMinutos: 45,
      custo: 31.2,
      nota: 3.5,
    });

    await atualizarExecucao(DONO_CRUD, criada.id, {
      tempoMinutos: 45,
      custo: 31.2,
      nota: 4.5,
    });

    const lida = await buscarExecucao(criada.id, DONO_CRUD);

    expect(lida?.pratoId).toBe(criada.pratoId);
    expect(lida?.tentativa).toBe(criada.tentativa);
    expect(lida?.data).toBe(criada.data);
    expect(lida?.mes).toBe(criada.mes);
  });

  it('devolve null para id desconhecido, sem gravar nada', async () => {
    await expect(
      atualizarExecucao(DONO_CRUD, 'nao-existe', { tempoMinutos: 10, custo: 1, nota: 1 }),
    ).resolves.toBeNull();
  });
});

describe('removerExecucao', () => {
  it('tira a execução da listagem, do histórico e dos pratos', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Torta de limão',
      tempoMinutos: 70,
      custo: 19.9,
      nota: 4,
    });

    await removerExecucao(DONO_CRUD, criada.id);

    await expect(buscarExecucao(criada.id, DONO_CRUD)).resolves.toBeNull();
    await expect(buscarPrato(criada.pratoId, DONO_CRUD)).resolves.toBeNull();

    const meses = await listarHistoricoPorMes(DONO_CRUD);
    const ids = meses.flatMap((mes) => mes.execucoes.map((execucao) => execucao.id));
    expect(ids).not.toContain(criada.id);
  });

  it('id desconhecido não estoura: a lista já não o tem', async () => {
    await expect(removerExecucao(DONO_CRUD, 'nao-existe')).resolves.toBeUndefined();
  });

  it('remover a última tentativa devolve o prato à contagem anterior', async () => {
    const primeira = await criarExecucao(DONO_CRUD, {
      prato: 'Bolo de cenoura',
      tempoMinutos: 80,
      custo: 11.5,
      nota: 2,
    });
    const segunda = await criarExecucao(DONO_CRUD, {
      prato: 'Bolo de cenoura',
      tempoMinutos: 65,
      custo: 12.8,
      nota: 4.5,
    });

    await removerExecucao(DONO_CRUD, segunda.id);

    const prato = await buscarPrato(primeira.pratoId, DONO_CRUD);
    expect(prato?.tentativas).toBe(1);
    expect(prato?.evolucao).toEqual([2]);
  });
});

/**
 * O que o enunciado chama de "recuperar ao reiniciar": uma leitura nova,
 * independente do objeto devolvido na gravação, traz o que foi gravado. O
 * reinício de verdade — fechar e reabrir o app — está no roteiro em emulador.
 */
describe('recuperação dos dados gravados', () => {
  it('uma leitura nova devolve o que a gravação guardou, campo por campo', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Canja de galinha',
      tempoMinutos: 95,
      custo: 21.75,
      nota: 4.5,
      qualidade: 'caldo no ponto',
      defeito: 'arroz passado',
    });

    const lida = await buscarExecucao(criada.id, DONO_CRUD);

    expect(lida).toEqual(criada);
    expect(lida?.tempo).toBe('1h35');
    expect(lida?.chips).toEqual([
      { texto: 'caldo no ponto', tipo: 'qualidade' },
      { texto: 'arroz passado', tipo: 'defeito' },
    ]);
  });

  it('as execuções de um dono não aparecem para outro', async () => {
    const criada = await criarExecucao(DONO_CRUD, {
      prato: 'Moqueca',
      tempoMinutos: 60,
      custo: 55,
      nota: 4,
    });

    await expect(buscarExecucao(criada.id, DONO)).resolves.toBeNull();
    await expect(buscarExecucao(criada.id, DONO_NOVO)).resolves.toBeNull();
  });
});

describe('os dados de exemplo seguem o que o projeto documenta', () => {
  it('são 21 execuções em 9 pratos, como o CLAUDE.md §10 define', () => {
    expect(EXECUCOES).toHaveLength(21);
    expect(new Set(EXECUCOES.map((execucao) => execucao.pratoId)).size).toBe(9);
  });

  it('o usuário de exemplo declara o mesmo total', () => {
    expect(USUARIO_EXEMPLO.totalExecucoes).toBe(EXECUCOES.length);
  });

  it('toda execução aponta para um prato, e o nome bate com o id', () => {
    const nomePorId = new Map<string, string>();

    EXECUCOES.forEach((execucao) => {
      expect(execucao.pratoId).toBeTruthy();
      const conhecido = nomePorId.get(execucao.pratoId);
      if (conhecido) expect(execucao.prato).toBe(conhecido);
      else nomePorId.set(execucao.pratoId, execucao.prato);
    });
  });

  it('as tentativas de um prato são sequenciais, sem buraco nem repetição', async () => {
    const pratos = await listarPratos(DONO);

    for (const prato of pratos) {
      const execucoes = await listarExecucoesDoPrato(prato.id, DONO);
      const numeros = execucoes.map((e) => Number(e.tentativa)).sort((a, b) => a - b);

      expect(numeros).toEqual(Array.from({ length: prato.tentativas }, (_, i) => i + 1));
    }
  });
});
