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
      // Um rótulo só: senão o leitor de tela para quatro vezes no mesmo cartão.
      accessibilityLabel={
        `${prato.nome}, ${prato.tentativas} ${prato.tentativas === 1 ? 'tentativa' : 'tentativas'}, ` +
        `nota média ${formatarNota(prato.notaMedia)}, última vez ${prato.ultimaVez}` +
        // A tira tem rótulo próprio, mas o agrupamento do cartão o descarta.
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
      {/* Rede de segurança para a peça futura que esquecer de pedir silêncio. */}
      <View
        style={estilos.conteudo}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
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

        <Estrelas nota={prato.notaMedia} compacto silencioso />
      </View>

      {/* Só faz sentido com repetição: uma barra sozinha não mostra evolução. */}
      {repetido ? <TiraDeEvolucao notas={prato.evolucao} prato={prato.nome} /> : null}

      {prato.defeitoRecorrente ? (
        <View style={estilos.defeito}>
          <Chip texto={prato.defeitoRecorrente} tipo="defeito" silencioso />
        </View>
      ) : null}
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
    padding: 13,
  },
  /** Separado do cartão só para poder sair da árvore de acessibilidade. */
  conteudo: { gap: spacing.sm },
  pressionado: { opacity: interacao.opacidadePressionado },
  topo: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  identidade: { flex: 1, minWidth: 0 },
  meta: { marginTop: 3 },
  defeito: { flexDirection: 'row' },
});
