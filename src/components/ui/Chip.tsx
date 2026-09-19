import { Pressable, StyleSheet, Text, View } from 'react-native';

import { chipVariant, interacao, text } from '@/theme';
import type { TipoChip } from '@/types/dominio';

type Props = {
  texto: string;
  tipo?: TipoChip | 'neutro';
  /** Só faz sentido em chips de defeito, que abrem o diagnóstico. */
  onPress?: () => void;
};

const PALETA = {
  qualidade: chipVariant.quality,
  defeito: chipVariant.defect,
  neutro: chipVariant.neutral,
} as const;

export function Chip({ texto: rotulo, tipo = 'neutro', onPress }: Props) {
  const paleta = PALETA[tipo];
  const conteudo = (
    <Text style={[text.label, estilos.rotulo, { color: paleta.foreground }]} numberOfLines={1}>
      {rotulo}
    </Text>
  );
  const caixa = [
    estilos.chip,
    { backgroundColor: paleta.background, borderColor: paleta.border },
  ];

  if (!onPress) {
    return <View style={caixa}>{conteudo}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        tipo === 'defeito' ? `defeito ${rotulo}. abre o diagnóstico` : rotulo
      }
      // O chip é menor que 44pt por decisão visual; hitSlop devolve o alvo.
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      onPress={onPress}
      style={({ pressed }) => [...caixa, pressed && estilos.pressionado]}
    >
      {conteudo}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  rotulo: { fontSize: 10.5, lineHeight: 15 },
  pressionado: { opacity: interacao.opacidadePressionado },
});
