import { TextStyle } from 'react-native';

import { fontFamily } from './fonts';
import { color } from './tokens';

export const text = {
  screenTitle: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 29,
    letterSpacing: -0.65,
    color: color.ink,
  },
  screenTitleLarge: {
    fontFamily: fontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.75,
    color: color.ink,
  },
  brand: {
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: -1.02,
    color: color.ink,
  },
  dishTitleList: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.16,
    color: color.ink,
  },
  sectionTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.27,
    color: color.ink,
  },
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
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: color.ink,
  },
  bodyMuted: {
    fontFamily: fontFamily.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: color.inkMuted,
  },
  label: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12.5,
    lineHeight: 17,
    color: color.ink,
  },
  field: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 20,
    color: color.ink,
  },
  button: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    lineHeight: 20,
    color: color.ink,
  },
  // Caixa alta em mono. Também pinta rótulo de campo, por isso 11px e não 10.
  overline: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: color.stoneOnLight,
  },
  /** Todo dado quantitativo: nota, custo, tempo, número de tentativa. */
  data: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 14,
    lineHeight: 18,
    color: color.ink,
  },
  // Metadado e mensagem de erro. 12px porque erro em corpo minúsculo não se lê.
  dataMeta: {
    fontFamily: fontFamily.mono,
    fontSize: 12,
    lineHeight: 16,
    color: color.inkFaint,
  },
} as const satisfies Record<string, TextStyle>;
