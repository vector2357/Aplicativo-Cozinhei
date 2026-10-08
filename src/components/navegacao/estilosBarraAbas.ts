import { StyleSheet } from 'react-native';

import { color, radius, shadow, spacing, touch } from '@/theme';

export const estilosBarraAbas = StyleSheet.create({
  // Recuos simétricos: é o que faz o vão central coincidir com o centro da tela.
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
  /** O vão do botão flutuante, mais a folga que o separa das abas vizinhas. */
  vao: { width: touch.fabSize + touch.deadSpace * 2 },
});

/** Recuo lateral da pílula, somado dos dois lados. */
const MARGEM_DA_BARRA = spacing.md * 2;
/** Respiro interno da pílula, somado dos dois lados. */
const RESPIRO_INTERNO = 6 * 2;
// Esquecer estes 2dp entregou uma fatia de 43,4dp num aparelho de 308dp.
const BORDA_DA_BARRA = 1 * 2;
const ABAS = 4;

// Quando o alvo de 44pt e o vão morto não cabem juntos, é a folga que encolhe.
export function folgaEntreAbas(larguraDaTela: number): number {
  const util =
    larguraDaTela -
    MARGEM_DA_BARRA -
    BORDA_DA_BARRA -
    RESPIRO_INTERNO -
    estilosBarraAbas.vao.width;
  const sobra = util / ABAS - touch.minTarget;

  // Metade da sobra para cada lado.
  return Math.max(0, Math.min(touch.deadSpace, sobra) / 2);
}
