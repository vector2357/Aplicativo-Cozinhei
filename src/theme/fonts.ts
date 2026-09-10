/**
 * Cozinhei — famílias tipográficas.
 *
 * Três papéis, sem exceção:
 *   display — Bricolage Grotesque. Nome de prato, números grandes, títulos.
 *   body    — Public Sans. Todo o resto do texto e da interface.
 *   mono    — DM Mono. TODO dado quantitativo, mais rótulos em caixa alta.
 *
 * Dado quantitativo em mono não é decoração: numerais tabulares alinham
 * verticalmente nas listas de execução, e é esse alinhamento que permite
 * comparar notas e custos correndo o olho pela coluna.
 *
 * A especificação de design pede os .ttf em `assets/fonts/` registrados via
 * `react-native.config.js`. Em projeto Expo gerenciado usamos os pacotes
 * @expo-google-fonts: mesmas fontes, mesmos pesos, carregadas por
 * `useFonts` sem etapa de prebuild. Os nomes abaixo são as chaves que
 * `useFonts` registra — ver `useAppFonts`.
 */
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
} from '@expo-google-fonts/public-sans';

/** Mapa passado a `useFonts`. A chave vira o valor de `fontFamily`. */
export const fontAssets = {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  DMMono_400Regular,
  DMMono_500Medium,
} as const;

/** Use sempre estes apelidos — nunca a string crua do pacote. */
export const fontFamily = {
  display: 'BricolageGrotesque_700Bold',
  displaySemibold: 'BricolageGrotesque_600SemiBold',
  body: 'PublicSans_400Regular',
  bodyMedium: 'PublicSans_500Medium',
  bodySemibold: 'PublicSans_600SemiBold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;
