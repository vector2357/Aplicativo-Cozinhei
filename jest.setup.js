jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: () => [true, null],
  isLoaded: () => true,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// O AsyncStorage publica o próprio dublê — é ele que guarda a sessão em teste.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// O dublê é da camada de acesso, não do `expo-sqlite`: um falso SQLite teria de
// interpretar SQL. O SQL de verdade não roda em Node de jeito nenhum, e quem o
// verifica é o roteiro em emulador descrito em `docs/etapa-04.md`.
jest.mock('@/features/execucoes/bancoLocal');

// Todo teste de tela monta o app como se a usuária de exemplo já tivesse
// entrado uma vez — é o estado em que o banco local fica depois da primeira
// entrada, e é o que as telas encontram em execução.
beforeAll(async () => {
  const { garantirDadosDoDono } = require('@/features/execucoes/repositorio');
  const { USUARIO_EXEMPLO } = require('@/features/execucoes/fixtures');
  await garantirDadosDoDono(USUARIO_EXEMPLO.email, true);
});

// O dublê do AsyncStorage guarda o que foi escrito pelo resto do arquivo de
// teste. Sem limpar, um teste que entra na conta deixa a sessão gravada e o
// seguinte abre o app já logado — que é o comportamento certo do app e o
// isolamento errado do teste.
beforeEach(async () => {
  await require('@react-native-async-storage/async-storage').clear();
});
