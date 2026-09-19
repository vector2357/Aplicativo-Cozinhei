import { StyleSheet, Text, View } from 'react-native';

import { color, text } from '@/theme';
import { estrelas as glifos, formatarNota } from '@/utils/formato';

type Props = {
  nota: number;
  /** Tamanho das estrelas. O número acompanha em proporção. */
  compacto?: boolean;
};

export function Estrelas({ nota, compacto = false }: Props) {
  return (
    <View
      style={estilos.caixa}
      accessibilityRole="text"
      accessibilityLabel={`nota ${formatarNota(nota)} de 5`}
    >
      <Text style={[estilos.glifos, compacto && estilos.glifosCompactos]}>{glifos(nota)}</Text>
      <Text style={[text.data, compacto && estilos.numeroCompacto]}>{formatarNota(nota)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { alignItems: 'flex-end' },
  glifos: { color: color.amber, fontSize: 12, letterSpacing: 1 },
  glifosCompactos: { fontSize: 11 },
  numeroCompacto: { marginTop: 2 },
});
