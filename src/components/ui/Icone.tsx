import Svg, { Circle, Path } from 'react-native-svg';

import { color } from '@/theme';

/** Um nome por gesto, não por desenho. */
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
  'olho',
  'olho-fechado',
] as const;

export type NomeIcone = (typeof NOMES_ICONE)[number];

export const TAMANHO_ICONE = 22;

/** Área útil de 20, com 2 de folga em cada borda. */
const GRADE = 24;

/** O mesmo peso de `IconeAba`, para os dois pesarem igual na tela. */
const TRACO = 1.7;

type Props = {
  nome: NomeIcone;
  tamanho?: number;
  cor?: string;
};

export function Icone({ nome, tamanho = TAMANHO_ICONE, cor = color.ink }: Props) {
  return (
    <Svg
      testID={`icone-${nome}`}
      width={tamanho}
      height={tamanho}
      viewBox={`0 0 ${GRADE} ${GRADE}`}
      // Ícone é desenho: quem fala é o rótulo do controle que o contém.
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

// Todos em traço puro: quem muda de aparência é o controle em volta, não o ícone.
const DESENHOS: Record<NomeIcone, (cor: string) => React.ReactNode> = {
  voltar: () => <Path d="M14.5 5.2 7.7 12l6.8 6.8" />,

  // Um desenho só com um traço a mais: o controle alterna, não troca de função.
  olho: () => (
    <>
      <Path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <Circle cx={12} cy={12} r={2.9} />
    </>
  ),

  'olho-fechado': () => (
    <>
      <Path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <Circle cx={12} cy={12} r={2.9} />
      <Path d="M4.3 4.3 19.7 19.7" />
    </>
  ),

  /** Fecha sem decidir nada — diferente de voltar, que desfaz um passo. */
  fechar: () => <Path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />,

  busca: (cor) => (
    <>
      <Circle cx={10.8} cy={10.8} r={6.2} stroke={cor} />
      <Path d="M15.4 15.4 20 20" />
    </>
  ),

  filtro: () => <Path d="M4.2 5.4h15.6l-6.1 7v5.4l-3.4 1.8v-7.2z" />,

  editar: () => (
    <>
      <Path d="M15.6 4.6 19.4 8.4 8.6 19.2 4 20l.8-4.6z" />
      <Path d="M13.9 6.3l3.8 3.8" />
    </>
  ),

  /** Só em ação destrutiva, e nunca perto da ação principal. */
  excluir: () => (
    <>
      <Path d="M4.8 6.6h14.4" />
      <Path d="M9.2 6.6V4.9a.9.9 0 0 1 .9-.9h3.8a.9.9 0 0 1 .9.9v1.7" />
      <Path d="M6.7 6.6l.9 12a1.2 1.2 0 0 0 1.2 1.1h6.4a1.2 1.2 0 0 0 1.2-1.1l.9-12" />
      <Path d="M10.4 10v6M13.6 10v6" />
    </>
  ),

  mais: () => <Path d="M12 5.2v13.6M5.2 12h13.6" />,

  // Existe por causa do daltonismo: a forma distingue o que o vinho não distingue.
  alerta: () => (
    <>
      <Path d="M12 4.3 21 19.4H3z" />
      <Path d="M12 9.8v4.2M12 16.6v.1" />
    </>
  ),

  /** O par do alerta: confirmação, sucesso, qualidade. */
  certo: () => <Path d="M5 12.6 9.8 17.4 19 6.9" />,
};
