import fs from 'fs';
import path from 'path';
import { defineConfig } from 'tsup';

export default defineConfig(options => {
    const baseConfig = {
        minify: true,
        entry: ['src/index.ts'],
        splitting: true,
        sourcemap: true,
        legacyOutput: true,
        treeshake: true,
        dts: true,
        drop_console: !options.watch,
    };

    return [
        // Node.js environment - ESM and CJS
        {
            ...baseConfig,
            ...options,
            outDir: 'dist/node',
            clean: true,
            format: ['cjs', 'esm'],
            define: {
                'process.env.IS_BROWSER': 'false',
            },
            platform: 'node',
            target: 'node16',
        },
        // Browser environment - ESM
        {
            ...baseConfig,
            outDir: 'dist/browser',
            clean: false,
            format: ['esm'],
            define: {
                'process.env.IS_BROWSER': 'true',
            },
            platform: 'browser',
            target: 'es2020',
            globalName: 'MarkdownItSmiles',
            external: ['fs', 'path', 'canvas', 'jsdom', 'deasync'],
            noExternal: ['smiles-drawer'],
        },
        // Browser environment - IIFE
        {
            ...baseConfig,
            outDir: 'dist/browser',
            clean: false,
            format: ['iife'],
            define: {
                'process.env.IS_BROWSER': 'true',
            },
            platform: 'node',
            target: 'es2020',
            globalName: 'MarkdownItSmiles',
            external: ['fs', 'path', 'canvas', 'jsdom', 'deasync'],
            noExternal: ['smiles-drawer'],
            onSuccess: async () => {
                const files = fs.readdirSync('./dist/browser/iife');
                const canvasFile = files.find(it => it.indexOf('canvas') > -1);
                if (canvasFile) {
                    fs.rmSync(path.resolve(__dirname, './dist/browser/iife/', canvasFile));
                }
            },
        },
    ];
});
