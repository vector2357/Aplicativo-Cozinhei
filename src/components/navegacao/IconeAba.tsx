import Svg, { Circle, Path } from 'react-native-svg';

import { color } from '@/theme';

/** As quatro abas navegáveis. O `+` central não é aba e não entra aqui. */
export const NOMES_ICONE_ABA = ['inicio', 'historico', 'pratos', 'perfil'] as const;

export type NomeIconeAba = (typeof NOMES_ICONE_ABA)[number];

/**
 * Aresta do ícone na barra. Acima dos 18pt da forma geométrica antiga porque
 * contorno lê menor que sólido — e ainda cabe com folga na aba, que tem 62pt
 * de altura: 24 do ícone + 6 do respiro + 17 da linha do rótulo = 47pt.
 */
export const TAMANHO_ICONE_ABA = 24;

/** Grade de desenho. Área útil de 20pt, com 2pt de folga em cada borda. */
const GRADE = 24;

/** Peso do traço no contorno. O mesmo nos quatro, para que pesem igual. */
const TRACO = 1.7;

type Props = {
  nome: NomeIconeAba;
  /** Aba selecionada: o ícone passa de contorno a sólido. */
  ativo?: boolean;
  /** Aresta do quadrado. Igual para os quatro — não varie por ícone. */
  tamanho?: number;
  /**
   * Cor da superfície atrás do ícone. Só o `historico` usa: os marcos da linha
   * do tempo são vazados sobre o trilho, e vazar exige saber o que há atrás.
   */
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
      // O ícone é redundante com o rótulo logo abaixo e com o
      // `accessibilityLabel` da aba: para o leitor de tela ele é ruído.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      // Refletem o estado no elemento raiz — é por aqui que o teste verifica
      // que tocar na aba de fato troca contorno por sólido.
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

/**
 * Um desenho por aba. Cada um recebe os mesmos argumentos e usa o MESMO
 * caminho nos dois estados — trocam-se preenchimento e traço, nunca a
 * geometria.
 *
 * `início` e `pratos` são um caminho só, com `evenodd`: a porta da casa e o
 * centro do prato são buracos de verdade, não uma forma pintada da cor do
 * fundo. Assim o sólido funciona sobre qualquer superfície.
 */
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

  /** Linha do tempo: trilho vertical, três marcos e o que cada marco registra. */
  historico: ({ ativo, cor, corDeFundo }) => (
    <>
      {/* O trilho e as linhas são traço nos dois estados: linha não se preenche. */}
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
