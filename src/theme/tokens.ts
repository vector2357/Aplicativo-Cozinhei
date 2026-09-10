/**
 * Cozinhei — design tokens
 * Fonte da verdade para cores, tipografia, espaçamento e raios.
 *
 * Regra de ouro: nenhum valor literal de cor ou tamanho no código de tela.
 * Se um valor não existe aqui, ele não deveria existir na interface.
 *
 * Espelha `local/design/tokens.ts`. A única adaptação é `fontFamily`, que usa
 * os nomes exportados pelos pacotes @expo-google-fonts (ver theme/fonts.ts).
 */

/* ------------------------------------------------------------------ *
 * COR
 *
 * A paleta é SEMÂNTICA. Vinho significa defeito e nada mais. Oliva
 * significa qualidade e nada mais. Âmbar aparece em exatamente três
 * lugares: estrelas de nota, cronômetro em contagem e a ação principal
 * de cada tela (uma por tela).
 * ------------------------------------------------------------------ */
export const color = {
  /** Fundo de todas as telas claras. */
  background: '#F2F3F0',
  /** Superfície de cartão/ficha sobre o fundo. */
  surface: '#FFFFFF',
  /** Fundo das telas escuras: cronômetro, gravação de áudio, cartão de resumo. */
  backgroundDark: '#12211C',

  /** Texto principal. Também é o fundo escuro — mesma tinta. */
  ink: '#12211C',
  /** Texto secundário sobre fundo claro. Contraste 7.1:1. */
  inkMuted: '#5F6862',
  /** Rótulos e metadados sobre fundo claro. Contraste 4.6:1. */
  inkFaint: '#6E756F',
  /** Texto de apoio em botões/chips neutros. */
  inkSoft: '#3C4741',
  /** Rótulos monoespaçados em caixa alta. Só para texto >= 14px ou não textual. */
  stone: '#9A9E97',
  /** Aba não selecionada na barra inferior. */
  tabInativa: '#8A918B',

  /** Texto principal sobre fundo escuro. */
  inkOnDark: '#F2F3F0',
  /** Texto secundário sobre fundo escuro. */
  inkOnDarkMuted: '#DDE2DC',
  /** Metadados sobre fundo escuro. */
  inkOnDarkFaint: '#B6BCB6',

  /**
   * Âmbar queimado. Estrelas, cronômetro ativo, ação principal.
   * Texto SOBRE âmbar é sempre `ink` — nunca branco.
   */
  amber: '#E0A03B',
  amberSoft: 'rgba(224, 160, 59, 0.16)',
  amberInk: '#7A5316',

  /** Vinho. SEMPRE defeito, erro, algo que deu errado. */
  wine: '#8C2F39',
  wineSoft: 'rgba(140, 47, 57, 0.12)',
  wineInk: '#7A2831',
  /** Vinho legível sobre fundo escuro. */
  wineOnDark: '#E9A6AE',
  inkOnWine: '#F7EFEF',

  /** Oliva. SEMPRE qualidade, acerto, algo que deu certo. */
  olive: '#5C7B4A',
  oliveSoft: 'rgba(92, 123, 74, 0.15)',
  oliveInk: '#3F5732',

  /** Bordas. hairline em cartões, strong em campos de formulário. */
  borderHairline: 'rgba(18, 33, 28, 0.09)',
  borderStrong: 'rgba(18, 33, 28, 0.14)',
  borderDashed: 'rgba(18, 33, 28, 0.22)',
  borderOnDark: 'rgba(242, 243, 240, 0.20)',

  /** Preenchimento neutro: trilhas de gráfico, barras inativas, toggle desligado. */
  fillNeutral: 'rgba(18, 33, 28, 0.14)',
  /** Fundo de área sutil: cartões de insight, segmented control. */
  fillSubtle: 'rgba(18, 33, 28, 0.05)',
  /** Trilho do segmented control. */
  fillTrack: 'rgba(18, 33, 28, 0.06)',

  /** Overlay atrás de bottom sheets. */
  scrim: 'rgba(18, 33, 28, 0.45)',

  /** Faixas do placeholder de mídia (as fotos reais ainda não existem). */
  placeholderA: '#E7E9E4',
  placeholderB: '#DDE0DA',
} as const;

/* ------------------------------------------------------------------ *
 * ESPAÇAMENTO — escala de 4pt.
 * ------------------------------------------------------------------ */
export const spacing = {
  xxs: 4,
  xs: 7,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  huge: 40,
  /** Padding horizontal de toda tela de conteúdo. */
  screenH: 20,
  /** Padding horizontal das telas de entrada (login/cadastro). */
  screenHWide: 24,
  /** Espaço livre no fim de uma lista rolável, sob a barra de abas. */
  scrollBottom: 120,
} as const;

/* ------------------------------------------------------------------ *
 * RAIO
 * ------------------------------------------------------------------ */
export const radius = {
  chip: 11,
  field: 13,
  card: 14,
  cardLarge: 16,
  summary: 18,
  sheet: 26,
  /** Botão flutuante e alvos quadrados grandes. */
  fab: 22,
  tabBar: 20,
  pill: 999,
} as const;

/* ------------------------------------------------------------------ *
 * ACESSIBILIDADE E TOQUE
 *
 * `minTarget` é rígido: 44pt é o piso de QUALQUER elemento tocável,
 * inclusive links de texto e botões de ícone. Onde o visual precisa ser
 * menor, aumente a área com hitSlop ou padding — nunca reduza o alvo.
 * ------------------------------------------------------------------ */
export const touch = {
  minTarget: 44,
  /** Botão de ação principal no rodapé. */
  primaryAction: 54,
  /** Pausar/finalizar no cronômetro. */
  kitchenMode: 84,
  /** Altura de campo de formulário. */
  field: 52,
  fabSize: 62,
  tabBarHeight: 64,
} as const;

/* ------------------------------------------------------------------ *
 * SOMBRA
 * Usada com parcimônia: barra de abas, botão flutuante e sheets.
 * Fichas e cartões usam borda hairline, não sombra.
 * ------------------------------------------------------------------ */
export const shadow = {
  tabBar: {
    shadowColor: '#12211C',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  /**
   * Botão flutuante de registrar — a única peça do app com sombra em camadas.
   *
   * Três camadas, cada uma com um trabalho:
   *   1. o halo âmbar, largo e difuso, descola o botão do fundo claro e
   *      mantém a identidade da cor;
   *   2. a sombra de contato, curta e escura, dá o peso — o halo sozinho
   *      deixa a peça parecendo adesivo colado na barra;
   *   3. o fio de luz por dentro da borda de cima dá o volume, sem clarear o
   *      âmbar nem introduzir uma quarta cor.
   *
   * `elevation` continua aqui pela ORDEM DE PINTURA no Android: a barra de
   * abas tem 6, e o `+` precisa ficar por cima dela. `shadowColor`
   * transparente desliga a sombra nativa da elevação, que sairia cinza por
   * baixo do halo e sujaria as camadas acima.
   */
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
  segment: {
    shadowColor: '#12211C',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
} as const;

/* ------------------------------------------------------------------ *
 * HELPERS DE DOMÍNIO
 * ------------------------------------------------------------------ */

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

/**
 * Confiança de um campo preenchido pela IA na tela de revisão (etapa futura).
 * `guess` exige borda tracejada E o motivo do chute visível ao lado.
 */
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
