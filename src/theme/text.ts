/**
 * Cozinhei — estilos de texto prontos.
 *
 * Aplique o objeto inteiro (`style={text.dishTitle}`), não campos soltos.
 * `letterSpacing` em React Native é em pontos absolutos, não em `em`.
 */
import { TextStyle } from 'react-native';

import { fontFamily } from './fonts';
import { color } from './tokens';

export const text = {
  /** Título de tela: "histórico", "pratos", "sua evolução". */
  screenTitle: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 29,
    letterSpacing: -0.65,
    color: color.ink,
  },
  /** Saudação e títulos grandes: "oi, Marina". */
  screenTitleLarge: {
    fontFamily: fontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.75,
    color: color.ink,
  },
  /** Marca na tela de entrada. */
  brand: {
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: -1.02,
    color: color.ink,
  },
  /** Nome de prato numa lista. */
  dishTitleList: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.16,
    color: color.ink,
  },
  /** Subtítulo de seção dentro de uma tela. */
  sectionTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.27,
    color: color.ink,
  },
  /** Título de estado (carregando, vazio). */
  stateTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: -0.32,
    color: color.ink,
  },
  /** Número grande: nota média, total de execuções, KPI. */
  metric: {
    fontFamily: fontFamily.display,
    fontSize: 40,
    lineHeight: 36,
    letterSpacing: -1.2,
    color: color.ink,
  },
  /** Corpo de texto. */
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: color.ink,
  },
  /** Corpo secundário: explicações, comentários, ajuda. */
  bodyMuted: {
    fontFamily: fontFamily.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: color.inkMuted,
  },
  /** Rótulo de campo, chip, item de lista. */
  label: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12.5,
    lineHeight: 17,
    color: color.ink,
  },
  /** Texto dentro de campo de formulário. */
  field: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 20,
    color: color.ink,
  },
  /** Texto de botão principal e secundário. */
  button: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    lineHeight: 20,
    color: color.ink,
  },
  /** Rótulo de eixo/seção em caixa alta. Sempre mono, sempre com tracking. */
  overline: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: color.stone,
  },
  /** TODO dado quantitativo: nota, custo, tempo, número de tentativa. */
  data: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 14,
    lineHeight: 18,
    color: color.ink,
  },
  /** Metadado em mono: "tentativa 04 · 55 min · R$ 18,40". */
  dataMeta: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    lineHeight: 14,
    color: color.inkFaint,
  },
} as const satisfies Record<string, TextStyle>;
