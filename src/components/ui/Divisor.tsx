import { StyleSheet, Text, View } from 'react-native';

import { color, spacing, text } from '@/theme';

export function Divisor({ rotulo }: { rotulo: string }) {
  return (
    <View style={estilos.linha} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={estilos.risco} />
      <Text style={text.overline}>{rotulo}</Text>
      <View style={estilos.risco} />
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: spacing.lg,
  },
  risco: { flex: 1, height: 1, backgroundColor: 'rgba(18,33,28,0.12)' },
});
