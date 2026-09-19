import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, View as ViewTipo, ViewStyle } from 'react-native';

import { IconeAba, TAMANHO_ICONE_ABA } from '@/components/navegacao/IconeAba';
import type { NomeIconeAba } from '@/components/navegacao/IconeAba';
import { color, text } from '@/theme';

/**
 * Teto do ajuste de fonte do sistema. A fatia de cada aba é fixa (um quarto
 * do que sobra da barra); deixar o rótulo crescer sem limite recria a
 * sobreposição em aparelho com fonte grande.
 */
const ESCALA_MAXIMA_ROTULO = 1.15;

/** Respiro entre o ícone e o rótulo. */
const RESPIRO = 5;

/**
 * Altura da fatia. Comporta o ícone, o respiro e a linha do rótulo com folga
 * dentro da barra de 64pt — ver a conta em `TAMANHO_ICONE_ABA`.
 */
const ALTURA_ABA = 56;

type Props = Omit<React.ComponentProps<typeof Pressable>, 'style' | 'children'> & {
  /** O TabTrigger repassa um estilo simples; a forma de função não é usada. */
  style?: StyleProp<ViewStyle>;
  rotulo: string;
  /** Qual dos quatro ícones semânticos esta aba mostra. */
  icone: NomeIconeAba;
  /** Injetado pelo TabTrigger. */
  isFocused?: boolean;
};

export const BotaoAba = forwardRef<ViewTipo, Props>(function BotaoAba(
  { rotulo, icone, isFocused = false, style, ...props },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={rotulo}
      style={[style, estilos.aba]}
      {...props}
    >
      <IconeAba nome={icone} ativo={isFocused} />
      <Text
        style={[text.label, estilos.rotulo, { color: isFocused ? color.ink : color.tabInativa }]}
        numberOfLines={1}
        maxFontSizeMultiplier={ESCALA_MAXIMA_ROTULO}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
});

const estilos = StyleSheet.create({
  aba: {
    flex: 1,
    // Volume mínimo da fatia: quatro abas precisam caber junto com o vão do
    // botão flutuante mesmo num aparelho de 320pt de largura.
    flexBasis: 0,
    minWidth: 0,
    height: ALTURA_ABA,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: RESPIRO,
    paddingHorizontal: 2,
  },
  /**
   * `stretch` + `center` prendem o rótulo à largura da fatia. Sem isso o
   * texto assume a largura natural e transborda para a aba vizinha, porque
   * `alignItems: 'center'` centraliza mas não limita.
   */
  rotulo: { fontSize: 11, alignSelf: 'stretch', textAlign: 'center' },
});

/** Reexportado para quem monta a barra não precisar conhecer dois módulos. */
export type { NomeIconeAba };
export { TAMANHO_ICONE_ABA };
