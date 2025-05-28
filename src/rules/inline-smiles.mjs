// Inline SMILES rule for markdown-it
export function smilesInline(state, silent) {
  const start = state.pos;
  const max = state.posMax;

  // Check if it starts with $smiles{
  if (start + 8 > max) return false;
  if (state.src.slice(start, start + 8) !== '$smiles{') return false;

  // Find closing }
  let pos = start + 8;
  let level = 1;
  
  while (pos < max && level > 0) {
    if (state.src[pos] === '{') {
      level++;
    } else if (state.src[pos] === '}') {
      level--;
    }
    pos++;
  }

  if (level !== 0) return false;

  const content = state.src.slice(start + 8, pos - 1);
  
  if (silent) return true;

  const token = state.push('smiles_inline', 'span', 0);
  token.content = content;
  token.markup = '$smiles{';

  state.pos = pos;
  return true;
} 