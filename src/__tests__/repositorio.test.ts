import {
  buscarExecucao,
  listarExecucoes,
  listarExecucoesRecentes,
  listarReceitasGuia,
  obterResumoDoMes,
} from '@/features/execucoes/repositorio';
import { EXECUCOES } from '@/features/execucoes/fixtures';

describe('buscarExecucao', () => {
  it('devolve a execução do id pedido', async () => {
    const execucao = await buscarExecucao('e1');

    expect(execucao?.id).toBe('e1');
    expect(execucao?.prato).toBe('Arroz de forno');
    expect(execucao?.tentativa).toBe('02');
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
