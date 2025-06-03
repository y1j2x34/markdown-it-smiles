/**
 * markdown-it-smiles plugin
 *
 * This module provides a Markdown-it plugin for rendering SMILES (Simplified Molecular Input Line Entry System) strings as chemical structure diagrams.
 * It supports both block and inline SMILES, and can render as SVG or image using the smiles-drawer library.
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
import { PluginContext, PluginOptions } from './plugin-options';
import { smilesBlock } from './rules/smiles-block';
import { generateBlockRenderer, generateInlineRenderer } from './renderer/renderer';
import { smilesInline } from './rules/smiles-inline';

/**
 * MarkdownItSmiles plugin function for Markdown-it.
 *
 * Registers block and inline SMILES rules and sets up rendering logic.
 *
 * @param md - The MarkdownIt instance to extend.
 * @param options - Plugin options for customizing rendering and behavior.
 */
export function MarkdownItSmiles(md: MarkdownIt, options: PluginOptions = {}) {
    // Warn and disable renderAtParse in browser environments
    if (options.renderAtParse) {
        if (typeof document !== 'undefined') {
            console.warn('renderAtParse is not supported in browser environment, it will be ignored');
            options.renderAtParse = false;
        }
    }

    // Register block and inline rules for SMILES
    md.block.ruler.before('fence', 'smiles_block', smilesBlock, {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });
    md.inline.ruler.before('emphasis', 'smiles_inline', smilesInline);

    // Plugin context to track if any SMILES were rendered
    const context: PluginContext = {
        hasSmiles: false,
    };

    // Register custom renderers for block and inline SMILES
    md.renderer.rules.smiles_block = generateBlockRenderer(options, context);
    md.renderer.rules.smiles_inline = generateInlineRenderer(options, context);

    // Patch the render method to inject scripts and styles if SMILES are present
    const oritinalRender = md.render;
    md.render = (src, env) => {
        const html = oritinalRender.call(md, src, env);
        if (!context.hasSmiles) {
            return html;
        }
        // Resolve the path to the smiles-drawer script
        const scriptPath = require.resolve('smiles-drawer/dist/smiles-drawer.min.js');
        // Function to read the script content (for inline script injection)
        const scriptContent = () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const fs = require('fs');
            const content = fs.readFileSync(scriptPath, 'utf-8');
            return content;
        };
        const scriptURL = options.smileDrawerScript;
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
                }
            </style>
        `.replace(/ {4}/g, '');
        // Scripts for smiles-drawer (external or inline) and auto-apply
        const scripts = options.renderAtParse
            ? ''
            : `
            ${scriptURL ? `<script src="${scriptURL}"></script>` : `<script>${scriptContent()}</script>`}
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    SmiDrawer.apply();
                })
            </script>
        `.replace(/ {4}/g, '');
        return html + scripts + styles;
    };
}
