module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // O Reanimated 4 roda sobre `react-native-worklets`, cujo pacote publica
  // arquivos `.native.js` que o resolvedor padrão do Jest escolhe por engano —
  // e aí o worklet tenta subir a ponte nativa em ambiente Node, estourando em
  // `loadUnpackers`. Este resolvedor vem do próprio pacote e serve só para
  // preferir a versão de JavaScript puro dentro dele.
  resolver: 'react-native-worklets/jest/resolver.js',
  // `renderRouter` (expo-router/testing-library) chama `jest.useFakeTimers()`
  // por conta própria. Sem este padrão, `setImmediate` seria falsificado junto
  // — e é nele que o `act` assíncrono do testing-library se apoia para
  // esvaziar a fila de renderização, o que trava o teste inteiro.
  fakeTimers: { doNotFake: ['setImmediate'] },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
