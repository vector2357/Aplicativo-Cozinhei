/**
 * Testes da camada visual (etapa 02).
 *
 * `jest-expo` traz os mocks dos módulos nativos do Expo; sem ele qualquer
 * import de `expo-font` ou `expo-router` quebra fora do aparelho.
 *
 * Note que NÃO há `transformIgnorePatterns` aqui de propósito: o preset do
 * jest-expo já mantém a lista correta dos pacotes que publicam ESM e
 * precisam ser transformados — inclusive `standard-navigation`, que é o
 * motor de navegação do Expo Router 57. Sobrescrever essa lista com uma
 * cópia desatualizada quebra o carregamento das rotas.
 */
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
