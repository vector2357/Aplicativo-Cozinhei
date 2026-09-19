import Svg, { Circle, Path } from 'react-native-svg';

import { color } from '@/theme';

/** Os ícones de ação disponíveis. Um nome por gesto, não por desenho. */
export const NOMES_ICONE = [
  'voltar',
  'fechar',
  'busca',
  'filtro',
  'editar',
  'excluir',
  'mais',
  'alerta',
  'certo',
] as const;

export type NomeIcone = (typeof NOMES_ICONE)[number];

/** Aresta padrão. Combina com a altura da linha de texto de corpo. */
export const TAMANHO_ICONE = 22;

/** Grade de desenho, igual à dos ícones de aba: área útil de 20 com 2 de folga. */
const GRADE = 24;

/** Peso do traço. O mesmo de `IconeAba`, para que os dois pesem igual na tela. */
const TRACO = 1.7;

type Props = {
  nome: NomeIcone;
  /** Aresta do quadrado. Varie com parcimônia: 22 é o tamanho do sistema. */
  tamanho?: number;
  /** Por padrão herda a tinta principal. */
  cor?: string;
};

export function Icone({ nome, tamanho = TAMANHO_ICONE, cor = color.ink }: Props) {
  return (
    <Svg
      testID={`icone-${nome}`}
      width={tamanho}
      height={tamanho}
      viewBox={`0 0 ${GRADE} ${GRADE}`}
      // Ícone é desenho: quem fala é o `accessibilityLabel` do controle que o
      // contém. Deixá-lo na árvore só acrescenta ruído à leitura.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      fill="none"
      stroke={cor}
      strokeWidth={TRACO}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {DESENHOS[nome](cor)}
    </Svg>
  );
}

/**
 * Um desenho por nome, todos em traço puro — nenhum preenchido.
 *
 * É o que os separa de `IconeAba`, que alterna contorno e sólido para dizer
 * qual aba está selecionada. Ícone de ação não tem estado: ele sempre
 * significa a mesma coisa, e quem muda de aparência é o controle em volta.
 */
const DESENHOS: Record<NomeIcone, (cor: string) => React.ReactNode> = {
  /** Seta para a esquerda. Retorno. */
  voltar: () => <Path d="M14.5 5.2 7.7 12l6.8 6.8" />,

  /** X. Fecha sem decidir nada — diferente de voltar, que desfaz um passo. */
  fechar: () => <Path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />,

  /** Lupa. */
  busca: (cor) => (
    <>
      <Circle cx={10.8} cy={10.8} r={6.2} stroke={cor} />
      <Path d="M15.4 15.4 20 20" />
    </>
  ),

  /** Funil. Recorta uma lista sem alterá-la. */
  filtro: () => <Path d="M4.2 5.4h15.6l-6.1 7v5.4l-3.4 1.8v-7.2z" />,

  /** Lápis. */
  editar: () => (
    <>
      <Path d="M15.6 4.6 19.4 8.4 8.6 19.2 4 20l.8-4.6z" />
      <Path d="M13.9 6.3l3.8 3.8" />
    </>
  ),

  /** Lixeira. Só aparece em ação destrutiva, e nunca perto da ação principal. */
  excluir: () => (
    <>
      <Path d="M4.8 6.6h14.4" />
      <Path d="M9.2 6.6V4.9a.9.9 0 0 1 .9-.9h3.8a.9.9 0 0 1 .9.9v1.7" />
      <Path d="M6.7 6.6l.9 12a1.2 1.2 0 0 0 1.2 1.1h6.4a1.2 1.2 0 0 0 1.2-1.1l.9-12" />
      <Path d="M10.4 10v6M13.6 10v6" />
    </>
  ),

  /** Cruz. Acrescentar um item. */
  mais: () => <Path d="M12 5.2v13.6M5.2 12h13.6" />,

  /**
   * Triângulo com exclamação. Erro e atenção.
   *
   * Existe por causa do daltonismo: vinho sozinho não distingue um estado de
   * erro para quem não separa vermelho de verde. A forma faz esse trabalho.
   */
  alerta: () => (
    <>
      <Path d="M12 4.3 21 19.4H3z" />
      <Path d="M12 9.8v4.2M12 16.6v.1" />
    </>
  ),

  /** Tique. Confirmação, sucesso, qualidade. O par do alerta. */
  certo: () => <Path d="M5 12.6 9.8 17.4 19 6.9" />,
};
