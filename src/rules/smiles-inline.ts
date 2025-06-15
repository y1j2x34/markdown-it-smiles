import JSON5 from 'json5';
import { StateInline } from 'markdown-it/index.js';
import { SmileDrawerOptions } from '../plugin-options';

// Inline SMILES rule for markdown-it
export function smilesInline(state: StateInline, silent: boolean) {
    const start = state.pos;
    const max = state.posMax;

    // Check if it starts with $smiles{
    if (start + 8 > max) return false;
    if (state.src.slice(start, start + 8) !== '$smiles{') return false;

    // Find first closing }
    let pos = start + 8;
    let level = 1;
    let smilesEnd = -1;
    while (pos < max && level > 0) {
        if (state.src[pos] === '{') {
            level++;
        } else if (state.src[pos] === '}') {
            level--;
        }
        pos++;
    }
    if (level !== 0) return false;
    smilesEnd = pos;
    const smilesContent = state.src.slice(start + 8, pos - 1);

    // Check for second { (parameters)
    let params: Partial<SmileDrawerOptions> = {};
    let paramsEnd = smilesEnd;
    if (state.src[smilesEnd] === '{') {
        pos = smilesEnd + 1;
        let level = 1;
        while (pos < max && level > 0) {
            if (state.src[pos] === '{') {
                level++;
            } else if (state.src[pos] === '}') {
                level--;
            }
            pos++;
        }
        if (level === 0) {
            paramsEnd = pos;
            const paramsStr = state.src.slice(smilesEnd, pos).trim();
            if (paramsStr) {
                try {
                    params = JSON5.parse(paramsStr);
                } catch (error) {
                    // Ignore parsing errors, use default options
                }
            }
        }
    }

    if (silent) return true;

    const token = state.push('smiles_inline', 'span', 0);
    token.content = smilesContent;
    token.markup = '$smiles{';
    token.info = JSON.stringify(params);

    state.pos = paramsEnd;
    return true;
}
