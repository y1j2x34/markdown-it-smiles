import { JestConfigWithTsJest } from 'ts-jest';

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Test file patterns
    testMatch: ['<rootDir>/tests/**/*.spec.ts'],

    // Module resolution
    moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!**/node_modules/**/*', '!tests/**/*'],
    coverageDirectory: './report/coverage',
    coverageReporters: ['cobertura', 'html', 'text-summary', 'lcov'],

    // Environment-specific test configurations
    projects: [
        {
            displayName: 'node',
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/tests/**/*.spec.ts'],
            testPathIgnorePatterns: ['<rootDir>/tests/browser-environment.spec.ts'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
            moduleNameMapper: {
                '^~/(.*)$': '<rootDir>/src/$1',
            },
            transform: {
                '^.+\\.ts$': [
                    'ts-jest',
                    {
                        tsconfig: 'tsconfig.json',
                    },
                ],
            },
        },
        {
            displayName: 'browser',
            preset: 'ts-jest',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/tests/browser-environment.spec.ts'],
            setupFilesAfterEnv: ['<rootDir>/tests/browser-setup.ts'],
            moduleNameMapper: {
                '^~/(.*)$': '<rootDir>/src/$1',
            },
            transform: {
                '^.+\\.ts$': [
                    'ts-jest',
                    {
                        tsconfig: 'tsconfig.json',
                    },
                ],
            },
        },
    ],

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,

    // Timeouts
    testTimeout: 10000,

    // Transform configuration
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
                babelConfig: {
                    presets: ['@babel/preset-env'],
                },
            },
        ],
    },

    // Module file extensions
    moduleFileExtensions: ['ts', 'js', 'json'],

    // Global setup and teardown
    globalSetup: '<rootDir>/tests/global-setup.ts',
    globalTeardown: '<rootDir>/tests/global-teardown.ts',
} satisfies JestConfigWithTsJest;
