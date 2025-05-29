import { default as MarkdownIt } from 'markdown-it';
import { PluginContext, PluginOptions } from './plugin-options';
import { smilesBlock } from './rules/smiles-block';
import { generateBlockRenderer, generateInlineRenderer } from './renderer/render-block';
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

    md.core.ruler.after('normalize', 'add_script', state => {
        if (!context.hasSmiles) {
            return false;
        }
        const token = new state.Token('html_block', '', 0);
        const scriptURL = options.smileDrawerScript ?? 'https://unpkg.com/smile-drawer/dist/index.min.js';
        token.content = `
            <script src="${scriptURL}"></script>
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    SmiDrawer.apply();
                })
            </script>
        `;
        state.tokens.push(token);
        return true;
    });
}
