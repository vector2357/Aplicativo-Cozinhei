/**
 * Botão. Quatro variantes, escolhidas por SIGNIFICADO e não por estética.
 *
 * `principal` é âmbar e só pode aparecer UMA VEZ por tela (regra de design:
 * se duas ações parecem principais, uma delas não é). Texto sobre âmbar é
 * sempre tinta escura — nunca branco, o contraste não fecha.
 *
 * Todas as variantes respeitam o piso de 44pt de alvo tocável.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { color, radius, text, touch } from '@/theme';

export type VarianteBotao = 'principal' | 'secundaria' | 'fantasma' | 'contornoEscuro';

type Props = {
  titulo: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  /** Renderizado à esquerda do título (ex.: o "G" do Google). */
  icone?: React.ReactNode;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: ViewStyle;
  /** Complementa o título para leitores de tela quando ele não basta. */
  accessibilityHint?: string;
};

export function Botao({
  titulo,
  onPress,
  variante = 'principal',
  icone,
  carregando = false,
  desabilitado = false,
  style,
  accessibilityHint,
}: Props) {
  const inativo = desabilitado || carregando;
  const paleta = PALETA[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      disabled={inativo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: paleta.fundo, borderColor: paleta.borda },
        paleta.borda !== 'transparent' && estilos.comBorda,
        variante === 'fantasma' && estilos.fantasma,
        pressed && estilos.pressionado,
        inativo && estilos.inativo,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={paleta.texto} />
      ) : (
        <>
          {icone ? <View style={estilos.icone}>{icone}</View> : null}
          <Text style={[text.button, { color: paleta.texto }, paleta.tamanho]} numberOfLines={1}>
            {titulo}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const PALETA: Record<
  VarianteBotao,
  { fundo: string; borda: string; texto: string; tamanho?: { fontSize: number } }
> = {
  principal: { fundo: color.amber, borda: 'transparent', texto: color.ink },
  secundaria: {
    fundo: 'transparent',
    borda: 'rgba(18,33,28,0.18)',
    texto: color.ink,
    tamanho: { fontSize: 14 },
  },
  fantasma: { fundo: 'transparent', borda: 'transparent', texto: color.wine },
  contornoEscuro: {
    fundo: 'transparent',
    borda: color.borderOnDark,
    texto: color.inkOnDark,
    tamanho: { fontSize: 13 },
  },
};

const estilos = StyleSheet.create({
  base: {
    minHeight: touch.primaryAction,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    paddingHorizontal: 16,
  },
  comBorda: { borderWidth: 1 },
  // Fantasma é um link: alvo de 44pt sem caixa visível.
  fantasma: { minHeight: touch.minTarget, paddingHorizontal: 8 },
  pressionado: { opacity: 0.72 },
  inativo: { opacity: 0.45 },
  icone: { alignItems: 'center', justifyContent: 'center' },
});
