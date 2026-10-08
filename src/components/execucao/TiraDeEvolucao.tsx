import { StyleSheet, View } from 'react-native';

import { color, spacing } from '@/theme';
import { formatarNota } from '@/utils/formato';

/** Altura da barra mais alta. As demais são proporcionais à nota. */
const ALTURA = 34;
const LARGURA_BARRA = 7;
const NOTA_MAXIMA = 5;

type Props = {
  /** As notas em ordem cronológica, da primeira tentativa à última. */
  notas: number[];
  /** Nome do prato, para o leitor de tela saber de quem é a evolução. */
  prato: string;
};

export function TiraDeEvolucao({ notas, prato }: Props) {
  if (notas.length < 2) return null;

  const primeira = notas[0];
  const ultima = notas[notas.length - 1];
  const subiu = ultima > primeira;

  return (
    <View
      testID="tira-de-evolucao"
      style={estilos.tira}
      accessible
      accessibilityLabel={
        `evolução de ${prato}: ${notas.map((n) => formatarNota(n)).join(', ')}. ` +
        (subiu
          ? `subiu de ${formatarNota(primeira)} para ${formatarNota(ultima)}`
          : ultima < primeira
            ? `caiu de ${formatarNota(primeira)} para ${formatarNota(ultima)}`
            : `estável em ${formatarNota(ultima)}`)
      }
    >
      {notas.map((nota, indice) => (
        <View
          // A posição é a identidade: duas tentativas podem ter a mesma nota.
          key={indice}
          style={[
            estilos.barra,
            {
              height: Math.max(3, (nota / NOTA_MAXIMA) * ALTURA),
              // A última leva o âmbar; as anteriores ficam neutras, como rastro.
              backgroundColor: indice === notas.length - 1 ? color.amber : color.fillNeutral,
            },
          ]}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  tira: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: ALTURA,
    paddingTop: spacing.xxs,
  },
  barra: { width: LARGURA_BARRA, borderRadius: 2 },
});
