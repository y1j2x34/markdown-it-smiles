import { defineConfig } from 'tsup';
// https://tsup.egoist.dev/#usage

export default defineConfig(options => {
    return {
        entry: ['src/index.ts'],
        splitting: false,
        sourcemap: true,
        clean: true,
        drop_coonsole: !options.watch,
    };
});
