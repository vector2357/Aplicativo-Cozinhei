import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from './Icone';
import type { NomeIcone } from './Icone';
import { chipVariant, interacao, text } from '@/theme';
import type { TipoChip } from '@/types/dominio';

type Props = {
  texto: string;
  tipo?: TipoChip | 'neutro';
  /** Só faz sentido em chips de defeito, que abrem o diagnóstico. */
  onPress?: () => void;
  /** Cala a peça para o leitor de tela, quando o cartão já diz tudo. */
  silencioso?: boolean;
};

const PALETA = {
  qualidade: chipVariant.quality,
  defeito: chipVariant.defect,
  neutro: chipVariant.neutral,
} as const;

export function Chip({ texto: rotulo, tipo = 'neutro', onPress, silencioso = false }: Props) {
  const paleta = PALETA[tipo];
  // A forma acompanha a cor: oliva e vinho se confundem no daltonismo comum.
  const simbolo: NomeIcone | null =
    tipo === 'defeito' ? 'alerta' : tipo === 'qualidade' ? 'certo' : null;

  const conteudo = (
    <>
      {simbolo ? <Icone nome={simbolo} tamanho={11} cor={paleta.foreground} /> : null}
      <Text style={[text.label, estilos.rotulo, { color: paleta.foreground }]} numberOfLines={1}>
        {rotulo}
      </Text>
    </>
  );
  const caixa = [
    estilos.chip,
    { backgroundColor: paleta.background, borderColor: paleta.border },
  ];

  if (!onPress) {
    // Mesmo sem toque o tipo precisa ser dito: o símbolo é só visual.
    return (
      <View
        style={caixa}
        accessible={!silencioso}
        accessibilityLabel={
          silencioso || tipo === 'neutro' ? undefined : `${tipo}: ${rotulo}`
        }
        importantForAccessibility={silencioso ? 'no-hide-descendants' : undefined}
      >
        {conteudo}
      </View>
    );
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  rotulo: { fontSize: 11, lineHeight: 15 },
  pressionado: { opacity: interacao.opacidadePressionado },
});
