import { PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip, Estrelas, MidiaPlaceholder } from '@/components/ui';
import { color, escalaDeFonte, interacao, radius, spacing, text } from '@/theme';
import type { Execucao } from '@/types/dominio';
import { formatarMoeda, formatarNota } from '@/utils/formato';

type Props = {
  execucao: Execucao;
  onPress: () => void;
  /** `resumo` não tem calha nem chips; `ficha`, usada no histórico, tem os dois. */
  variante?: 'resumo' | 'ficha';
};

/** Largura da calha com a fonte no tamanho padrão do sistema. */
const LARGURA_DA_CALHA = 46;

export function CartaoExecucao({ execucao, onPress, variante = 'resumo' }: Props) {
  const ficha = variante === 'ficha';

  // A calha cresce com a fonte do sistema: o teto sozinho quebrava "tent." em duas.
  const escalaDoSistema = Math.min(PixelRatio.getFontScale(), escalaDeFonte.emCaixaFixa);

  return (
    <Pressable
      accessibilityRole="button"
      // O que não estiver neste rótulo não existe para quem usa leitor de tela.
      accessibilityLabel={
        `${execucao.prato}, tentativa ${execucao.tentativa}, ${execucao.data}, ` +
        `nota ${formatarNota(execucao.nota)} de 5` +
        (ficha
          ? `, ${execucao.tempo}, ${formatarMoeda(execucao.custo)}` +
            (execucao.chips.length
              ? '. ' +
                execucao.chips
                  .map((chip) => `${chip.tipo === 'defeito' ? 'defeito' : 'qualidade'}: ${chip.texto}`)
                  .join(', ')
              : '')
          : '')
      }
      accessibilityHint="abre a ficha completa da execução"
      onPress={onPress}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      {/* Rede de segurança para a peça que vier sem pedir silêncio. */}
      <View
        style={estilos.conteudo}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
      {ficha ? (
        <View style={[estilos.calha, { width: LARGURA_DA_CALHA * escalaDoSistema }]}>
          <Text style={estilos.calhaNumero} maxFontSizeMultiplier={escalaDeFonte.emCaixaFixa}>
            {execucao.tentativa}
          </Text>
          <Text
            style={estilos.calhaRotulo}
            numberOfLines={1}
            maxFontSizeMultiplier={escalaDeFonte.emCaixaFixa}
          >
            tent.
          </Text>
        </View>
      ) : null}

      {/* Com a fonte ampliada a miniatura sai, e o nome do prato ganha ~52pt. */}
      {escalaDoSistema > 1 && ficha ? null : (
        <MidiaPlaceholder
          largura={ficha ? 52 : 56}
          altura={ficha ? 52 : 56}
          raio={ficha ? 9 : 10}
        />
      )}

      <View style={estilos.corpo}>
        <Text style={text.dishTitleList} numberOfLines={escalaDoSistema > 1 ? 2 : 1}>
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
              <Chip key={chip.texto} texto={chip.texto} tipo={chip.tipo} silencioso />
            ))}
          </View>
        ) : null}
      </View>

      <Estrelas nota={execucao.nota} compacto={ficha} silencioso />
      </View>
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
  },
  /** Separada do cartão só para poder sair da árvore de acessibilidade. */
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressionado: { opacity: interacao.opacidadePressionado },
  calha: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRightWidth: 1,
    borderRightColor: color.borderHairline,
    paddingRight: spacing.sm,
  },
  calhaNumero: { ...text.data, fontSize: 17, lineHeight: 18 },
  calhaRotulo: { ...text.overline, letterSpacing: 0.4, marginTop: 3 },

  corpo: { flex: 1, minWidth: 0 },
  meta: { marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: spacing.xs },
});
