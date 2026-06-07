import type { Options } from 'tsup';
import { readdir, rm } from 'node:fs/promises';

export default (options: Options): Options[] => {
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
                IS_BROWSER: 'false',
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
                IS_BROWSER: 'true',
            },
            platform: 'browser',
            target: 'es2020',
            globalName: 'MarkdownItSmiles',
            external: ['fs', 'path', 'canvas', 'sharp', 'jsdom', 'deasync'],
            noExternal: ['smiles-drawer'],
        },
        // Browser environment - IIFE
        {
            ...baseConfig,
            outDir: 'dist/browser',
            clean: false,
            format: ['iife'],
            define: {
                IS_BROWSER: 'true',
            },
            platform: 'node',
            target: 'es2020',
            globalName: 'MarkdownItSmiles',
            external: ['fs', 'path', 'canvas', 'sharp', 'jsdom', 'deasync'],
            noExternal: ['smiles-drawer'],
            onSuccess: async () => {
                try {
                    const iifeDir = new URL('./dist/browser/iife/', import.meta.url);
                    const files = await readdir(iifeDir);
                    const canvasFile = files.find(it => it.includes('canvas'));
                    if (canvasFile) {
                        await rm(new URL(canvasFile, iifeDir), { force: true });
                    }
                } catch (error) {
                    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                        throw error;
                    }
                }
            },
        },
    ];
};
