import { StyleSheet, View, ViewProps } from 'react-native';

import { color, radius, spacing } from '@/theme';

export function Cartao({ style, ...props }: ViewProps) {
  return <View style={[estilos.cartao, style]} {...props} />;
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.card,
    padding: spacing.md,
  },
});
