import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from 'markdown-it-smiles';

import { moleculeCatalog } from './data/molecules';
import nodeScenariosData, { NodeScenarioSample } from './data/nodeExamples';
import './style.css';

declare global {
  interface Window {
    monaco?: any;
    require?: any;
    _monacoPromise?: Promise<any>;
    SmilesDrawer?: {
      apply: (opts?: unknown, target?: unknown, frag?: unknown, theme?: unknown, mol?: unknown, onError?: (err: unknown) => void) => void;
      SmiDrawer?: {
        apply: (
          moleculeOptions?: Record<string, unknown>,
          reactionOptions?: Record<string, unknown>,
          attribute?: string,
          theme?: string,
          successCallback?: (element: Element) => void,
          errorCallback?: (err: unknown) => void,
        ) => void;
      };
    };
    SmiDrawer?: {
      apply: (
        moleculeOptions?: Record<string, unknown>,
        reactionOptions?: Record<string, unknown>,
        attribute?: string,
        theme?: string,
        successCallback?: (element: Element) => void,
        errorCallback?: (err: unknown) => void,
      ) => void;
    };
    __markdownItSmiles?: {
      renderAll?: () => void;
    };
  }
}

type PluginOptions = Parameters<typeof MarkdownItSmiles>[1];
type BasePluginOptions = Exclude<PluginOptions, undefined> extends object ? Exclude<PluginOptions, undefined> : Record<string, unknown>;
type ExtendedPluginOptions = BasePluginOptions & {
  injectRuntime?: boolean;
};

interface NodeScenario {
  id: string;
  title: string;
  description: string;
  markdown: string;
  options: Record<string, unknown>;
  errors: string[];
  html: string;
}

type SectionId = 'browser' | 'node' | 'playground';
type SectionRenderer = (section: HTMLElement) => void;

const nodeScenarios: NodeScenario[] = (nodeScenariosData as NodeScenarioSample[]).map((scenario) => ({
  ...scenario,
  errors: scenario.errors ?? [],
}));

const markdownItCache = new Map<string, MarkdownIt>();

function stringifyOptions(options?: ExtendedPluginOptions): string {
  if (!options) return 'default';
  try {
    return JSON.stringify(options);
  } catch (error) {
    console.warn('[examples] Failed to stringify plugin options', error);
    return Math.random().toString(36).slice(2);
  }
}

function getMarkdownIt(options?: ExtendedPluginOptions): MarkdownIt {
  const cacheKey = stringifyOptions(options);
  const cached = markdownItCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const md = new MarkdownIt({ html: true, breaks: true }).use(
    MarkdownItSmiles as unknown as (md: MarkdownIt, options?: ExtendedPluginOptions) => void,
    {
      injectRuntime: false,
      ...(options ?? {}),
    },
  );
  markdownItCache.set(cacheKey, md);
  return md;
}

function queueSmilesDraw(applyOptions?: Record<string, unknown>) {
  window.requestAnimationFrame(() => {
    window.__markdownItSmiles?.renderAll?.();
  });
}

function formatOptionsLiteral(options?: Record<string, unknown>): string {
  if (!options || Object.keys(options).length === 0) {
    return '';
  }
  return Object.entries(options)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: '${value}'`;
      }
      if (typeof value === 'object' && value !== null) {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${String(value)}`;
    })
    .join(', ');
}

function renderBrowserSection(section: HTMLElement) {
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `
    <h2 id="browser-heading">Browser Rendering Showcase</h2>
    <p>Demonstrates client-side rendering during page hydration, inline vs block SMILES, theming, and error handling states.</p>
  `;
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'molecule-grid';
  section.appendChild(grid);

  moleculeCatalog.forEach((sample) => {
    const card = document.createElement('article');
    card.className = 'molecule-card';
    card.dataset.source = sample.origin;

    const title = document.createElement('h3');
    title.textContent = sample.name;
    card.appendChild(title);

    const description = document.createElement('p');
    description.textContent = sample.description;
    card.appendChild(description);

    const rendered = document.createElement('div');
    rendered.className = 'browser-preview';
    rendered.innerHTML = `
      <div class="preview-grid">
        <div class="preview-meta">
          <strong>Inline</strong>
          <div class="rendered inline"></div>
        </div>
        <div class="preview-meta">
          <strong>Block</strong>
          <div class="rendered block"></div>
        </div>
      </div>
    `;

    const inlineContainer = rendered.querySelector('.rendered.inline') as HTMLElement;
    const blockContainer = rendered.querySelector('.rendered.block') as HTMLElement;

    const blockDefaults = { ...(sample.options ?? {}) } as Record<string, unknown>;
    const inlineDefaults = { ...(sample.options ?? {}) } as Record<string, unknown>;

    const blockSizing = sample.previewSize?.block;
    const inlineSizing = sample.previewSize?.inline;

    if (blockSizing?.width !== undefined) {
      blockDefaults.width = blockSizing.width;
    }
    if (blockSizing?.height !== undefined) {
      blockDefaults.height = blockSizing.height;
    }

    const fallbackInlineWidth = () => {
      const source = inlineSizing?.width ?? blockSizing?.width;
      return typeof source === 'number' ? Math.round(source * 0.6) : undefined;
    };

    const fallbackInlineHeight = () => {
      const source = inlineSizing?.height ?? blockSizing?.height;
      return typeof source === 'number' ? Math.round(source * 0.65) : undefined;
    };

    const inlineMaxDimension = 96;

    const inlineWidthCandidate = inlineSizing?.width ?? fallbackInlineWidth();
    const inlineHeightCandidate = inlineSizing?.height ?? fallbackInlineHeight();

    const finalInlineWidth = (() => {
      if (typeof inlineWidthCandidate === 'number') {
        return Math.min(inlineWidthCandidate, inlineMaxDimension - 1);
      }
      if (typeof inlineDefaults.width === 'number') {
        return Math.min(inlineDefaults.width, inlineMaxDimension - 1);
      }
      return inlineMaxDimension - 4;
    })();

    const finalInlineHeight = (() => {
      if (typeof inlineHeightCandidate === 'number') {
        return Math.min(inlineHeightCandidate, inlineMaxDimension - 1);
      }
      if (typeof inlineDefaults.height === 'number') {
        return Math.min(inlineDefaults.height, inlineMaxDimension - 1);
      }
      const proportional = Math.round(finalInlineWidth * 0.75);
      return Math.min(proportional, inlineMaxDimension - 1);
    })();

    inlineDefaults.width = finalInlineWidth;
    inlineDefaults.height = finalInlineHeight;

    const blockPluginOptions: ExtendedPluginOptions = {
      smilesDrawerOptions: {
        default: blockDefaults,
      },
      injectRuntime: false,
    };

    const inlinePluginOptions: ExtendedPluginOptions = {
      smilesDrawerOptions: {
        default: inlineDefaults,
      },
      injectRuntime: false,
    };

    const inlineMarkdown = `Inline SMILES example: $smiles{${sample.smiles}} embedded directly in a sentence.`;
    let blockMarkdown: string;
    if (sample.notes) {
      blockMarkdown = `> ${sample.notes}\n\n\`\`\`smiles\n${sample.smiles}\n\`\`\``;
    } else {
      const literal = formatOptionsLiteral(sample.options as Record<string, unknown> | undefined);
      blockMarkdown = literal
        ? `\`\`\`smiles { ${literal} }\n${sample.smiles}\n\`\`\``
        : `\`\`\`smiles\n${sample.smiles}\n\`\`\``;
    }

    const inlineMd = getMarkdownIt(inlinePluginOptions);
    const blockMd = getMarkdownIt(blockPluginOptions);
    inlineContainer.innerHTML = inlineMd.render(inlineMarkdown);
    blockContainer.innerHTML = blockMd.render(blockMarkdown);

    const codeBlock = document.createElement('pre');
    codeBlock.textContent = sample.smiles;
    card.appendChild(rendered);
    card.appendChild(codeBlock);

    const tagLine = document.createElement('div');
    tagLine.className = 'meta';
    tagLine.textContent = sample.tags.join(' • ');
    card.appendChild(tagLine);

    grid.appendChild(card);
    queueSmilesDraw();
  });
}

function createJsonPanel(label: string, data: unknown): HTMLElement {
  const pre = document.createElement('pre');
  pre.textContent = `${label}:\n${JSON.stringify(data, null, 2)}`;
  return pre;
}

function renderNodeSection(section: HTMLElement) {
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `
    <h2 id="node-heading">Node.js Render-at-Parse</h2>
    <p>Pre-rendered HTML generated with <code>renderAtParse</code>, showcasing custom loaders, theming, and error handling.</p>
  `;
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'node-preview-grid';
  section.appendChild(grid);

  nodeScenarios.forEach((scenario) => {
    const card = document.createElement('article');
    card.className = 'node-card';

    const headerEl = document.createElement('header');
    headerEl.innerHTML = `
      <h3>${scenario.title}</h3>
      <p>${scenario.description}</p>
    `;
    card.appendChild(headerEl);

    card.appendChild(createJsonPanel('Markdown', scenario.markdown));
    card.appendChild(createJsonPanel('Options', scenario.options));

    if (scenario.errors?.length) {
      const errorBox = document.createElement('div');
      errorBox.className = 'error-log';
      errorBox.innerHTML = `<strong>Errors</strong><br>${scenario.errors.join('<br>')}`;
      card.appendChild(errorBox);
    }

    const htmlPreview = document.createElement('div');
    htmlPreview.className = 'html-preview';
    htmlPreview.innerHTML = scenario.html;
    card.appendChild(htmlPreview);

    grid.appendChild(card);
  });

  queueSmilesDraw();
}

function loadMonaco(): Promise<any> {
  if (window.monaco) {
    return Promise.resolve(window.monaco);
  }
  if (window._monacoPromise) {
    return window._monacoPromise;
  }

  window._monacoPromise = new Promise((resolve, reject) => {
    const loader = document.createElement('script');
    loader.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.48.0/min/vs/loader.min.js';
    loader.crossOrigin = 'anonymous';
    loader.referrerPolicy = 'no-referrer';

    loader.onload = () => {
      if (!window.require) {
        reject(new Error('Monaco AMD loader failed to register window.require.'));
        return;
      }
      window.require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.48.0/min/vs',
        },
      });
      window.require(['vs/editor/editor.main'], (monaco: any) => {
        window.monaco = monaco;
        resolve(monaco);
      }, reject);
    };

    loader.onerror = () => reject(new Error('Failed to load Monaco Editor from CDN.'));
    document.body.appendChild(loader);
  });

  return window._monacoPromise;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

interface PlaygroundState {
  format: 'svg' | 'img';
  theme: 'light' | 'dark' | 'midnight';
  explicitHydrogens: boolean;
}

const defaultPlaygroundMarkdown = `# Interactive Playground\n\n$smiles{C1=CC=CC=C1} inline benzene\n\n\`\`\`smiles { width: 420, height: 300 }\nCN1C=NC2=C1C(=O)N(C(=O)N2C)C\n\`\`\`\n\n> Try editing the markdown, toggling options, or switching themes.`;

function renderPlayground(section: HTMLElement) {
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `
    <h2 id="playground-heading">Interactive Playground</h2>
    <p>Edit Markdown live with Monaco Editor, tweak plugin options, and preview browser rendering in real-time.</p>
  `;
  section.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'playground-layout';
  section.appendChild(layout);

  const toolbar = document.createElement('div');
  toolbar.className = 'playground-toolbar';
  toolbar.innerHTML = `
    <div class="toggles" role="group" aria-label="Format">
      <button type="button" class="toggle" data-toggle="format" data-value="svg" aria-pressed="true">SVG Output</button>
      <button type="button" class="toggle" data-toggle="format" data-value="img" aria-pressed="false">Raster Output</button>
    </div>
    <div class="toggles" role="group" aria-label="Theme">
      <button type="button" class="toggle" data-toggle="theme" data-value="light" aria-pressed="true">Light</button>
      <button type="button" class="toggle" data-toggle="theme" data-value="dark" aria-pressed="false">Dark</button>
      <button type="button" class="toggle" data-toggle="theme" data-value="midnight" aria-pressed="false">Midnight</button>
    </div>
    <div class="toggles" role="group" aria-label="Hydrogens">
      <button type="button" class="toggle" data-toggle="hydrogens" aria-pressed="false">Explicit Hydrogens</button>
    </div>
  `;
  layout.appendChild(toolbar);

  const editorShell = document.createElement('div');
  editorShell.className = 'monaco-shell loading';
  editorShell.setAttribute('role', 'region');
  editorShell.setAttribute('aria-label', 'Markdown editor');
  layout.appendChild(editorShell);

  const output = document.createElement('div');
  output.className = 'playground-output';
  output.innerHTML = `
    <div class="rendered-panel" aria-live="polite"></div>
    <div class="meta"></div>
  `;
  layout.appendChild(output);

  const renderedPanel = output.querySelector('.rendered-panel') as HTMLElement;
  const metaPanel = output.querySelector('.meta') as HTMLElement;

  const state: PlaygroundState = {
    format: 'svg',
    theme: 'light',
    explicitHydrogens: false,
  };

  function syncDocumentTheme() {
    const root = document.body;
    if (!root) return;
    const themeName = state.theme === 'light' ? null : state.theme;
    if (themeName) {
      root.setAttribute('data-playground-theme', themeName);
    } else {
      root.removeAttribute('data-playground-theme');
    }
  }

  const themeOverrides: Record<string, unknown> = {
    midnight: {
      themes: {
        midnight: {
          C: '#E0F2F1',
          O: '#FF8A80',
          N: '#64FFDA',
          H: '#FFFFFF',
          BACKGROUND: '#001F1F',
          S: '#FFD180',
          P: '#FAD02E',
          F: '#80CBC4',
          CL: '#4DB6AC',
          BR: '#FF7043',
          I: '#CE93D8',
          B: '#FFE57F',
          SI: '#B0BEC5',
        },
      },
      theme: 'midnight',
    },
  };

  let currentMarkdown = defaultPlaygroundMarkdown;

  syncDocumentTheme();

  function computeOptions(): ExtendedPluginOptions {
    const result: ExtendedPluginOptions = {
      format: state.format,
      injectRuntime: false,
      smilesDrawerOptions: {
        default: {
          theme: state.theme === 'midnight' ? 'midnight' : state.theme,
          explicitHydrogens: state.explicitHydrogens,
        },
      },
    };

    if (state.theme === 'midnight') {
      const defaults = result.smilesDrawerOptions?.default ?? {};
      Object.assign(defaults, themeOverrides.midnight);
      result.smilesDrawerOptions = {
        ...(result.smilesDrawerOptions ?? {}),
        default: defaults,
      };
    }

    return result;
  }

  const updatePreview = debounce(() => {
    const md = getMarkdownIt(computeOptions());
    renderedPanel.innerHTML = md.render(currentMarkdown);
    metaPanel.innerHTML = `
      <span>format: <code>${state.format}</code></span>
      <span>theme: <code>${state.theme}</code></span>
      <span>explicit hydrogens: <code>${state.explicitHydrogens ? 'on' : 'off'}</code></span>
    `;
    queueSmilesDraw();
  }, 180);

  toolbar.querySelectorAll<HTMLButtonElement>('button[data-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const toggle = button.dataset.toggle;
      if (!toggle) return;

      if (toggle === 'format') {
        const value = button.dataset.value as PlaygroundState['format'];
        if (value && value !== state.format) {
          state.format = value;
          toolbar
            .querySelectorAll<HTMLButtonElement>('button[data-toggle="format"]')
            .forEach((btn) => btn.setAttribute('aria-pressed', String(btn === button)));
          updatePreview();
        }
        return;
      }

      if (toggle === 'theme') {
        const value = button.dataset.value as PlaygroundState['theme'];
        if (value && value !== state.theme) {
          state.theme = value;
          syncDocumentTheme();
          toolbar
            .querySelectorAll<HTMLButtonElement>('button[data-toggle="theme"]')
            .forEach((btn) => btn.setAttribute('aria-pressed', String(btn === button)));
          updatePreview();
        }
        return;
      }

      if (toggle === 'hydrogens') {
        state.explicitHydrogens = !state.explicitHydrogens;
        button.setAttribute('aria-pressed', String(state.explicitHydrogens));
        updatePreview();
      }
    });
  });

  loadMonaco()
    .then((monaco) => {
      editorShell.classList.remove('loading');
      const editor = monaco.editor.create(editorShell, {
        value: defaultPlaygroundMarkdown,
        language: 'markdown',
        minimap: { enabled: false },
        automaticLayout: true,
        theme: 'vs-dark',
      });

      editor.onDidChangeModelContent(() => {
        currentMarkdown = editor.getValue();
        updatePreview();
      });

      updatePreview();
    })
    .catch((error) => {
      editorShell.classList.remove('loading');
      editorShell.textContent = `Failed to load Monaco Editor: ${error}`;
    });
}

function buildHero(root: HTMLElement, onNavigate: (targetId: SectionId) => void) {
  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `
    <div class="hero-content">
      <span class="badge">markdown-it plugin</span>
      <h1>Design, render, and experiment with SMILES visuals in Markdown.</h1>
      <p>
        Explore client-side rendering, Node.js parse-time generation, and an interactive editor powered by Monaco to fine-tune
        <code>markdown-it-smiles</code>.
      </p>
    </div>
  `;

  root.appendChild(hero);
}

function createTabs(root: HTMLElement, onNavigate: (targetId: SectionId) => void): Map<SectionId, HTMLElement> {
  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.innerHTML = `
    <button type="button" class="tab-button" id="browser-tab" role="tab" aria-selected="true" data-tab="browser">Browser</button>
    <button type="button" class="tab-button" id="node-tab" role="tab" aria-selected="false" data-tab="node">Node</button>
    <button type="button" class="tab-button" id="playground-tab" role="tab" aria-selected="false" data-tab="playground">Playground</button>
  `;

  tabs.querySelectorAll<HTMLButtonElement>('button[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;
      if (target) {
        onNavigate(target as SectionId);
      }
    });
  });

  root.appendChild(tabs);

  const sections = new Map<SectionId, HTMLElement>();
  (['browser', 'node', 'playground'] as const).forEach((id) => {
    const section = document.createElement('section');
    section.className = 'section';
    section.id = `${id}-section`;
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('aria-labelledby', `${id}-tab`);
    if (id === 'browser') {
      section.classList.add('active');
    }
    sections.set(id, section);
    root.appendChild(section);
  });

  return sections;
}

function setupNavigation(
  tabsRoot: HTMLElement,
  sections: Map<SectionId, HTMLElement>,
  renderers: Record<SectionId, SectionRenderer>,
) {
  let active: SectionId = 'browser';
  const rendered = new Set<SectionId>();

  function activate(target: SectionId) {
    if (target === active) {
      return;
    }

    tabsRoot.querySelectorAll<HTMLButtonElement>('button[data-tab]').forEach((button) => {
      button.setAttribute('aria-selected', String(button.dataset.tab === target));
    });

    sections.forEach((section, key) => {
      section.classList.toggle('active', key === target);
    });

    const targetSection = sections.get(target);
    if (targetSection && !rendered.has(target)) {
      renderers[target]?.(targetSection);
      rendered.add(target);
    }

    active = target;
    targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const navigate = (target: SectionId) => {
    if (!sections.has(target)) {
      return;
    }
    if (!rendered.has(target)) {
      renderers[target]?.(sections.get(target)!);
      rendered.add(target);
    }
    activate(target);
  };

  tabsRoot.querySelectorAll<HTMLButtonElement>('button[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;
      if (target) {
        navigate(target as SectionId);
      }
    });
  });

  // Render initial section.
  const initialSection = sections.get('browser');
  if (initialSection && renderers.browser) {
    renderers.browser(initialSection);
    rendered.add('browser');
  }
}

function bootstrap() {
  const app = document.getElementById('app');
  if (!app) {
    throw new Error('App root not found.');
  }

  const navigate = (targetId: SectionId) => {
    const tabsRoot = app.querySelector('.tabs');
    if (!tabsRoot) return;
    const targetButton = tabsRoot.querySelector<HTMLButtonElement>(`button[data-tab="${targetId}"]`);
    targetButton?.click();
  };

  buildHero(app, navigate);
  const sections = createTabs(app, navigate);

  setupNavigation(app.querySelector('.tabs')!, sections, {
    browser: renderBrowserSection,
    node: renderNodeSection,
    playground: renderPlayground,
  });

  queueSmilesDraw();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}

const smilesScript = document.querySelector<HTMLScriptElement>('script[src*="smiles-drawer"]');
if (smilesScript) {
  smilesScript.addEventListener('load', () => queueSmilesDraw());
}
