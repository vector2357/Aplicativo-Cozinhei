/**
 * Botão flutuante de registrar execução — o `+` sobreposto no centro da
 * barra de abas.
 *
 * É a única ação âmbar de qualquer tela que exibe a barra. Registrar é a
 * ação central do produto: o app inteiro existe para que essa ficha exista.
 */
import { Pressable, StyleSheet, Text } from 'react-native';

import { color, radius, shadow, touch } from '@/theme';

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
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  pressionado: { opacity: 0.85 },
  sinal: {
    fontSize: 30,
    lineHeight: 34,
    color: color.ink,
    // O glifo "+" tem folga acima; o ajuste ótico centraliza de verdade.
    marginTop: -2,
  },
});
