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
  /**
   * Vão central reservado ao botão flutuante, mais a folga dos dois lados:
   * sem ela o `+` encosta em "histórico" e em "pratos", e mirar o botão de
   * registrar com o polegar acerta a aba vizinha.
   */
  vao: { width: touch.fabSize + touch.deadSpace * 2 },
});

/** Recuo lateral da pílula, somado dos dois lados. */
const MARGEM_DA_BARRA = spacing.md * 2;
/** Respiro interno da pílula, somado dos dois lados. */
const RESPIRO_INTERNO = 6 * 2;
/** Quantas abas dividem o que sobra. */
const ABAS = 4;

/**
 * A folga que cada aba reserva de cada lado, dada a largura da tela.
 *
 * Duas regras de acessibilidade disputam o mesmo espaço aqui, e elas não têm
 * o mesmo peso:
 *
 * - **44pt de alvo mínimo** é piso da WCAG. Não é negociável.
 * - **8pt de vão morto entre alvos vizinhos** (Aula 10) reduz o acionamento
 *   errado, mas é recomendação.
 *
 * Em aparelho de 360pt para cima os dois cabem, e a folga sai inteira. Num
 * aparelho de 320pt — o piso que o projeto sustenta — a folga inteira
 * derrubaria a fatia para 42,5pt, trocando a regra forte pela fraca. Aqui a
 * folga encolhe até onde o alvo continua legal, e só.
 */
export function folgaEntreAbas(larguraDaTela: number): number {
  const util = larguraDaTela - MARGEM_DA_BARRA - RESPIRO_INTERNO - estilosBarraAbas.vao.width;
  const sobra = util / ABAS - touch.minTarget;

  // `sobra` é o que existe acima do alvo mínimo; metade fica de cada lado.
  return Math.max(0, Math.min(touch.deadSpace, sobra) / 2);
}
