/**
 * Placeholder listrado no lugar de foto ou vídeo.
 *
 * Pendência de design conhecida (README de design, seção 11): as fotos reais
 * ainda não existem, então toda mídia no app é este padrão diagonal. Quando
 * a fotografia entrar, este componente vira o fallback de carregamento.
 *
 * React Native não tem `repeating-linear-gradient`; as faixas são Views
 * rotacionadas dentro de um contêiner com `overflow: hidden`.
 */
import { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { color } from '@/theme';

const LARGURA_FAIXA = 6;

type Props = {
  largura?: number | `${number}%`;
  altura: number;
  raio?: number;
  style?: ViewStyle;
};

export function MidiaPlaceholder({ largura = '100%', altura, raio = 10, style }: Props) {
  // A diagonal exige faixas mais longas que a caixa; 2x a maior dimensão cobre
  // qualquer proporção sem deixar canto vazio.
  const faixas = useMemo(() => {
    const alcance = altura * 2 + 200;
    const total = Math.ceil(alcance / (LARGURA_FAIXA * 2));
    return Array.from({ length: total }, (_, i) => i * LARGURA_FAIXA * 2 - alcance / 2);
  }, [altura]);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        estilos.caixa,
        { width: largura, height: altura, borderRadius: raio },
        style,
      ]}
    >
      {faixas.map((deslocamento) => (
        <View
          key={deslocamento}
          style={[estilos.faixa, { height: altura * 2 + 200, left: deslocamento }]}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    backgroundColor: color.placeholderA,
    overflow: 'hidden',
  },
  faixa: {
    position: 'absolute',
    top: -100,
    width: LARGURA_FAIXA,
    backgroundColor: color.placeholderB,
    transform: [{ rotate: '45deg' }],
  },
});
