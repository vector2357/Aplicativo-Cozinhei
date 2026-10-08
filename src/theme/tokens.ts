// Paleta semântica. Os contrastes valem contra o fundo real e são testados.
export const color = {
  background: '#F2F3F0',
  surface: '#FFFFFF',
  /** Telas escuras: cronômetro, gravação, cartão de resumo. */
  backgroundDark: '#12211C',

  /** Texto principal. Também é o fundo escuro — mesma tinta. 14.9:1. */
  ink: '#12211C',
  /** Texto secundário sobre fundo claro. 5.2:1. */
  inkMuted: '#5F6862',
  /** Metadados sobre fundo claro. 5.0:1. */
  inkFaint: '#636A64',
  /** Texto de apoio em botões e chips neutros. 8.7:1. */
  inkSoft: '#3C4741',
  /** Caixa alta sobre fundo ESCURO. 6.1:1. Sobre fundo claro reprova. */
  stone: '#9A9E97',
  /** O par claro de `stone`. 4.5:1. */
  stoneOnLight: '#6A716B',
  /** Borda de controle marcável. 3.4:1 — piso de 3:1 pela WCAG 1.4.11. */
  borderControl: '#767E77',
  /** Aba não selecionada. 4.7:1. */
  tabInativa: '#6F766F',

  inkOnDark: '#F2F3F0',
  inkOnDarkMuted: '#DDE2DC',
  inkOnDarkFaint: '#B6BCB6',

  /** Estrelas, cronômetro ativo, ação principal. Texto por cima é sempre `ink`. */
  amber: '#E0A03B',
  amberSoft: 'rgba(224, 160, 59, 0.16)',
  amberInk: '#7A5316',

  /** Sempre defeito, erro, algo que deu errado. */
  wine: '#8C2F39',
  wineSoft: 'rgba(140, 47, 57, 0.12)',
  wineInk: '#7A2831',
  wineOnDark: '#E9A6AE',
  inkOnWine: '#F7EFEF',

  /** Sempre qualidade, acerto, algo que deu certo. */
  olive: '#5C7B4A',
  oliveSoft: 'rgba(92, 123, 74, 0.15)',
  oliveInk: '#3F5732',

  borderHairline: 'rgba(18, 33, 28, 0.09)',
  borderStrong: 'rgba(18, 33, 28, 0.14)',
  borderDashed: 'rgba(18, 33, 28, 0.22)',
  borderOnDark: 'rgba(242, 243, 240, 0.20)',

  // Trio próprio em vez de `opacity`, que derrubaria o contraste do texto. 5.2:1.
  inativoFundo: '#E3E5E1',
  inativoTexto: '#575F59',
  inativoBorda: '#C9CDC7',
  inativoTextoOnDark: '#868D87',

  /** Trilhas de gráfico, barras inativas, toggle desligado. */
  fillNeutral: 'rgba(18, 33, 28, 0.14)',
  fillSubtle: 'rgba(18, 33, 28, 0.05)',
  fillTrack: 'rgba(18, 33, 28, 0.06)',

  /** Overlay atrás dos bottom sheets. */
  scrim: 'rgba(18, 33, 28, 0.45)',

  placeholderA: '#E7E9E4',
  placeholderB: '#DDE0DA',
} as const;

// Escala de 4pt.
export const spacing = {
  xxs: 4,
  xs: 7,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  huge: 40,
  screenH: 20,
  /** Padding horizontal das telas de entrada. */
  screenHWide: 24,
  // Recuo do Android de três botões + a barra + respiro. Depende de `tabBarHeight`.
  scrollBottom: 136,
} as const;

export const radius = {
  chip: 11,
  /** Segmento do seletor e a pílula que corre atrás: os dois precisam ser iguais. */
  segmento: 10,
  field: 13,
  card: 14,
  cardLarge: 16,
  summary: 18,
  sheet: 26,
  fab: 22,
  tabBar: 20,
  pill: 999,
} as const;

// 44pt é piso: onde o visual é menor, cresça a área com hitSlop, nunca o alvo.
export const touch = {
  minTarget: 44,
  /** Botão de ação principal no rodapé. */
  primaryAction: 54,
  /** Pausar e finalizar no cronômetro. */
  kitchenMode: 84,
  field: 52,
  fabSize: 62,
  tabBarHeight: 72,
  // Vão morto entre alvos: o dedo cobre ~10pt além do ponto que a pessoa mira.
  deadSpace: 8,
} as const;

// Texto corrido não tem teto. Só põe teto onde o container não cresce junto.
export const escalaDeFonte = {
  /** Rótulo dentro de caixa de largura fixa. */
  emCaixaFixa: 1.3,
  /** Fatia de aba: quatro precisam caber com o vão do `+`. */
  emAba: 1.15,
} as const;

export const interacao = {
  /** Opacidade de qualquer superfície pressionada. Um valor só no app inteiro. */
  opacidadePressionado: 0.72,
  // O `+` encolhe em vez de esmaecer: clarear tiraria dele o âmbar que o marca.
  escalaPressionado: 0.96,
} as const;

// Só na barra de abas, no botão flutuante e nos sheets. Cartões usam borda.
export const shadow = {
  tabBar: {
    shadowColor: '#12211C',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  // Halo âmbar, sombra de contato e fio de luz. `elevation` é só ordem de pintura.
  fab: {
    boxShadow: [
      { offsetX: 0, offsetY: 12, blurRadius: 28, spreadDistance: -2, color: 'rgba(224,160,59,0.55)' },
      { offsetX: 0, offsetY: 6, blurRadius: 14, spreadDistance: -4, color: 'rgba(18,33,28,0.34)' },
      { offsetX: 0, offsetY: 1.5, blurRadius: 3, color: 'rgba(255,255,255,0.35)', inset: true },
      { offsetX: 0, offsetY: -2, blurRadius: 6, color: 'rgba(122,83,22,0.26)', inset: true },
    ],
    shadowColor: 'transparent',
    elevation: 10,
  },
  sheet: {
    shadowColor: '#12211C',
    shadowOpacity: 0.2,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16,
  },
  // Sem `elevation`: no Android ela sombrearia os quatro lados, inclusive o topo.
  cabecalho: {
    boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 6, color: 'rgba(18,33,28,0.10)' }],
  },
  segment: {
    shadowColor: '#12211C',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
} as const;

/** Par de cores de um chip. `defect` sempre vinho, `quality` sempre oliva. */
export const chipVariant = {
  quality: {
    background: color.oliveSoft,
    foreground: color.oliveInk,
    border: 'rgba(92,123,74,0.5)',
  },
  defect: {
    background: color.wineSoft,
    foreground: color.wineInk,
    border: 'rgba(140,47,57,0.45)',
  },
  neutral: {
    background: color.surface,
    foreground: color.inkSoft,
    border: color.borderStrong,
  },
  selected: {
    background: color.ink,
    foreground: color.inkOnDark,
    border: color.ink,
  },
} as const;

export type ChipVariant = keyof typeof chipVariant;

// Confiança de um campo preenchido pela IA, na tela de revisão (etapa futura).
export const aiConfidence = {
  heard: {
    border: 'rgba(92,123,74,0.45)',
    borderStyle: 'solid' as const,
    label: 'ouviu',
    labelColor: color.olive,
  },
  guess: {
    border: color.amber,
    borderStyle: 'dashed' as const,
    label: 'chute',
    labelColor: color.amberInk,
  },
} as const;
