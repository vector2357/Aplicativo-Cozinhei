import {
  dataPorExtenso,
  estrelas,
  formatarDataCurta,
  formatarMes,
  formatarMoeda,
  formatarNota,
  formatarTempo,
  formatarTentativa,
} from '@/utils/formato';

describe('formatarNota', () => {
  it('usa vírgula e sempre uma casa decimal', () => {
    expect(formatarNota(4.5)).toBe('4,5');
    expect(formatarNota(3)).toBe('3,0');
  });
});

describe('formatarMoeda', () => {
  it('formata em reais com duas casas', () => {
    // O separador de milhar do pt-BR é um espaço não separável em algumas versões do ICU.
    expect(formatarMoeda(12.8).replace(/\s/g, ' ')).toBe('R$ 12,80');
    expect(formatarMoeda(62).replace(/\s/g, ' ')).toBe('R$ 62,00');
  });
});

describe('formatarTentativa', () => {
  it('sempre usa dois dígitos', () => {
    expect(formatarTentativa(4)).toBe('04');
    expect(formatarTentativa(12)).toBe('12');
  });
});

describe('estrelas', () => {
  it('devolve sempre cinco glifos, arredondando a nota', () => {
    expect(estrelas(4.5)).toBe('★★★★★');
    expect(estrelas(4)).toBe('★★★★☆');
    expect(estrelas(2.5)).toBe('★★★☆☆');
    expect(estrelas(0)).toBe('☆☆☆☆☆');
  });

  it('não estoura com nota fora da faixa', () => {
    expect(estrelas(9)).toHaveLength(5);
    expect(estrelas(-1)).toBe('☆☆☆☆☆');
  });
});

describe('dataPorExtenso', () => {
  it('escreve o dia da semana sem o sufixo "-feira"', () => {
    // 26/08/2026 é uma quarta-feira.
    expect(dataPorExtenso(new Date(2026, 7, 26))).toBe('quarta, 26 de agosto');
  });
});

describe('formatarTempo', () => {
  it('abaixo de uma hora fica em minutos', () => {
    expect(formatarTempo(45)).toBe('45 min');
    expect(formatarTempo(59)).toBe('59 min');
  });

  /** Os dois dígitos do resto são o que mantém a leitura da coluna alinhada. */
  it('a partir de uma hora usa o formato "1h05"', () => {
    expect(formatarTempo(65)).toBe('1h05');
    expect(formatarTempo(220)).toBe('3h40');
    expect(formatarTempo(95)).toBe('1h35');
  });

  it('hora cheia não leva os minutos', () => {
    expect(formatarTempo(60)).toBe('1h');
    expect(formatarTempo(120)).toBe('2h');
  });

  it('não devolve tempo negativo: o campo é entrada de usuário', () => {
    expect(formatarTempo(-10)).toBe('0 min');
    expect(formatarTempo(0)).toBe('0 min');
  });
});

describe('formatarDataCurta', () => {
  it('escreve dia com dois dígitos e mês abreviado em três letras', () => {
    expect(formatarDataCurta(new Date(2026, 7, 19))).toBe('19 ago');
    expect(formatarDataCurta(new Date(2026, 7, 3))).toBe('03 ago');
    expect(formatarDataCurta(new Date(2026, 3, 26))).toBe('26 abr');
  });

  /** Março abreviado perde a cedilha junto com as letras, e é "mar" mesmo. */
  it('abrevia março sem acento', () => {
    expect(formatarDataCurta(new Date(2026, 2, 1))).toBe('01 mar');
  });
});

describe('formatarMes', () => {
  it('escreve o rótulo que o histórico usa para agrupar', () => {
    expect(formatarMes(new Date(2026, 7, 19))).toBe('agosto de 2026');
    expect(formatarMes(new Date(2026, 0, 1))).toBe('janeiro de 2026');
  });

  /** O `mes` guardado na execução tem de bater com este formato. */
  it('casa com o que os dados de exemplo guardam', () => {
    expect(formatarMes(new Date(2026, 3, 12))).toBe('abril de 2026');
  });
});
