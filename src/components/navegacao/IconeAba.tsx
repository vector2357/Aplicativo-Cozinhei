import Svg, { Circle, Path } from 'react-native-svg';

import { color } from '@/theme';

/** As quatro abas navegáveis. O `+` central não é aba e não entra aqui. */
export const NOMES_ICONE_ABA = ['inicio', 'historico', 'pratos', 'perfil'] as const;

export type NomeIconeAba = (typeof NOMES_ICONE_ABA)[number];

/** 24, e não 18: contorno lê menor que sólido, e ainda cabe na aba de 62pt. */
export const TAMANHO_ICONE_ABA = 24;

/** Área útil de 20pt, com 2pt de folga em cada borda. */
const GRADE = 24;

/** O mesmo nos quatro, para que pesem igual. */
const TRACO = 1.7;

type Props = {
  nome: NomeIconeAba;
  /** Aba selecionada: o ícone passa de contorno a sólido. */
  ativo?: boolean;
  tamanho?: number;
  /** Só o `historico` usa: vazar os marcos exige saber o que há atrás. */
  corDeFundo?: string;
};

export function IconeAba({
  nome,
  ativo = false,
  tamanho = TAMANHO_ICONE_ABA,
  corDeFundo = color.surface,
}: Props) {
  const cor = ativo ? color.ink : color.tabInativa;

  return (
    <Svg
      testID={`icone-aba-${nome}`}
      width={tamanho}
      height={tamanho}
      viewBox={`0 0 ${GRADE} ${GRADE}`}
      // Redundante com o rótulo logo abaixo e com o rótulo da aba.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      // O estado no elemento raiz é o que o teste verifica.
      fill={ativo ? cor : 'none'}
      stroke={cor}
      strokeWidth={TRACO}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {DESENHOS[nome]({ ativo, cor, corDeFundo })}
    </Svg>
  );
}

type ArgsDesenho = { ativo: boolean; cor: string; corDeFundo: string };

// Mesma geometria nos dois estados: trocam-se só o preenchimento e o traço.
const DESENHOS: Record<NomeIconeAba, (args: ArgsDesenho) => React.ReactNode> = {
  /** Casa, com a porta vazada. */
  inicio: ({ ativo, cor }) => (
    <Path
      d="M3.6 10.4 12 3.6l8.4 6.8v8.4a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6z
         M9.6 20.4v-5.6h4.8v5.6z"
      fillRule="evenodd"
      fill={ativo ? cor : 'none'}
      stroke={ativo ? 'none' : cor}
    />
  ),

  /** Linha do tempo: trilho vertical, três marcos e o que cada um registra. */
  historico: ({ ativo, cor, corDeFundo }) => (
    <>
      {/* Traço nos dois estados: linha não se preenche. */}
      <Path d="M6.4 4.7v14.6M11.2 7.6h9.2M11.2 12h6.8M11.2 16.4h8.4" fill="none" stroke={cor} />
      {MARCOS.map((cy) => (
        <Circle
          key={cy}
          cx={6.4}
          cy={cy}
          r={2.05}
          // Vazado sobre o trilho quando inativo; cheio quando selecionado.
          fill={ativo ? cor : corDeFundo}
          stroke={cor}
        />
      ))}
    </>
  ),

  /** Prato visto de cima: aro externo e o fundo do prato. */
  pratos: ({ ativo, cor }) => (
    <Path
      d="M12 3.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 1 0 0-16.6z
         M12 7.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 1 0 0-8.8z"
      fillRule="evenodd"
      fill={ativo ? cor : 'none'}
      stroke={ativo ? 'none' : cor}
    />
  ),

  /** Pessoa: cabeça e ombros. */
  perfil: ({ ativo, cor }) => (
    <>
      <Circle cx={12} cy={8.2} r={3.7} fill={ativo ? cor : 'none'} stroke={ativo ? 'none' : cor} />
      {/* Aberto no contorno; fechado pela base quando preenchido. */}
      <Path
        d="M4.9 20.4c0-3.92 3.18-7.1 7.1-7.1s7.1 3.18 7.1 7.1"
        fill={ativo ? cor : 'none'}
        stroke={ativo ? 'none' : cor}
      />
    </>
  ),
};

/** Altura dos três marcos da linha do tempo, sobre o trilho. */
const MARCOS = [7.6, 12, 16.4] as const;
