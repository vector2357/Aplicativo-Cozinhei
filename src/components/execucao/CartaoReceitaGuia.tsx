/**
 * Receita-guia no carrossel horizontal da tela de início.
 *
 * Receita-guia NÃO é execução: é referência importada de fora, usada como
 * ponto de partida. Por isso ela pode dar destaque à imagem — o que não vale
 * para a ficha de execução, onde a foto é deliberadamente secundária.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MidiaPlaceholder } from '@/components/ui';
import { color, fontFamily, radius, spacing, text } from '@/theme';
import type { ReceitaGuia } from '@/types/dominio';

export const LARGURA_CARTAO_GUIA = 148;

type Props = {
  receita: ReceitaGuia;
  onPress: () => void;
};

export function CartaoReceitaGuia({ receita, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`receita-guia ${receita.nome}, ${receita.tempo}, fonte ${receita.fonte}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <MidiaPlaceholder altura={82} raio={0} />
      <View style={estilos.corpo}>
        <Text style={estilos.nome} numberOfLines={2}>
          {receita.nome}
        </Text>
        <Text style={[text.dataMeta, estilos.meta]} numberOfLines={1}>
          {receita.tempo} · {receita.fonte}
        </Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    width: LARGURA_CARTAO_GUIA,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  pressionado: { opacity: 0.7 },
  corpo: { paddingHorizontal: 11, paddingTop: spacing.sm, paddingBottom: 12 },
  nome: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14,
    lineHeight: 17,
    color: color.ink,
  },
  meta: { fontSize: 10, marginTop: 5 },
});
