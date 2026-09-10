/**
 * Preparação global dos testes.
 *
 * Os matchers do @testing-library/react-native já vêm registrados a partir
 * da v12 — não é preciso importar `extend-expect`.
 *
 * As fontes reais não carregam fora do aparelho: `useFonts` é forçado a
 * responder "pronto" para que o layout raiz renderize em vez de devolver
 * null enquanto espera a splash.
 */
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: () => [true, null],
  isLoaded: () => true,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
