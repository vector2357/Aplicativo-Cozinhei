import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import type { StyleProp, View as ViewTipo, ViewStyle } from 'react-native';

import { folgaEntreAbas } from '@/components/navegacao/estilosBarraAbas';
import { IconeAba, TAMANHO_ICONE_ABA } from '@/components/navegacao/IconeAba';
import type { NomeIconeAba } from '@/components/navegacao/IconeAba';
import { color, escalaDeFonte, text } from '@/theme';

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
