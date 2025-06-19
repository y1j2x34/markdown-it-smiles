// Block-level SMILES rule for markdown-it
export function smilesBlock(state, start, end, silent) {
    const marker = '```';
    let pos = state.bMarks[start] + state.tShift[start];
    let max = state.eMarks[start];

    // Check if it starts with ```
    if (pos + 3 > max) return false;

    const markerStr = state.src.slice(pos, pos + 3);
    if (markerStr !== marker) return false;

    pos += 3;
    const firstLine = state.src.slice(pos, max).trim();

    // Check if it's a smiles code block
    if (!firstLine.startsWith('smiles')) return false;

    // Parse options (if any)
    const optionsMatch = firstLine.match(/^smiles\s*({.*})?/);
    let options = {};
    if (optionsMatch && optionsMatch[1]) {
        try {
            options = JSON.parse(optionsMatch[1]);
        } catch (e) {
            // Ignore parsing errors, use default options
        }
    }

    if (silent) return true;

    // Find end marker
    let nextLine = start + 1;
    let haveEndMarker = false;

    while (nextLine < end) {
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (pos < max && state.sCount[nextLine] < state.blkIndent) {
            break;
        }
        if (state.src.slice(pos, pos + 3) === marker) {
            haveEndMarker = true;
            break;
        }

        nextLine++;
    }

    if (!haveEndMarker) return false;

    // Extract SMILES content
    const content = state.getLines(start + 1, nextLine, 0, false).trim();

    const token = state.push('smiles_block', 'div', 0);
    token.content = content;
    token.info = options;
    token.map = [start, nextLine + 1];

    state.line = nextLine + 1;
    return true;
}
