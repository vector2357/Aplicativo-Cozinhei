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
      accessible
      accessibilityRole="text"
      accessibilityLabel={`nota ${formatarNota(nota)} de 5`}
    >
      {/*
        Os glifos saem da leitura: soltos, o leitor de tela soletra "estrela
        preta, estrela preta, estrela branca…". Quem diz a nota é o rótulo do
        grupo, e o número ao lado repete a informação para quem vê.
      */}
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
  /*
    `amberInk`, e não `amber`: o âmbar da marca sobre superfície branca marca
    2.27:1, e estes glifos são a leitura de relance da nota. O tom escuro do
    mesmo âmbar fecha 6.8:1 sem trocar de família de cor.
  */
  glifos: { color: color.amberInk, fontSize: 12, letterSpacing: 1 },
  glifosCompactos: { fontSize: 11 },
  numeroCompacto: { marginTop: 2 },
});
