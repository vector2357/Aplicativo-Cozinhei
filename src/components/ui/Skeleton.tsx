import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReduzirMovimento } from '@/hooks/useReduzirMovimento';
import { color, radius, spacing } from '@/theme';

/** Opacidade nos dois extremos do pulso, e o tempo de cada meia volta. */
const OPACIDADE_MIN = 0.55;
const OPACIDADE_MAX = 1;
const DURACAO_MS = 1100;

/** Parado, fica no meio do caminho: presente, sem chamar atenção. */
const OPACIDADE_PARADA = 0.75;

type PropsBloco = {
  largura?: number | `${number}%`;
  altura?: number;
  raio?: number;
  style?: ViewStyle;
};

export function Skeleton({ largura = '100%', altura = 14, raio = 6, style }: PropsBloco) {
  const reduzirMovimento = useReduzirMovimento();
  const opacidade = useSharedValue(OPACIDADE_PARADA);

  useEffect(() => {
    if (reduzirMovimento) {
      opacidade.value = OPACIDADE_PARADA;
      return;
    }
    opacidade.value = OPACIDADE_MIN;
    opacidade.value = withRepeat(
      withTiming(OPACIDADE_MAX, { duration: DURACAO_MS }),
      // -1 repete para sempre; `true` faz a volta, em vez de saltar ao início.
      -1,
      true,
    );
  }, [reduzirMovimento, opacidade]);

  const animado = useAnimatedStyle(() => ({ opacity: opacidade.value }));

  return (
    <Animated.View
      testID="skeleton"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        estilos.bloco,
        { width: largura, height: altura, borderRadius: raio },
        animado,
        style,
      ]}
    />
  );
}

type PropsFicha = {
  /** Quantas fichas desenhar. Use o número que a lista costuma mostrar. */
  quantidade?: number;
};

export function SkeletonFicha({ quantidade = 3 }: PropsFicha) {
  return (
    <View
      style={estilos.lista}
      accessible
      accessibilityLabel="carregando"
      accessibilityRole="progressbar"
    >
      {Array.from({ length: quantidade }, (_, indice) => (
        <View key={indice} style={estilos.ficha}>
          <Skeleton largura={56} altura={56} raio={10} />
          <View style={estilos.corpo}>
            <Skeleton largura="70%" altura={16} />
            <Skeleton largura="45%" altura={12} style={estilos.segundaLinha} />
          </View>
          <Skeleton largura={38} altura={14} />
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { backgroundColor: color.placeholderB },
  lista: { gap: spacing.sm },
  ficha: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  corpo: { flex: 1, minWidth: 0 },
  segundaLinha: { marginTop: spacing.xs },
});
