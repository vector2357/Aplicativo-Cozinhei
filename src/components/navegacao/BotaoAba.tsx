import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import type { StyleProp, View as ViewTipo, ViewStyle } from 'react-native';

import { folgaEntreAbas } from '@/components/navegacao/estilosBarraAbas';
import { IconeAba, TAMANHO_ICONE_ABA } from '@/components/navegacao/IconeAba';
import type { NomeIconeAba } from '@/components/navegacao/IconeAba';
import { color, escalaDeFonte, text } from '@/theme';

/** Respiro entre o ícone e o rótulo. */
const RESPIRO = 6;

/** Comporta ícone, respiro e rótulo com folga dentro da barra de 72pt. */
const ALTURA_ABA = 62;

type Props = Omit<React.ComponentProps<typeof Pressable>, 'style' | 'children'> & {
  /** O TabTrigger repassa um estilo simples; a forma de função não é usada. */
  style?: StyleProp<ViewStyle>;
  rotulo: string;
  icone: NomeIconeAba;
  /** Injetado pelo TabTrigger. */
  isFocused?: boolean;
};

export const BotaoAba = forwardRef<ViewTipo, Props>(function BotaoAba(
  { rotulo, icone, isFocused = false, style, ...props },
  ref,
) {
  const { width } = useWindowDimensions();

  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={rotulo}
      style={[style, estilos.aba, { marginHorizontal: folgaEntreAbas(width) }]}
      {...props}
    >
      <IconeAba nome={icone} ativo={isFocused} />
      <Text
        style={[text.label, estilos.rotulo, { color: isFocused ? color.ink : color.tabInativa }]}
        numberOfLines={1}
        maxFontSizeMultiplier={escalaDeFonte.emAba}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
});

const estilos = StyleSheet.create({
  aba: {
    flex: 1,
    // Quatro abas mais o vão do `+` precisam caber em 320pt de largura.
    flexBasis: 0,
    minWidth: 0,
    height: ALTURA_ABA,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: RESPIRO,
    paddingHorizontal: 2,
  },
  // Prende o rótulo à largura da fatia: `alignItems` centraliza mas não limita.
  rotulo: { fontSize: 12, alignSelf: 'stretch', textAlign: 'center' },
});

export type { NomeIconeAba };
export { TAMANHO_ICONE_ABA };
