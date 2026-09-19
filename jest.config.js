module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // `renderRouter` (expo-router/testing-library) chama `jest.useFakeTimers()`
  // por conta própria. Sem este padrão, `setImmediate` seria falsificado junto
  // — e é nele que o `act` assíncrono do testing-library se apoia para
  // esvaziar a fila de renderização, o que trava o teste inteiro.
  fakeTimers: { doNotFake: ['setImmediate'] },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
