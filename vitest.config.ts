import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    include: ['tests/general/**/*.spec.ts', 'tests/node/**/*.spec.ts'],
                    name: 'node',
                    environment: 'node',
                    setupFiles: ['tests/node/setup.ts'],
                    env: {
                        IS_BROWSER: 'false'
                    },
                },
                define: {
                    'IS_BROWSER': 'false'
                },
            },
            {
                test: {
                    include: ['tests/general/**/*.spec.ts', 'tests/browser/**/*.spec.ts'],
                    name: 'browser',
                    browser: {
                        enabled: true,
                        provider: 'playwright',
                        instances: [
                            {
                                browser: 'chromium'
                            }, {
                                browser: 'firefox'
                            }, {
                                browser: 'webkit'
                            }
                        ]
                    }
                },
                define: {
                    IS_BROWSER: 'true'
                }
            }],
        coverage: {
            provider: 'istanbul',
            reporter: ['html', 'text-summary', 'cobertura'],
            include: ['src/**/*.ts'],
            reportsDirectory: 'report/coverage',
        }
    }
});