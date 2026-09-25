import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: { ignoreDiagnostics: [151002] },
    }],
  },
  // Increase timeout for DB operations
  testTimeout: 30000,
  // Suppress console noise during tests
  silent: false,
  verbose: true,
  // Run test files sequentially to avoid DB conflicts
  maxWorkers: 1,
};

export default config;
