import { default as MarkdownIt } from 'markdown-it';
import { PluginContext, PluginOptions } from './plugin-options';
import { smilesBlock } from './rules/smiles-block';
import { generateBlockRenderer, generateInlineRenderer } from './renderer/renderer';
import { smilesInline } from './rules/smiles-inline';

export function MarkdownItSmiles(md: MarkdownIt, options: PluginOptions) {
    md.block.ruler.before('fence', 'smiles_block', smilesBlock, {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });
    md.inline.ruler.before('emphasis', 'smiles_inline', smilesInline);

    const context: PluginContext = {
        hasSmiles: false,
    };

    md.renderer.rules.smiles_block = generateBlockRenderer(options, context);
    md.renderer.rules.smiles_inline = generateInlineRenderer(options, context);

    const oritinalRender = md.render;
    md.render = (src, env) => {
        const html = oritinalRender.call(md, src, env);
        if (!context.hasSmiles) {
            return html;
        }
        const scriptURL = options.smileDrawerScript ?? 'https://unpkg.com/smiles-drawer/dist/smiles-drawer.min.js';
        const scripts = `
            <script src="${scriptURL}"></script>
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    SmiDrawer.apply();
                })
            </script>
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
        return html + scripts;
    };
}
