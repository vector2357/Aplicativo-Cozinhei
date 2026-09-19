import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip, Estrelas, MidiaPlaceholder } from '@/components/ui';
import { color, interacao, radius, spacing, text } from '@/theme';
import type { Execucao } from '@/types/dominio';
import { formatarMoeda } from '@/utils/formato';

type Props = {
  execucao: Execucao;
  onPress: () => void;
  /**
   * `resumo` — usado em "continuar de onde parou": sem calha, sem chips.
   * `ficha`  — usado no histórico: com calha numérica e chips de avaliação.
   */
  variante?: 'resumo' | 'ficha';
};

export function CartaoExecucao({ execucao, onPress, variante = 'resumo' }: Props) {
  const ficha = variante === 'ficha';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${execucao.prato}, tentativa ${execucao.tentativa}, ${execucao.data}`}
      accessibilityHint="abre a ficha completa da execução"
      onPress={onPress}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      {ficha ? (
        <View style={estilos.calha}>
          <Text style={estilos.calhaNumero}>{execucao.tentativa}</Text>
          <Text style={estilos.calhaRotulo}>tent.</Text>
        </View>
      ) : null}

      <MidiaPlaceholder
        largura={ficha ? 52 : 56}
        altura={ficha ? 52 : 56}
        raio={ficha ? 9 : 10}
      />

      <View style={estilos.corpo}>
        <Text style={text.dishTitleList} numberOfLines={1}>
          {execucao.prato}
        </Text>
        <Text style={[text.dataMeta, estilos.meta]} numberOfLines={1}>
          {ficha
            ? `${execucao.data} · ${execucao.tempo} · ${formatarMoeda(execucao.custo)}`
            : `tentativa ${execucao.tentativa} · ${execucao.data}`}
        </Text>
        {ficha ? (
          <View style={estilos.chips}>
            {execucao.chips.map((chip) => (
              <Chip key={chip.texto} texto={chip.texto} tipo={chip.tipo} />
            ))}
          </View>
        ) : null}
      </View>

      <Estrelas nota={execucao.nota} compacto={ficha} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressionado: { opacity: interacao.opacidadePressionado },
  calha: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRightWidth: 1,
    borderRightColor: color.borderHairline,
    paddingRight: spacing.sm,
  },
  calhaNumero: { ...text.data, fontSize: 17, lineHeight: 18 },
  calhaRotulo: { ...text.overline, fontSize: 9, letterSpacing: 0.6, marginTop: 3 },
  corpo: { flex: 1, minWidth: 0 },
  meta: { marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: spacing.xs },
});
