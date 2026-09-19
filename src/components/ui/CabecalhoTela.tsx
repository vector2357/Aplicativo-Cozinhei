import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { color, interacao, spacing, text, touch } from '@/theme';

/**
 * Grade e traço do desenho. Iguais aos dos ícones de aba, para que a seta
 * pese o mesmo que o resto da interface.
 *
 * A família completa de ícones (filtro, busca, editar, excluir) chega junto
 * das telas que vão precisar dela; até lá, esta seta vive aqui.
 */
const GRADE = 24;
const TRACO = 1.7;
const TAMANHO_SETA = 22;

type Props = {
  titulo: string;
  /**
   * Para onde o voltar leva, em caixa baixa: "início", "histórico". Entra no
   * rótulo de acessibilidade — "voltar para o histórico" diz mais que
   * "voltar". Omita quando a origem for variável.
   */
  origem?: string;
  /** Renderizado à direita do título: filtro, editar, o que a tela precisar. */
  acao?: ReactNode;
};

export function CabecalhoTela({ titulo, origem, acao }: Props) {
  const router = useRouter();

  return (
    <View style={estilos.cabecalho}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={origem ? `voltar para ${origem}` : 'voltar'}
        onPress={() => router.back()}
        style={({ pressed }) => [estilos.voltar, pressed && estilos.pressionado]}
      >
        <Svg
          testID="icone-voltar"
          width={TAMANHO_SETA}
          height={TAMANHO_SETA}
          viewBox={`0 0 ${GRADE} ${GRADE}`}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          fill="none"
          stroke={color.ink}
          strokeWidth={TRACO}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M14.5 5.2 7.7 12l6.8 6.8" />
        </Svg>
      </Pressable>

      <Text style={[text.screenTitle, estilos.titulo]} numberOfLines={1} accessibilityRole="header">
        {titulo}
      </Text>

      {acao ? <View style={estilos.acao}>{acao}</View> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  voltar: {
    width: touch.minTarget,
    height: touch.minTarget,
    // O ícone é menor que o alvo; a margem negativa devolve o título à margem
    // da tela sem que o alvo encolha.
    marginLeft: -11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: interacao.opacidadePressionado },
  titulo: { flex: 1, minWidth: 0 },
  acao: { marginRight: -8 },
});
