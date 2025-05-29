import { JestConfigWithTsJest } from 'ts-jest';

export default {
    preset: 'ts-jest',
    testMatch: ['**/tests/**/*.spec.{ts,tsx}'],
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/jest.setup.ts'],
    testTimeout: 10e3,

    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**/*', '!tests/**/*'],
    coverageDirectory: './report/coverage',
    coverageReporters: ['cobertura', 'html', 'text-summary'],
    transform: {
        '.*': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
                babelConfig: {
                    presets: ['@babel/preset-env'],
                },
            },
        ],
    },

    // bruh
    moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
    },
} satisfies JestConfigWithTsJest;
