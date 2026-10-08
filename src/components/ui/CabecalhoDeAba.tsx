import { StyleSheet, Text, View } from 'react-native';

import { color, shadow, spacing, text } from '@/theme';

type Props = {
  titulo: string;
};

export function CabecalhoDeAba({ titulo }: Props) {
  return (
    <View style={estilos.cabecalho}>
      <Text style={text.screenTitle} accessibilityRole="header">
        {titulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  // Como o `CabecalhoTela`, menos o voltar: aba não tem de onde voltar.
  cabecalho: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    backgroundColor: color.background,
    zIndex: 1,
    ...shadow.cabecalho,
  },
});
