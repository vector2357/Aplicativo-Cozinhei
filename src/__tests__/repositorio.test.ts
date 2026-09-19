import {
  buscarExecucao,
  buscarPrato,
  listarExecucoes,
  listarExecucoesDoPrato,
  listarExecucoesRecentes,
  listarHistoricoPorMes,
  listarPratos,
  listarReceitasGuia,
  obterEstatisticas,
  obterResumoDoMes,
} from '@/features/execucoes/repositorio';
import { EXECUCOES, MES_CORRENTE, USUARIO_EXEMPLO } from '@/features/execucoes/fixtures';

describe('buscarExecucao', () => {
  it('devolve a execução do id pedido', async () => {
    // Do próprio conjunto, para o teste não depender de qual prato é o
    // primeiro — isso muda quando os dados de exemplo crescem.
    const esperada = EXECUCOES[0];

    const execucao = await buscarExecucao(esperada.id);

    expect(execucao?.id).toBe(esperada.id);
    expect(execucao?.prato).toBe(esperada.prato);
    expect(execucao?.tentativa).toBe(esperada.tentativa);
  });

  /**
   * O id vem da rota, e rota é entrada externa: um deep link com id inválido
   * precisa cair num estado tratável, não derrubar a tela.
   */
  it('devolve null para id desconhecido, em vez de estourar', async () => {
    await expect(buscarExecucao('nao-existe')).resolves.toBeNull();
  });

  it('devolve null para id vazio', async () => {
    await expect(buscarExecucao('')).resolves.toBeNull();
  });

  it('é assíncrona: a etapa 04 busca isto na rede', () => {
    expect(buscarExecucao('e1')).toBeInstanceOf(Promise);
  });
});

describe('listagens', () => {
  it('listarExecucoes devolve todas as execuções', async () => {
    await expect(listarExecucoes()).resolves.toHaveLength(EXECUCOES.length);
  });

  it('listarExecucoesRecentes devolve um recorte das execuções', async () => {
    const recentes = await listarExecucoesRecentes();
    const todas = await listarExecucoes();

    expect(recentes.length).toBeGreaterThan(0);
    expect(recentes.length).toBeLessThanOrEqual(todas.length);
    recentes.forEach((execucao) => {
      expect(todas).toContainEqual(execucao);
    });
  });

  it('listarReceitasGuia devolve receitas com nome, tempo e fonte', async () => {
    const receitas = await listarReceitasGuia();

    expect(receitas.length).toBeGreaterThan(0);
    receitas.forEach((receita) => {
      expect(receita.id).toBeTruthy();
      expect(receita.nome).toBeTruthy();
      expect(receita.tempo).toBeTruthy();
      expect(receita.fonte).toBeTruthy();
    });
  });
});

describe('obterResumoDoMes', () => {
  it('devolve período, contagem, nota média e o insight em três partes', async () => {
    const resumo = await obterResumoDoMes();

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
});

describe('integridade dos dados que as telas consomem', () => {
  it('toda execução tem id único', async () => {
    const execucoes = await listarExecucoes();
    const ids = execucoes.map((execucao) => execucao.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda execução tem nota na faixa de 0 a 5 e tentativa com dois dígitos', async () => {
    const execucoes = await listarExecucoes();

    execucoes.forEach((execucao) => {
      expect(execucao.nota).toBeGreaterThanOrEqual(0);
      expect(execucao.nota).toBeLessThanOrEqual(5);
      expect(execucao.tentativa).toMatch(/^\d{2}$/);
    });
  });

  it('todo chip é qualidade ou defeito — não existe terceiro tipo', async () => {
    const execucoes = await listarExecucoes();

    execucoes.forEach((execucao) => {
      execucao.chips.forEach((chip) => {
        expect(['qualidade', 'defeito']).toContain(chip.tipo);
        expect(chip.texto).toBeTruthy();
      });
    });
  });
});

describe('listarHistoricoPorMes', () => {
  it('agrupa as execuções por mês, do mais recente ao mais antigo', async () => {
    const meses = await listarHistoricoPorMes();

    expect(meses.length).toBeGreaterThan(1);
    expect(meses[0].rotulo).toBe(EXECUCOES[0].mes);
    // Nenhum mês aparece duas vezes: seria sinal de agrupamento furado.
    const rotulos = meses.map((mes) => mes.rotulo);
    expect(new Set(rotulos).size).toBe(rotulos.length);
  });

  it('não perde nenhuma execução no caminho', async () => {
    const meses = await listarHistoricoPorMes();
    const total = meses.reduce((soma, mes) => soma + mes.execucoes.length, 0);

    expect(total).toBe(EXECUCOES.length);
  });

  it('toda execução de um grupo pertence àquele mês', async () => {
    const meses = await listarHistoricoPorMes();

    meses.forEach((mes) => {
      mes.execucoes.forEach((execucao) => {
        expect(execucao.mes).toBe(mes.rotulo);
      });
    });
  });

  it('conta nova não tem histórico', async () => {
    await expect(listarHistoricoPorMes('conta-nova')).resolves.toEqual([]);
  });
});

describe('listarPratos', () => {
  it('deriva um prato por pratoId distinto', async () => {
    const pratos = await listarPratos();
    const idsNasExecucoes = new Set(EXECUCOES.map((execucao) => execucao.pratoId));

    expect(pratos).toHaveLength(idsNasExecucoes.size);
  });

  it('conta as tentativas e tira a média das notas', async () => {
    const pratos = await listarPratos();

    pratos.forEach((prato) => {
      const suas = EXECUCOES.filter((execucao) => execucao.pratoId === prato.id);
      const media = suas.reduce((soma, e) => soma + e.nota, 0) / suas.length;

      expect(prato.tentativas).toBe(suas.length);
      expect(prato.notaMedia).toBeCloseTo(media, 5);
      expect(prato.evolucao).toHaveLength(suas.length);
    });
  });

  /**
   * A tira de evolução lê este vetor da esquerda para a direita. Se ele vier
   * invertido, a tela mostra a pessoa piorando quando ela melhorou.
   */
  it('a evolução vai da primeira tentativa para a última', async () => {
    const pratos = await listarPratos();
    const bolo = pratos.find((prato) => prato.nome === 'Bolo de cenoura');

    // Os dados de exemplo do projeto: 2,0 → 3,0 → 3,0 → 4,5.
    expect(bolo?.evolucao).toEqual([2, 3, 3, 4.5]);
  });

  it('ordena por quem foi repetido mais vezes', async () => {
    const pratos = await listarPratos();

    for (let i = 1; i < pratos.length; i++) {
      expect(pratos[i - 1].tentativas).toBeGreaterThanOrEqual(pratos[i].tentativas);
    }
  });

  it('aponta o defeito que mais volta, e só quando ele de fato volta', async () => {
    const pratos = await listarPratos();
    const bolo = pratos.find((prato) => prato.nome === 'Bolo de cenoura');
    const feijoada = pratos.find((prato) => prato.nome === 'Feijoada');

    expect(bolo?.defeitoRecorrente).toBe('massa crua no meio');
    // Uma execução só: não há o que ser recorrente.
    expect(feijoada?.defeitoRecorrente).toBeUndefined();
  });

  it('conta nova não tem pratos', async () => {
    await expect(listarPratos('conta-nova')).resolves.toEqual([]);
  });
});

describe('buscarPrato', () => {
  it('devolve o prato pedido, com a evolução montada', async () => {
    const pratos = await listarPratos();
    const alvo = pratos[0];

    const prato = await buscarPrato(alvo.id);

    expect(prato).toEqual(alvo);
  });

  it('devolve null para id desconhecido', async () => {
    await expect(buscarPrato('nao-existe')).resolves.toBeNull();
  });
});

describe('listarExecucoesDoPrato', () => {
  it('traz só as execuções daquele prato', async () => {
    const pratos = await listarPratos();
    const alvo = pratos[0];

    const execucoes = await listarExecucoesDoPrato(alvo.id);

    expect(execucoes).toHaveLength(alvo.tentativas);
    execucoes.forEach((execucao) => expect(execucao.pratoId).toBe(alvo.id));
  });
});

describe('obterResumoDoMes', () => {
  /**
   * Os números do cartão são contados, não escritos. Este teste existe para
   * que mexer na lista de execuções não deixe o cartão mentindo.
   */
  it('conta as execuções do mês corrente a partir dos dados', async () => {
    const doMes = EXECUCOES.filter((execucao) => execucao.mes === MES_CORRENTE);
    const media = doMes.reduce((soma, e) => soma + e.nota, 0) / doMes.length;

    const resumo = await obterResumoDoMes();

    expect(resumo.execucoes).toBe(doMes.length);
    expect(resumo.notaMedia).toBeCloseTo(media, 5);
  });

  it('conta nova tem resumo zerado, sem quebrar na divisão', async () => {
    const resumo = await obterResumoDoMes('conta-nova');

    expect(resumo.execucoes).toBe(0);
    expect(resumo.notaMedia).toBe(0);
    expect(Number.isNaN(resumo.notaMedia)).toBe(false);
  });
});

describe('obterEstatisticas', () => {
  it('soma execuções, pratos distintos, média e custo', async () => {
    const estatisticas = await obterEstatisticas();

    expect(estatisticas.execucoes).toBe(EXECUCOES.length);
    expect(estatisticas.pratos).toBe(new Set(EXECUCOES.map((e) => e.pratoId)).size);
    expect(estatisticas.custoTotal).toBeCloseTo(
      EXECUCOES.reduce((soma, e) => soma + e.custo, 0),
      5,
    );
  });

  it('conta nova zera tudo sem dividir por zero', async () => {
    const estatisticas = await obterEstatisticas('conta-nova');

    expect(estatisticas).toEqual({ execucoes: 0, pratos: 0, notaMedia: 0, custoTotal: 0 });
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
    const pratos = await listarPratos();

    for (const prato of pratos) {
      const execucoes = await listarExecucoesDoPrato(prato.id);
      const numeros = execucoes.map((e) => Number(e.tentativa)).sort((a, b) => a - b);

      expect(numeros).toEqual(Array.from({ length: prato.tentativas }, (_, i) => i + 1));
    }
  });
});
