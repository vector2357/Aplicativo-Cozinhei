import { StyleSheet, Text, View } from 'react-native';

import { color, text } from '@/theme';
import { estrelas as glifos, formatarNota } from '@/utils/formato';

type Props = {
  nota: number;
  /** Tamanho das estrelas. O número acompanha em proporção. */
  compacto?: boolean;
  /** Cala a peça para o leitor de tela, quando o cartão já diz tudo. */
  silencioso?: boolean;
};

export function Estrelas({ nota, compacto = false, silencioso = false }: Props) {
  return (
    <View
      style={estilos.caixa}
      accessible={!silencioso}
      accessibilityRole="text"
      accessibilityLabel={silencioso ? undefined : `nota ${formatarNota(nota)} de 5`}
      importantForAccessibility={silencioso ? 'no-hide-descendants' : undefined}
    >
      {/* Soltos, o leitor soletra "estrela preta, estrela branca…". */}
      <Text
        style={[estilos.glifos, compacto && estilos.glifosCompactos]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {glifos(nota)}
      </Text>
      <Text style={[text.data, compacto && estilos.numeroCompacto]}>{formatarNota(nota)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { alignItems: 'flex-end' },
  // `amberInk` e não `amber`: o âmbar da marca sobre branco marca 2.27:1.
  glifos: { color: color.amberInk, fontSize: 12, letterSpacing: 1 },
  glifosCompactos: { fontSize: 11 },
  numeroCompacto: { marginTop: 2 },
});
