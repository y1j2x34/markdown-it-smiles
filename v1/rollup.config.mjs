import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
    // CommonJS build for Node.js
    {
        input: 'src/index.mjs',
        output: {
            file: 'dist/markdown-it-smiles.js',
            format: 'cjs',
            exports: 'default',
        },
        plugins: [nodeResolve()],
        external: ['markdown-it'],
    },
    // Minified UMD build for browsers
    {
        input: 'src/index.mjs',
        output: {
            file: 'dist/markdown-it-smiles.min.js',
            format: 'umd',
            name: 'markdownItSmiles',
            exports: 'default',
        },
        plugins: [nodeResolve(), terser()],
        external: ['markdown-it'],
    },
];
