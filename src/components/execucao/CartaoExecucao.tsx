import { PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip, Estrelas, MidiaPlaceholder } from '@/components/ui';
import { color, escalaDeFonte, interacao, radius, spacing, text } from '@/theme';
import type { Execucao } from '@/types/dominio';
import { formatarMoeda, formatarNota } from '@/utils/formato';

type Props = {
  execucao: Execucao;
  onPress: () => void;
  /**
   * `resumo` — usado em "continuar de onde parou": sem calha, sem chips.
   * `ficha`  — usado no histórico: com calha numérica e chips de avaliação.
   */
  variante?: 'resumo' | 'ficha';
};

/** Largura da calha com a fonte no tamanho padrão do sistema. */
const LARGURA_DA_CALHA = 46;

export function CartaoExecucao({ execucao, onPress, variante = 'resumo' }: Props) {
  const ficha = variante === 'ficha';

  /*
    A calha cresce junto com a fonte do sistema, em vez de espremer o rótulo.

    O teto de `escalaDeFonte.emCaixaFixa` sozinho não resolvia: ele impede o
    texto de crescer sem limite, mas 1,3× de "TENT." em caixa alta ainda não
    cabe nos 46pt originais, e o rótulo quebrava em "TEN" / "T." com a fonte
    do sistema em 200%. Foi encontrado no emulador, não em teste — largura de
    texto renderizado é justamente o que teste de árvore não mede.

    Deixar o container crescer é a primeira escolha; o teto continua valendo
    como segunda, para o caso de a calha já ter comido o espaço do corpo.
  */
  const escalaDoSistema = Math.min(PixelRatio.getFontScale(), escalaDeFonte.emCaixaFixa);

  return (
    <Pressable
      accessibilityRole="button"
      /*
        O `Pressable` agrupa tudo num nó só, e o que não estiver neste rótulo
        simplesmente não existe para quem usa leitor de tela. Antes ficavam de
        fora a nota e os chips — exatamente a informação que a lista dá.
      */
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

      {/*
        Com a fonte muito ampliada a miniatura sai da ficha. Não é perda de
        informação: "a foto é secundária" é regra escrita do projeto — quem
        codifica a repetição é a calha numerada, e a leitura de progresso
        continua inteira sem a imagem. O que se ganha são ~52pt de largura
        para o nome do prato, que senão quebra no meio da palavra.
      */}
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
