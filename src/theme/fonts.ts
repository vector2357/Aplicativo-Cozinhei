import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
} from '@expo-google-fonts/public-sans';

/** Mapa passado a `useFonts`. A chave vira o valor de `fontFamily`. */
export const fontAssets = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
} as const;

/** Use sempre estes apelidos — nunca a string crua do pacote. */
export const fontFamily = {
  display: 'Poppins_700Bold',
  displaySemibold: 'Poppins_600SemiBold',
  body: 'PublicSans_400Regular',
  bodyMedium: 'PublicSans_500Medium',
  bodySemibold: 'PublicSans_600SemiBold',
  mono: 'Poppins_400Regular',
  monoMedium: 'Poppins_500Medium',
} as const;
