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
  /*
    Mesma regra do `CabecalhoTela`: ele fica parado e a lista corre por
    baixo, então precisa de sombra para se distinguir do que rola. O fundo
    opaco é o que permite a sombra existir — sem ele a sombra pinta sobre
    conteúdo transparente e o texto de baixo aparece através dela.

    A diferença para o `CabecalhoTela` é só a ausência do voltar: aba não
    volta, porque não há de onde.
  */
  cabecalho: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    backgroundColor: color.background,
    zIndex: 1,
    ...shadow.cabecalho,
  },
});
