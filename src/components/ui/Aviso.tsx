import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone } from './Icone';
import type { NomeIcone } from './Icone';
import { color, interacao, radius, shadow, spacing, text, touch } from '@/theme';

/** O que o aviso comunica. A cor vem daqui, nunca da tela que o dispara. */
export type TomAviso = 'sucesso' | 'erro' | 'neutro';

export type ConteudoAviso = {
  /** A frase, em caixa baixa e sem ponto final: "execução salva". */
  texto: string;
  tom?: TomAviso;
  /** Ação opcional à direita, para desfazer ou tentar de novo. */
  acao?: { rotulo: string; onPress: () => void };
};

type Props = {
  /** `null` mantém o aviso fora da tela. */
  aviso: ConteudoAviso | null;
  onFechar: () => void;
  /** Espaço a reservar embaixo, além da área segura: a altura da barra. */
  margemInferior?: number;
};

// Sucesso usa `oliveInk` e não `olive`: o oliva da marca marca 4.3:1.
const PALETA: Record<TomAviso, { fundo: string; texto: string; icone: NomeIcone | null }> = {
  sucesso: { fundo: color.oliveInk, texto: color.inkOnDark, icone: 'certo' },
  erro: { fundo: color.wine, texto: color.inkOnWine, icone: 'alerta' },
  neutro: { fundo: color.ink, texto: color.inkOnDark, icone: null },
};

export function Aviso({ aviso, onFechar, margemInferior = 0 }: Props) {
  const insets = useSafeAreaInsets();

  if (!aviso) return null;

  const paleta = PALETA[aviso.tom ?? 'neutro'];
  const base = Math.max(insets.bottom, spacing.lg) + margemInferior;

  return (
    <View
      testID="aviso"
      style={[estilos.ancora, { bottom: base }]}
      pointerEvents="box-none"
      // Anuncia sozinho ao aparecer, sem roubar o foco de quem está lendo.
      accessibilityLiveRegion="polite"
    >
      <View style={[estilos.barra, { backgroundColor: paleta.fundo }]}>
        {paleta.icone ? (
          // A forma acompanha a cor, para quem não separa verde de vermelho.
          <Icone nome={paleta.icone} tamanho={18} cor={paleta.texto} />
        ) : null}

        <Text style={[text.body, estilos.texto, { color: paleta.texto }]} numberOfLines={2}>
          {aviso.texto}
        </Text>

        {aviso.acao ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={aviso.acao.rotulo}
            onPress={() => {
              aviso.acao?.onPress();
              onFechar();
            }}
            style={({ pressed }) => [estilos.acao, pressed && estilos.pressionado]}
          >
            <Text style={[text.button, estilos.acaoTexto, { color: paleta.texto }]}>
              {aviso.acao.rotulo}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="fechar aviso"
            onPress={onFechar}
            hitSlop={12}
            style={({ pressed }) => [estilos.fechar, pressed && estilos.pressionado]}
          >
            <Icone nome="fechar" tamanho={16} cor={paleta.texto} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  ancora: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.card,
    ...shadow.sheet,
  },
  texto: { flex: 1, minWidth: 0, fontSize: 13.5 },
  acao: {
    minHeight: touch.minTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  acaoTexto: { fontSize: 13.5, textDecorationLine: 'underline' },
  fechar: {
    width: touch.minTarget,
    height: touch.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: interacao.opacidadePressionado },
});
