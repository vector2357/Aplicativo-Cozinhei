import { StyleSheet } from 'react-native';

import { color, radius, shadow, spacing, touch } from '@/theme';

export const estilosBarraAbas = StyleSheet.create({
  /**
   * A pílula branca, ancorada no rodapé. O `bottom` entra em tempo de
   * execução, a partir da área segura do aparelho.
   *
   * Os recuos laterais são simétricos de propósito: é o que faz o vão central
   * da barra coincidir com o centro da tela, onde fica o botão flutuante.
   */
  barra: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    height: touch.tabBarHeight,
    paddingHorizontal: 6,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderHairline,
    borderRadius: radius.tabBar,
    ...shadow.tabBar,
  },
  /** Vão central reservado ao botão flutuante. */
  vao: { width: touch.fabSize },
});
