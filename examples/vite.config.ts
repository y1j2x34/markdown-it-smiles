import { defineConfig, normalizePath } from 'vite';
import type { Plugin } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import MarkdownIt from 'markdown-it';
import type { PluginWithOptions } from 'markdown-it';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

interface NodeExampleScenario {
  id: string;
  title: string;
  description: string;
  markdown: string;
  options?: Record<string, unknown>;
  errors?: string[];
  html?: string;
}

type ScenarioOptions = Record<string, unknown> & {
  errorHandling?: Record<string, unknown>;
};

function markdownItSmilesNodeExamplesPlugin(): Plugin {
  const targetPath = normalizePath(resolve(__dirname, './src/data/node-examples.json'));
  const virtualId = 'virtual:markdown-it-smiles-node-examples';
  const resolvedVirtualId = `\0${virtualId}`;
  let markdownItSmilesPlugin: PluginWithOptions<unknown> | undefined;

  const getMarkdownItSmiles = (ctx: { error(message: string): never }) => {
    if (!markdownItSmilesPlugin) {
      try {
        const mod = require(resolve(__dirname, '../dist/node/index.js'));
        const candidate = mod.MarkdownItSmiles ?? mod.default?.MarkdownItSmiles ?? mod.default;
        if (typeof candidate !== 'function') {
          ctx.error('Unable to resolve MarkdownItSmiles export from ../dist/node/index.js');
        }
        markdownItSmilesPlugin = candidate as PluginWithOptions<unknown>;
      } catch (error) {
        ctx.error(
          `Failed to load markdown-it-smiles Node build from ../dist/node/index.js. Did you run "pnpm dev:build" in the repo root?\n${(error as Error).message}`,
        );
      }
    }
    return markdownItSmilesPlugin!;
  };

  return {
    name: 'markdown-it-smiles-node-examples',
    enforce: 'pre',
    resolveId(source, importer) {
      const stripQuery = (value: string) => value.split('?')[0] ?? value;
      const bareSource = stripQuery(source);
      if (bareSource === virtualId) {
        return resolvedVirtualId;
      }

      const normalizedSource = normalizePath(bareSource);
      if (normalizedSource === targetPath) {
        return resolvedVirtualId;
      }

      if (importer) {
        const importerDir = dirname(stripQuery(importer));
        const resolved = normalizePath(resolve(importerDir, stripQuery(source)));
        if (resolved === targetPath) {
          return resolvedVirtualId;
        }
      }

      return null;
    },
    async load(id) {
      if (id !== resolvedVirtualId) {
        return null;
      }

      this.addWatchFile(targetPath);

      let scenarios: NodeExampleScenario[];
      try {
        const raw = await readFile(targetPath, 'utf-8');
        scenarios = JSON.parse(raw) as NodeExampleScenario[];
      } catch (error) {
        this.error(`Failed to read or parse node-examples.json: ${(error as Error).message}`);
      }

      if (!Array.isArray(scenarios)) {
        this.error('node-examples.json must contain an array of scenario objects.');
      }

      const plugin = getMarkdownItSmiles(this);

      const transformed = scenarios.map((scenario) => {
        const existingErrors = Array.isArray(scenario.errors) ? [...scenario.errors] : [];
        const renderErrors: string[] = [];

        const rawOptions: ScenarioOptions = scenario.options
          ? (JSON.parse(JSON.stringify(scenario.options)) as ScenarioOptions)
          : ({} as ScenarioOptions);
        const baseErrorHandling = (rawOptions.errorHandling ?? {}) as Record<string, unknown>;

        const pluginOptions: ScenarioOptions = {
          ...rawOptions,
          renderAtParse: true,
          errorHandling: {
            ...baseErrorHandling,
            onError: (err: Error) => {
              renderErrors.push(err?.message ?? String(err));
            },
          },
        };

        const md = new MarkdownIt({ html: true, breaks: true }).use(plugin, pluginOptions as unknown);
        const html = md.render(scenario.markdown);

        return {
          ...scenario,
          html,
          errors: [...existingErrors, ...renderErrors],
        };
      });

      const moduleCode = `const data = ${JSON.stringify(transformed, null, 2)};\nexport default data;\n`;
      return moduleCode;
    },
  };
}

export default defineConfig({
  root: __dirname,
  base: './',
  plugins: [markdownItSmilesNodeExamplesPlugin()],
  server: {
    fs: {
      allow: [resolve(__dirname, '..')]
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      'markdown-it-smiles': resolve(__dirname, '../dist/browser/esm/index.js'),
      'markdown-it-smiles/plugin-options': resolve(__dirname, '../dist/node/index.d.ts')
    }
  }
});
