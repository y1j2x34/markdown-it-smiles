/**
 * markdown-it-smiles plugin
 *
 * This module provides a Markdown-it plugin for rendering SMILES (Simplified molecular input line entry specification)
 * strings as chemical structure diagrams. It supports both block and inline SMILES, and can render as SVG or
 * image using the smiles-drawer library.
 *
 * Usage:
 *   import MarkdownIt from 'markdown-it';
 *   import { MarkdownItSmiles } from 'markdown-it-smiles';
 *   const md = MarkdownIt().use(MarkdownItSmiles, options);
 *
 * Options:
 *   See PluginOptions in './plugin-options'.
 *
 * Features:
 *   - Block and inline SMILES rendering
 *   - Customizable rendering options (themes, size, etc.)
 *   - Node and browser support (with caveats for renderAtParse)
 *
 * @module markdown-it-smiles
 */

import { default as MarkdownIt } from 'markdown-it';
import { PluginContext, PluginOptions, SmilesDrawerLoaderResult } from './plugin-options';
import { smilesBlock } from './rules/smiles-block';
import { generateBlockRenderer, generateInlineRenderer } from './renderer/renderer';
import { smilesInline } from './rules/smiles-inline';
import { isBrowser } from './utils/isBrowser';
import { normalizeSmilesDrawerModule } from './utils/smilesDrawerModule';

const smilesDrawerScript = (() => {
    let script: string = '';
    return () => {
        const smilesDrawerScriptPath = require.resolve('smiles-drawer/dist/smiles-drawer.min.js');
        if (!script) {
            const fs = require('fs');
            script = fs.readFileSync(smilesDrawerScriptPath, 'utf-8');
        }
        return script;
    };
})();

interface RuntimeNamespace extends Record<string, unknown> {
    module?: SmilesDrawerLoaderResult;
    modulePromise?: Promise<SmilesDrawerLoaderResult>;
    scriptPromise?: Promise<SmilesDrawerLoaderResult>;
    loadSmilesDrawer?: () => Promise<SmilesDrawerLoaderResult> | SmilesDrawerLoaderResult;
    onError?: (error: Error) => void;
    __scheduled?: boolean;
    __observer?: MutationObserver;
    renderAll?: () => void;
}

function attachRenderAll(globalScope: typeof globalThis, namespace: RuntimeNamespace) {
    if (typeof document === 'undefined') {
        return;
    }

    if (typeof namespace.renderAll === 'function') {
        return;
    }

    const normalize = (module: unknown) => {
        try {
            return normalizeSmilesDrawerModule(module);
        } catch (error) {
            return null;
        }
    };

    const ensureModule = () => {
        if (namespace.modulePromise) {
            return namespace.modulePromise;
        }
        if (namespace.module) {
            return Promise.resolve(namespace.module);
        }
        const loader = namespace.loadSmilesDrawer;
        if (typeof loader === 'function') {
            try {
                const result = loader();
                if (result && typeof (result as Promise<unknown>).then === 'function') {
                    namespace.modulePromise = (result as Promise<SmilesDrawerLoaderResult>).then(mod => {
                        const normalized = normalize(mod);
                        if (!normalized) {
                            throw new Error('loadSmilesDrawer() did not return a SmilesDrawer export.');
                        }
                        namespace.module = normalized;
                        return normalized;
                    });
                } else {
                    const normalized = normalize(result);
                    if (!normalized) {
                        throw new Error('loadSmilesDrawer() did not return a SmilesDrawer export.');
                    }
                    namespace.module = normalized;
                    return Promise.resolve(normalized);
                }
            } catch (error) {
                namespace.modulePromise = Promise.reject(error);
            }
            if (namespace.modulePromise) {
                return namespace.modulePromise;
            }
        }

        const globalModule = (globalScope as { SmilesDrawer?: unknown }).SmilesDrawer;
        if (globalModule) {
            const normalized = normalize(globalModule);
            if (!normalized) {
                return Promise.reject(new Error('Global SmilesDrawer instance is invalid.'));
            }
            namespace.module = normalized;
            return Promise.resolve(normalized);
        }

        if (!namespace.scriptPromise) {
            namespace.scriptPromise = new Promise<SmilesDrawerLoaderResult>((resolve, reject) => {
                const scripts = document.querySelectorAll('script[src]');
                let target: HTMLScriptElement | null = null;
                for (let i = 0; i < scripts.length; i++) {
                    const node = scripts[i] as HTMLScriptElement;
                    if (/smiles-drawer/i.test(node.src)) {
                        target = node;
                        break;
                    }
                }
                if (!target) {
                    reject(new Error('No smiles-drawer script tag found. Provide a loader or set smilesDrawerScript.'));
                    return;
                }
                const cleanup = () => {
                    target?.removeEventListener('load', onLoad);
                    target?.removeEventListener('error', onError);
                };
                const onLoad = () => {
                    cleanup();
                    const globalSmilesDrawer = (globalScope as { SmilesDrawer?: unknown }).SmilesDrawer;
                    if (globalSmilesDrawer) {
                        try {
                            const normalized = normalize(globalSmilesDrawer);
                            if (!normalized) {
                                reject(new Error('smiles-drawer script loaded but SmiDrawer export was not found.'));
                                return;
                            }
                            namespace.module = normalized;
                            resolve(normalized);
                        } catch (err) {
                            reject(err as Error);
                        }
                    } else {
                        reject(new Error('smiles-drawer script loaded but global was undefined.'));
                    }
                };
                const onError = () => {
                    cleanup();
                    reject(new Error('Failed to load smiles-drawer script.'));
                };
                target.addEventListener('load', onLoad);
                target.addEventListener('error', onError);
            });
        }

        return namespace.scriptPromise ?? Promise.reject(new Error('Failed to resolve smiles-drawer module.'));
    };

    const shouldTrigger = (node: Node | null) => {
        if (!node || node.nodeType !== 1) {
            return false;
        }
        const element = node as Element;
        if (typeof element.matches === 'function' && element.matches('[data-smiles]')) {
            return true;
        }
        if (typeof element.querySelector === 'function' && element.querySelector('[data-smiles]')) {
            return true;
        }
        return false;
    };

    const installObserver = () => {
        if (typeof MutationObserver === 'undefined' || namespace.__observer) {
            return;
        }
        namespace.__observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (!mutation.addedNodes) {
                    continue;
                }
                for (const added of Array.from(mutation.addedNodes)) {
                    if (shouldTrigger(added)) {
                        scheduleRender();
                        return;
                    }
                }
            }
        });
        namespace.__observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    const scheduleRender = () => {
        if (namespace.__scheduled) {
            return;
        }
        namespace.__scheduled = true;
        const globalWithRAF = globalScope as typeof globalScope & {
            requestAnimationFrame?: typeof requestAnimationFrame;
            setTimeout: typeof setTimeout;
        };
        const scheduler =
            typeof globalWithRAF.requestAnimationFrame === 'function'
                ? globalWithRAF.requestAnimationFrame.bind(globalWithRAF)
                : (cb: FrameRequestCallback) => globalWithRAF.setTimeout(cb, 16);
        scheduler(() => {
            namespace.__scheduled = false;
            ensureModule()
                .then(mod => {
                    const normalized = normalize(mod);
                    if (!normalized || !normalized.SmiDrawer || typeof normalized.SmiDrawer.apply !== 'function') {
                        throw new Error('Resolved SmilesDrawer module does not expose SmiDrawer.apply.');
                    }
                    const onError = typeof namespace.onError === 'function' ? namespace.onError : null;
                    normalized.SmiDrawer.apply(undefined, undefined, undefined, undefined, null, onError ?? undefined);
                })
                .catch(error => {
                    console.error('[markdown-it-smiles]', error);
                });
        });
    };

    namespace.renderAll = () => {
        installObserver();
        scheduleRender();
    };
}

function createRuntimeBootstrap(): string {
    return `
<script>
(function (global) {
    var namespaceKey = "__markdownItSmiles";
    var namespace = global[namespaceKey] = global[namespaceKey] || {};

    function normalize(module) {
        if (!module) {
            return null;
        }
        if (module.SmiDrawer) {
            return module;
        }
        if (module.default) {
            return normalize(module.default);
        }
        return null;
    }

    function ensureModule() {
        if (namespace.modulePromise) {
            return namespace.modulePromise;
        }
        if (namespace.module) {
            return Promise.resolve(namespace.module);
        }
        if (typeof namespace.loadSmilesDrawer === 'function') {
            try {
                var result = namespace.loadSmilesDrawer();
                namespace.modulePromise = Promise.resolve(result).then(function (mod) {
                    var normalized = normalize(mod);
                    if (!normalized) {
                        throw new Error('loadSmilesDrawer() did not return a SmilesDrawer export.');
                    }
                    namespace.module = normalized;
                    return normalized;
                });
            } catch (error) {
                namespace.modulePromise = Promise.reject(error);
            }
            return namespace.modulePromise;
        }
        if (global.SmilesDrawer) {
            var normalized = normalize(global.SmilesDrawer);
            if (!normalized) {
                return Promise.reject(new Error('Global SmilesDrawer instance is invalid.'));
            }
            namespace.module = normalized;
            return Promise.resolve(normalized);
        }
        if (!namespace.scriptPromise) {
            namespace.scriptPromise = new Promise(function (resolve, reject) {
                var scripts = document.querySelectorAll('script[src]');
                var target = null;
                for (var i = 0; i < scripts.length; i++) {
                    var node = scripts[i];
                    if (/smiles-drawer/i.test(node.src)) {
                        target = node;
                        break;
                    }
                }
                if (!target) {
                    reject(new Error('No smiles-drawer script tag found. Provide a loader or set smilesDrawerScript.'));
                    return;
                }
                var cleanup = function () {
                    target.removeEventListener('load', onLoad);
                    target.removeEventListener('error', onError);
                };
                var onLoad = function () {
                    cleanup();
                    if (global.SmilesDrawer) {
                        try {
                            var normalized = normalize(global.SmilesDrawer);
                            if (!normalized) {
                                reject(new Error('smiles-drawer script loaded but SmiDrawer export was not found.'));
                                return;
                            }
                            namespace.module = normalized;
                            resolve(normalized);
                        } catch (err) {
                            reject(err);
                        }
                    } else {
                        reject(new Error('smiles-drawer script loaded but global was undefined.'));
                    }
                };
                var onError = function () {
                    cleanup();
                    reject(new Error('Failed to load smiles-drawer script.'));
                };
                target.addEventListener('load', onLoad);
                target.addEventListener('error', onError);
            });
        }
        return namespace.scriptPromise;
    }

    function scheduleRender() {
        if (namespace.__scheduled) {
            return;
        }
        namespace.__scheduled = true;
        var scheduler = global.requestAnimationFrame || function (cb) {
            return setTimeout(cb, 16);
        };
        scheduler(function () {
            namespace.__scheduled = false;
            ensureModule()
                .then(function (mod) {
                    var normalized = normalize(mod);
                    if (!normalized || !normalized.SmiDrawer || typeof normalized.SmiDrawer.apply !== 'function') {
                        throw new Error('Resolved SmilesDrawer module does not expose SmiDrawer.apply.');
                    }
                    var onError = typeof namespace.onError === 'function' ? namespace.onError : null;
                    normalized.SmiDrawer.apply(undefined, undefined, undefined, undefined, null, onError);
                })
                .catch(function (error) {
                    console.error('[markdown-it-smiles]', error);
                });
        });
    }

    function shouldTrigger(node) {
        if (!node || node.nodeType !== 1) {
            return false;
        }
        if (node.matches && node.matches('[data-smiles]')) {
            return true;
        }
        if (node.querySelector && node.querySelector('[data-smiles]')) {
            return true;
        }
        return false;
    }

    function installObserver() {
        if (typeof MutationObserver === 'undefined' || namespace.__observer) {
            return;
        }
        namespace.__observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (!mutation.addedNodes) {
                    continue;
                }
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    if (shouldTrigger(mutation.addedNodes[j])) {
                        scheduleRender();
                        return;
                    }
                }
            }
        });
        namespace.__observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    namespace.renderAll = namespace.renderAll || function () {
        installObserver();
        scheduleRender();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', namespace.renderAll, { once: true });
    } else {
        namespace.renderAll();
    }
})(typeof window !== 'undefined' ? window : globalThis);
</script>
`.replace(/ {4}/g, '');
}

/**
 * MarkdownItSmiles plugin function for Markdown-it.
 *
 * Registers block and inline SMILES rules and sets up rendering logic.
 *
 * @param md - The MarkdownIt instance to extend.
 * @param options - Plugin options for customizing rendering and behavior.
 */
export function MarkdownItSmiles(md: MarkdownIt, options: PluginOptions = {}) {

    // Register block and inline rules for SMILES
    md.block.ruler.before('fence', 'smiles_block', smilesBlock, {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });
    md.inline.ruler.before('emphasis', 'smiles_inline', smilesInline);

    // Plugin context to track if any SMILES were rendered
    const context: PluginContext = {
        hasSmiles: false,
    };

    if (isBrowser()) {
        const globalScope = globalThis as typeof globalThis & Record<string, unknown>;
        const namespaceKey = '__markdownItSmiles';
        const namespace = (globalScope[namespaceKey] as RuntimeNamespace | undefined) ?? ({} as RuntimeNamespace);
        if (!globalScope[namespaceKey]) {
            globalScope[namespaceKey] = namespace;
        }
        if (options.loadSmilesDrawer) {
            namespace.loadSmilesDrawer = options.loadSmilesDrawer;
        }
        if (options.errorHandling?.onError) {
            namespace.onError = options.errorHandling.onError;
        }
        attachRenderAll(globalScope, namespace);
    }

    // Register custom renderers for block and inline SMILES
    md.renderer.rules.smiles_block = generateBlockRenderer(options, context);
    md.renderer.rules.smiles_inline = generateInlineRenderer(options, context);

    // Patch the render method to inject scripts and styles if SMILES are present
    const oritinalRender = md.render;
    md.render = (src, env) => {
        context.hasSmiles = false;
        const html = oritinalRender.call(md, src, env);
        const hasSmiles = context.hasSmiles;
        context.hasSmiles = false;
        if (!hasSmiles) {
            return html;
        }

        // Function to read the script content (for inline script injection)
        const scriptContent = () => {
            // Only available in Node.js environment
            if (isBrowser()) {
                return '';
            }
            return smilesDrawerScript();
        };

        const script =
            options.smilesDrawerScript ?? 'https://cdn.jsdelivr.net/npm/smiles-drawer/dist/smiles-drawer.min.js';
        // Styles for SMILES blocks and inline elements
        const styles = `
            <style>
                .smiles-block {
                    display: inline-block;
                }
                .smiles-block > svg, .smiles-block > img {
                    width: 100%;
                    height: 100%;
                }
                .smiles-inline {
                    display: inline-block;
                    width: 1em;
                    height: 1em;
                    vertical-align: middle;
                }
                .smiles-inline > svg, .smiles-inline > img {
                    vertical-align: top;
                    width: 100%;
                    height: 100%;
                }
                .smiles-error {
                    color: red;
                    font-size: 12px;
                    font-weight: bold;
                    white-space: pre;
                    border-left: red 4px solid;
                    padding-left: 1em;
                }
                .smiles-error:before {
                    content: attr(data-smiles-error);
                    display: block;
                    margin-bottom: 0.5em;
                }
                .smiles-inline:has(.smiles-error) {
                    display: block;
                    height: fit-content;
                    width: fit-content;
                }
            </style>
        `.replace(/ {16}/g, '');

        const scriptTag = (() => {
            if (isBrowser() && options.loadSmilesDrawer) {
                return '';
            }
            if (script) {
                return `<script src="${script}"></script>`;
            }
            return `<script>${scriptContent()}</script>`;
        })();

        // Scripts for smiles-drawer (external or inline) and auto-apply
        const scripts = options.renderAtParse
            ? ''
            : [`${scriptTag}`, createRuntimeBootstrap()].filter(Boolean).join('');
        return html + scripts + styles;
    };
}
