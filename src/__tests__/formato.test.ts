import {
  dataPorExtenso,
  estrelas,
  formatarMoeda,
  formatarNota,
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
    // O separador de milhar do pt-BR é um espaço não separável em algumas
    // versões do ICU; normalizamos para comparar só os dígitos.
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
