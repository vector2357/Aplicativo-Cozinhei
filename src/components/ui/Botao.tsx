import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Indicador } from './Indicador';
import { color, interacao, radius, text, touch } from '@/theme';

export type VarianteBotao = 'principal' | 'secundaria' | 'fantasma' | 'contornoEscuro';

type Props = {
  titulo: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  /** Renderizado à esquerda do título (ex.: o "G" do Google). */
  icone?: React.ReactNode;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: ViewStyle;
  /** Complementa o título para leitores de tela quando ele não basta. */
  accessibilityHint?: string;
  /**
   * Substitui o título na leitura de tela.
   *
   * Para quando o título é abreviação visual: "MS" no avatar diz o nome a
   * quem vê, e não significa nada falado.
   */
  accessibilityLabel?: string;
};

export function Botao({
  titulo,
  onPress,
  variante = 'principal',
  icone,
  carregando = false,
  desabilitado = false,
  style,
  accessibilityHint,
  accessibilityLabel,
}: Props) {
  const inativo = desabilitado || carregando;
  const paleta = PALETA[variante];
  // Uma superfície só, escolhida pelo estado: normal ou inativa.
  const superficie = inativo ? paleta.inativo : paleta;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      disabled={inativo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: superficie.fundo, borderColor: superficie.borda },
        superficie.borda !== 'transparent' && estilos.comBorda,
        variante === 'fantasma' && estilos.fantasma,
        pressed && estilos.pressionado,
        style,
      ]}
    >
      {carregando ? (
        // Indicador próprio: o `ActivityIndicator` do RN renderiza com poucos
        // pontos no Android e some dentro do botão.
        <Indicador tamanho={20} cor={superficie.texto} rotulo={`${titulo}, carregando`} />
      ) : (
        <>
          {icone ? <View style={estilos.icone}>{icone}</View> : null}
          <Text
            style={[text.button, { color: superficie.texto }, paleta.tamanho]}
            numberOfLines={1}
          >
            {titulo}
          </Text>
        </>
      )}
    </Pressable>
  );
}

type Paleta = {
  fundo: string;
  borda: string;
  texto: string;
  tamanho?: { fontSize: number };
  /** As mesmas três cores, para quando o botão está desabilitado. */
  inativo: { fundo: string; borda: string; texto: string };
};

/**
 * O estado inativo NÃO é a cor normal esmaecida.
 *
 * `opacity` derrubaria o contraste do texto junto com o fundo, e o texto do
 * botão desabilitado é justamente o que precisa continuar legível: é ele que
 * diz o que ainda não dá para fazer. Cada variante declara o próprio trio.
 *
 * Fantasma é link, não caixa: fica sem fundo nos dois estados. Contorno
 * escuro vive sobre `backgroundDark` e por isso usa o cinza claro.
 */
const PALETA: Record<VarianteBotao, Paleta> = {
  principal: {
    fundo: color.amber,
    borda: 'transparent',
    texto: color.ink,
    inativo: { fundo: color.inativoFundo, borda: 'transparent', texto: color.inativoTexto },
  },
  secundaria: {
    fundo: 'transparent',
    borda: 'rgba(18,33,28,0.18)',
    texto: color.ink,
    tamanho: { fontSize: 14 },
    inativo: { fundo: color.inativoFundo, borda: color.inativoBorda, texto: color.inativoTexto },
  },
  fantasma: {
    fundo: 'transparent',
    borda: 'transparent',
    texto: color.wine,
    inativo: { fundo: 'transparent', borda: 'transparent', texto: color.inativoTexto },
  },
  contornoEscuro: {
    fundo: 'transparent',
    borda: color.borderOnDark,
    texto: color.inkOnDark,
    tamanho: { fontSize: 13 },
    inativo: {
      fundo: 'transparent',
      borda: 'rgba(242,243,240,0.12)',
      texto: color.inativoTextoOnDark,
    },
  },
};

const estilos = StyleSheet.create({
  base: {
    minHeight: touch.primaryAction,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    paddingHorizontal: 16,
  },
  comBorda: { borderWidth: 1 },
  // Fantasma é um link: alvo de 44pt sem caixa visível.
  fantasma: { minHeight: touch.minTarget, paddingHorizontal: 8 },
  pressionado: { opacity: interacao.opacidadePressionado },
  icone: { alignItems: 'center', justifyContent: 'center' },
});
