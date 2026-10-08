import { color } from '@/theme';

// A fórmula, direto da especificação.

/** Canal sRGB de 0–255 para luminância linear. */
function canalLinear(valor: number): number {
  const proporcao = valor / 255;
  return proporcao <= 0.03928
    ? proporcao / 12.92
    : ((proporcao + 0.055) / 1.055) ** 2.4;
}

/** Luminância relativa de uma cor `#RRGGBB`. */
function luminancia(hex: string): number {
  const limpo = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => canalLinear(parseInt(limpo.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores opacas. Vai de 1:1 a 21:1. */
export function razaoDeContraste(umaCor: string, outraCor: string): number {
  const [clara, escura] = [luminancia(umaCor), luminancia(outraCor)].sort((a, b) => b - a);
  return (clara + 0.05) / (escura + 0.05);
}

// Os pares que o app de fato desenha.

const PISO_TEXTO_NORMAL = 4.5;
const PISO_TEXTO_GRANDE = 3;
const PISO_COMPONENTE = 3;

type Par = {
  /** Onde a cor aparece, em português, para a falha ser legível. */
  uso: string;
  frente: string;
  fundo: string;
  piso: number;
};

/** Texto pequeno sobre fundo claro — o grupo mais exigente, e o que falhava. */
const TEXTO_SOBRE_CLARO: Par[] = [
  { uso: 'texto principal', frente: color.ink, fundo: color.background, piso: PISO_TEXTO_NORMAL },
  { uso: 'texto secundário (bodyMuted)', frente: color.inkMuted, fundo: color.background, piso: PISO_TEXTO_NORMAL },
  { uso: 'metadado e mensagem de erro (dataMeta)', frente: color.inkFaint, fundo: color.background, piso: PISO_TEXTO_NORMAL },
  { uso: 'texto de apoio (termos, chip neutro)', frente: color.inkSoft, fundo: color.background, piso: PISO_TEXTO_NORMAL },
  { uso: 'rótulo em caixa alta (overline)', frente: color.stoneOnLight, fundo: color.background, piso: PISO_TEXTO_NORMAL },
  { uso: 'link "esqueci minha senha"', frente: color.wine, fundo: color.background, piso: PISO_TEXTO_NORMAL },
  { uso: 'mensagem de erro do campo', frente: color.wineInk, fundo: color.background, piso: PISO_TEXTO_NORMAL },
];

/** Texto sobre superfície branca: dentro de cartão, campo e barra de abas. */
const TEXTO_SOBRE_SUPERFICIE: Par[] = [
  { uso: 'texto em cartão', frente: color.ink, fundo: color.surface, piso: PISO_TEXTO_NORMAL },
  { uso: 'rótulo da aba não selecionada', frente: color.tabInativa, fundo: color.surface, piso: PISO_TEXTO_NORMAL },
  { uso: 'metadado em cartão', frente: color.inkFaint, fundo: color.surface, piso: PISO_TEXTO_NORMAL },
  { uso: 'nome de conta no sheet', frente: color.inkSoft, fundo: color.surface, piso: PISO_TEXTO_NORMAL },
  { uso: 'placeholder de campo', frente: color.stoneOnLight, fundo: color.surface, piso: PISO_TEXTO_NORMAL },
  // O par que faltava: âmbar puro sobre branco marca 2.27:1.
  { uso: 'glifos das estrelas', frente: color.amberInk, fundo: color.surface, piso: PISO_TEXTO_NORMAL },
  { uso: 'métrica de painel claro', frente: color.ink, fundo: color.surface, piso: PISO_TEXTO_NORMAL },
];

/** Controle desabilitado. */
const TEXTO_DESABILITADO: Par[] = [
  { uso: 'texto de botão desabilitado', frente: color.inativoTexto, fundo: color.inativoFundo, piso: PISO_TEXTO_NORMAL },
  { uso: 'link desabilitado sobre o fundo claro', frente: color.inativoTexto, fundo: color.background, piso: PISO_TEXTO_NORMAL },
  { uso: 'botão desabilitado sobre fundo escuro', frente: color.inativoTextoOnDark, fundo: color.backgroundDark, piso: PISO_TEXTO_NORMAL },
];

/** Texto sobre o aviso de rodapé, que tem fundo próprio por tom. */
const TEXTO_EM_AVISO: Par[] = [
  { uso: 'aviso de sucesso', frente: color.inkOnDark, fundo: color.oliveInk, piso: PISO_TEXTO_NORMAL },
  { uso: 'aviso de erro', frente: color.inkOnWine, fundo: color.wine, piso: PISO_TEXTO_NORMAL },
  { uso: 'aviso neutro', frente: color.inkOnDark, fundo: color.ink, piso: PISO_TEXTO_NORMAL },
];

/** Texto sobre o fundo escuro: cartão de resumo, gravação e cronômetro. */
const TEXTO_SOBRE_ESCURO: Par[] = [
  { uso: 'texto principal no escuro', frente: color.inkOnDark, fundo: color.backgroundDark, piso: PISO_TEXTO_NORMAL },
  { uso: 'insight do resumo do mês', frente: color.inkOnDarkMuted, fundo: color.backgroundDark, piso: PISO_TEXTO_NORMAL },
  { uso: 'legenda das métricas', frente: color.inkOnDarkFaint, fundo: color.backgroundDark, piso: PISO_TEXTO_NORMAL },
  { uso: 'período do resumo (overline no escuro)', frente: color.stone, fundo: color.backgroundDark, piso: PISO_TEXTO_NORMAL },
  { uso: 'defeito citado no insight', frente: color.wineOnDark, fundo: color.backgroundDark, piso: PISO_TEXTO_NORMAL },
];

/** Texto grande: métricas do resumo e o texto sobre a ação âmbar. */
const TEXTO_GRANDE: Par[] = [
  { uso: 'nota média em âmbar (40px)', frente: color.amber, fundo: color.backgroundDark, piso: PISO_TEXTO_GRANDE },
  { uso: 'texto do botão principal sobre âmbar', frente: color.ink, fundo: color.amber, piso: PISO_TEXTO_GRANDE },
];

/** Chips: a cor do texto contra o próprio fundo do chip, já achatado. */
const TEXTO_EM_CHIP: Par[] = [
  { uso: 'chip de qualidade', frente: color.oliveInk, fundo: '#E4E9E0', piso: PISO_TEXTO_NORMAL },
  { uso: 'chip de defeito', frente: color.wineInk, fundo: '#EDE0E1', piso: PISO_TEXTO_NORMAL },
];

/** Componentes não textuais. */
const COMPONENTES: Par[] = [
  { uso: 'anel do botão de registrar', frente: color.ink, fundo: color.background, piso: PISO_COMPONENTE },
  // A caixa dos termos é marcável, e quando está desmarcada a borda é a única coisa que a desenha.
  { uso: 'borda da caixa de termos', frente: color.borderControl, fundo: color.surface, piso: PISO_COMPONENTE },
  { uso: 'borda de campo de formulário', frente: '#DDE0DC', fundo: color.surface, piso: 1.3 },
  // Não precisa gritar: precisa ser visivelmente outra superfície.
  { uso: 'superfície de controle desabilitado', frente: color.inativoFundo, fundo: color.background, piso: 1.1 },
  { uso: 'borda de controle desabilitado', frente: color.inativoBorda, fundo: color.background, piso: 1.3 },
];

function verificar(grupo: string, pares: Par[]) {
  describe(grupo, () => {
    it.each(pares)('$uso fecha o mínimo exigido', ({ uso, frente, fundo, piso }) => {
      const razao = razaoDeContraste(frente, fundo);
      // A mensagem entra no relatório de falha: quem quebrar vê o número.
      expect({ uso, razao: Number(razao.toFixed(2)) }).toMatchObject({
        razao: expect.any(Number),
      });
      expect(razao).toBeGreaterThanOrEqual(piso);
    });
  });
}

describe('contraste da paleta (WCAG 2.1 AA)', () => {
  verificar('texto sobre fundo claro', TEXTO_SOBRE_CLARO);
  verificar('texto sobre superfície branca', TEXTO_SOBRE_SUPERFICIE);
  verificar('texto sobre fundo escuro', TEXTO_SOBRE_ESCURO);
  verificar('texto grande', TEXTO_GRANDE);
  verificar('texto em chip', TEXTO_EM_CHIP);
  verificar('controle desabilitado', TEXTO_DESABILITADO);
  verificar('aviso de rodapé', TEXTO_EM_AVISO);
  verificar('componentes não textuais', COMPONENTES);

  describe('a fórmula', () => {
    it('devolve 21:1 entre preto e branco, e 1:1 entre iguais', () => {
      expect(razaoDeContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
      expect(razaoDeContraste('#12211C', '#12211C')).toBeCloseTo(1, 5);
    });

    it('não depende da ordem dos argumentos', () => {
      const ida = razaoDeContraste(color.ink, color.background);
      const volta = razaoDeContraste(color.background, color.ink);
      expect(ida).toBeCloseTo(volta, 10);
    });
  });

  /** O âmbar vive sobre fundo escuro ou como superfície — nunca como texto no claro. */
describe('o âmbar sabe onde pode aparecer', () => {
  it('sobre fundo escuro, serve como texto', () => {
    expect(razaoDeContraste(color.amber, color.backgroundDark)).toBeGreaterThanOrEqual(4.5);
  });

  it('sobre superfície clara, NÃO serve — use amberInk', () => {
    expect(razaoDeContraste(color.amber, color.surface)).toBeLessThan(3);
    expect(razaoDeContraste(color.amberInk, color.surface)).toBeGreaterThanOrEqual(4.5);
  });
});

/** Uma cor só não serve aos dois fundos; unificar os tokens reprovaria um lado. */
describe('tokens de dupla face', () => {
    it('stone serve ao fundo escuro e reprovaria no claro', () => {
      expect(razaoDeContraste(color.stone, color.backgroundDark)).toBeGreaterThanOrEqual(4.5);
      expect(razaoDeContraste(color.stone, color.background)).toBeLessThan(4.5);
    });

    it('stoneOnLight serve ao fundo claro', () => {
      expect(razaoDeContraste(color.stoneOnLight, color.background)).toBeGreaterThanOrEqual(4.5);
    });

    it('são cores diferentes — unificar reprovaria um dos lados', () => {
      expect(color.stone).not.toBe(color.stoneOnLight);
    });
  });
});
