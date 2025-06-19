import { generateId } from '../utils/id-generator.mjs';

// Render functions for SMILES tokens
export function renderSmilesBlock(tokens, idx, options, env, renderer) {
    const token = tokens[idx];
    const smiles = token.content;
    const smilesOptions = token.info || {};
    const id = generateId();
    const width = smilesOptions.width || 400;
    const height = smilesOptions.height || 300;

    return [
        '<div class="smiles-container">',
        '<canvas',
        ` id="${id}"`,
        ` width="${width}"`,
        ` height="${height}"`,
        ` data-smiles="${smiles}"`,
        ` data-options='${JSON.stringify(smilesOptions)}'></canvas>`,
        '</div>\n',
    ].join('');
}

export function renderSmilesInline(tokens, idx, options, env, renderer) {
    const token = tokens[idx];
    const smiles = token.content;

    const id = generateId();
    const width = 200;
    const height = 150;
    const optionsStr = `{"width":${width},"height":${height}}`;

    return [
        '<canvas',
        ' class="smiles-inline"',
        ` id="${id}"`,
        ` width="${width}"`,
        ` height="${height}"`,
        ` data-smiles="${smiles}"`,
        ` data-options='${optionsStr}'></canvas>`,
    ].join('');
}
