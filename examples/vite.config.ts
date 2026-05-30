import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

const examplesRoot = __dirname;

export default defineConfig({
    root: examplesRoot,
    plugins: [tsconfigPaths()],
    server: {
        open: '/index.html',
        fs: {
            allow: [examplesRoot, path.resolve(examplesRoot, '..')],
        },
    },
    resolve: {
        alias: {
            'markdown-it-smiles': path.resolve(examplesRoot, '../dist/browser/esm/index.js'),
        },
    },
    define: {
        IS_BROWSER: 'true',
    },
    build: {
        outDir: path.resolve(examplesRoot, 'dist'),
        emptyOutDir: true,
    },
});
