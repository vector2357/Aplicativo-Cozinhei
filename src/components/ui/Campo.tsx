/**
 * Campo de texto com rótulo em caixa alta monoespaçada.
 *
 * O rótulo é `overline` (DM Mono, tracking largo) porque marca um dado, não
 * uma frase. A dica opcional abaixo do campo também é mono — é instrução
 * sobre o formato do dado, como "use 8 caracteres ou mais".
 */
import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { color, radius, spacing, text, touch } from '@/theme';

type Props = TextInputProps & {
  rotulo: string;
  /** Texto de ajuda abaixo do campo. */
  dica?: string;
  /** Mensagem de erro. Substitui a dica e pinta a borda de vinho. */
  erro?: string;
  containerStyle?: ViewStyle;
};

export const Campo = forwardRef<TextInput, Props>(function Campo(
  { rotulo, dica, erro, containerStyle, style, ...props },
  ref,
) {
  return (
    <View style={containerStyle}>
      <Text style={[text.overline, estilos.rotulo]}>{rotulo}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={rotulo}
        placeholderTextColor={color.stone}
        style={[estilos.campo, text.field, erro ? estilos.campoComErro : null, style]}
        {...props}
      />
      {erro ? (
        <Text style={[text.dataMeta, estilos.erro]} accessibilityRole="alert">
          {erro}
        </Text>
      ) : dica ? (
        <Text style={[text.dataMeta, estilos.dica]}>{dica}</Text>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  rotulo: { marginBottom: spacing.xs },
  campo: {
    minHeight: touch.field,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderStrong,
    borderRadius: radius.field,
    paddingHorizontal: spacing.md,
    // Android centraliza mal sem isso quando minHeight > conteúdo.
    paddingVertical: spacing.sm,
  },
  campoComErro: { borderColor: color.wine },
  dica: { marginTop: spacing.xs },
  erro: { marginTop: spacing.xs, color: color.wineInk },
});
