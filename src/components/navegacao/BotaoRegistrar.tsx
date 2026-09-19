import { Pressable, StyleSheet, Text } from 'react-native';

import { color, interacao, radius, shadow, touch } from '@/theme';

export function BotaoRegistrar({ onPress, base }: { onPress: () => void; base: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="registrar execução"
      accessibilityHint="abre as três formas de registrar: áudio, manual ou cronômetro"
      onPress={onPress}
      style={({ pressed }) => [
        estilos.fab,
        { bottom: base + (touch.tabBarHeight - touch.fabSize) / 2 },
        pressed && estilos.pressionado,
      ]}
    >
      <Text style={estilos.sinal}>+</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: touch.fabSize,
    height: touch.fabSize,
    borderRadius: radius.fab,
    backgroundColor: color.amber,
    // Separa o âmbar do fundo claro: 2.04:1 sozinho, abaixo do mínimo.
    borderWidth: 1.5,
    borderColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  pressionado: { transform: [{ scale: interacao.escalaPressionado }] },
  sinal: {
    fontSize: 30,
    lineHeight: 34,
    color: color.ink,
    // O glifo "+" tem folga acima; o ajuste ótico centraliza de verdade.
    marginTop: -2,
  },
});
