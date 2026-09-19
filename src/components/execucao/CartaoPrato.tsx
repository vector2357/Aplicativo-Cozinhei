import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TiraDeEvolucao } from './TiraDeEvolucao';
import { Chip, Estrelas } from '@/components/ui';
import { color, interacao, radius, spacing, text } from '@/theme';
import type { Prato } from '@/types/dominio';
import { formatarNota } from '@/utils/formato';

type Props = {
  prato: Prato;
  onPress: () => void;
};

export function CartaoPrato({ prato, onPress }: Props) {
  const repetido = prato.tentativas > 1;

  return (
    <Pressable
      accessibilityRole="button"
      // Um rótulo só, com tudo que o cartão mostra: sem isto o leitor de tela
      // pararia quatro vezes dentro do mesmo cartão.
      accessibilityLabel={
        `${prato.nome}, ${prato.tentativas} ${prato.tentativas === 1 ? 'tentativa' : 'tentativas'}, ` +
        `nota média ${formatarNota(prato.notaMedia)}, última vez ${prato.ultimaVez}` +
        // A tira tem rótulo próprio, mas o agrupamento do cartão o descarta —
        // e ela é a resposta à pergunta que o produto existe para responder.
        (repetido
          ? `, evolução de ${formatarNota(prato.evolucao[0])} a ` +
            `${formatarNota(prato.evolucao[prato.evolucao.length - 1])}`
          : '') +
        (prato.defeitoRecorrente ? `, defeito que mais volta: ${prato.defeitoRecorrente}` : '')
      }
      accessibilityHint="abre o prato com todas as tentativas"
      onPress={onPress}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <View style={estilos.topo}>
        <View style={estilos.identidade}>
          <Text style={text.dishTitleList} numberOfLines={1}>
            {prato.nome}
          </Text>
          <Text style={[text.dataMeta, estilos.meta]} numberOfLines={1}>
            {prato.tentativas} {repetido ? 'tentativas' : 'tentativa'} · {prato.ultimaVez}
          </Text>
        </View>

        <Estrelas nota={prato.notaMedia} compacto />
      </View>

      {/* Só faz sentido com repetição: uma barra sozinha não mostra evolução. */}
      {repetido ? <TiraDeEvolucao notas={prato.evolucao} prato={prato.nome} /> : null}

      {prato.defeitoRecorrente ? (
        <View style={estilos.defeito}>
          <Chip texto={prato.defeitoRecorrente} tipo="defeito" />
        </View>
      ) : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.card,
    padding: 13,
    gap: spacing.sm,
  },
  pressionado: { opacity: interacao.opacidadePressionado },
  topo: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  identidade: { flex: 1, minWidth: 0 },
  meta: { marginTop: 3 },
  defeito: { flexDirection: 'row' },
});
