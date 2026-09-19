import { StyleSheet, Text, View } from 'react-native';

import { color, fontFamily } from '@/theme';

export function MarcaGoogle({ tamanho = 24 }: { tamanho?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        estilos.circulo,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
      ]}
    >
      <Text style={[estilos.letra, { fontSize: Math.round(tamanho * 0.58) }]}>G</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    borderWidth: 1,
    borderColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: { fontFamily: fontFamily.display, color: color.ink },
});
