import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReduzirMovimento } from '@/hooks/useReduzirMovimento';
import { color } from '@/theme';

const DURACAO_MS = 900;
/** Espessura do anel, proporcional ao tamanho pedido. */
const PROPORCAO_TRACO = 0.11;

type Props = {
  /** Aresta do anel. 36 é o tamanho de tela; 20 cabe dentro de um botão. */
  tamanho?: number;
  cor?: string;
  /** Anunciado ao leitor de tela. Silêncio durante espera parece travamento. */
  rotulo?: string;
};

export function Indicador({ tamanho = 36, cor = color.amber, rotulo = 'carregando' }: Props) {
  const reduzirMovimento = useReduzirMovimento();
  const giro = useSharedValue(0);

  useEffect(() => {
    if (reduzirMovimento) {
      giro.value = 0;
      return;
    }
    giro.value = 0;
    giro.value = withRepeat(
      withTiming(360, { duration: DURACAO_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduzirMovimento, giro]);

  const animado = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value}deg` }] }));
  const traco = Math.max(2, Math.round(tamanho * PROPORCAO_TRACO));

  return (
    <View
      testID="indicador"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={rotulo}
      style={{ width: tamanho, height: tamanho }}
    >
      <Animated.View
        style={[
          estilos.anel,
          {
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2,
            borderWidth: traco,
            borderColor: cor,
            // Um lado transparente é o que transforma o círculo em arco, e o
            // arco é o que deixa o giro visível.
            borderTopColor: 'transparent',
          },
          animado,
        ]}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  anel: { position: 'absolute' },
});
