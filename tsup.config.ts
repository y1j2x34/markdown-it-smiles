import { defineConfig } from 'tsup';
// https://tsup.egoist.dev/#usage

export default defineConfig(options => {
    return [
        // Node.js environment - ESM and CJS
        {
            entry: ['src/index.ts'],
            outDir: 'dist/node',
            splitting: true,
            sourcemap: true,
            clean: true,
            dts: true,
            drop_console: !options.watch,
            format: ['cjs', 'esm'],
            legacyOutput: true,
            treeshake: true,
            define: {
                'process.env.IS_BROWSER': 'false',
            },
            platform: 'node',
            target: 'node16',
        },
        // Browser environment - ESM and IIFE
        {
            entry: ['src/index.ts'],
            outDir: 'dist/browser',
            splitting: true,
            sourcemap: true,
            clean: false, // Don't clean since we have multiple configs
            dts: true,
            drop_console: !options.watch,
            format: ['esm', 'iife'],
            legacyOutput: true,
            treeshake: true,
            define: {
                'process.env.IS_BROWSER': 'true',
            },
            platform: 'browser',
            target: 'es2020',
            globalName: 'MarkdownItSmiles',
            external: [
                'fs',
                'path',
                'canvas',
                'jsdom',
                'deasync',
                'http',
                'https',
                'net',
                'tls',
                'events',
                'stream',
                'vm',
                'url',
                'crypto',
                'child_process',
                'util',
                'os',
                'zlib',
                'assert',
            ],
            noExternal: ['smiles-drawer'],
        },
    ];
});
