import { smilesBlock } from './rules/block-smiles.mjs';
import { smilesInline } from './rules/inline-smiles.mjs';
import { renderSmilesBlock, renderSmilesInline } from './renderers/smiles-renderers.mjs';
import { getCSS } from './utils/styles.mjs';
import { getClientScript } from './utils/client-script.mjs';

// Main plugin function
export default function markdownItSmiles(md, options) {
    options = options || {};
    // Register block rule
    md.block.ruler.before('fence', 'smiles_block', smilesBlock, {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });

    // Register inline rule
    md.inline.ruler.before('emphasis', 'smiles_inline', smilesInline);

    // Register renderers
    md.renderer.rules.smiles_block = renderSmilesBlock;
    md.renderer.rules.smiles_inline = renderSmilesInline;

    // Add necessary scripts and styles if needed
    if (options.includeScript !== false) {
        const originalRender = md.render.bind(md);
        md.render = function (src, env) {
            const result = originalRender(src, env);

            // Check if SMILES content is included
            if (result.includes('data-smiles')) {
                const smilesDrawerScript =
                    options.smilesDrawerUrl || 'https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js';
                const fontLink = options.fontUrl || 'https://fonts.googleapis.com/css?family=Droid+Sans:400,700';

                return (
                    `<link href="${fontLink}" rel="stylesheet">\n` +
                    getCSS() +
                    '\n' +
                    result +
                    '\n' +
                    `<script src="${smilesDrawerScript}"></script>\n` +
                    getClientScript()
                );
            }
            return result;
        };
    }
}
