// Generate unique ID for SMILES elements
export function generateId() {
  return 'smiles-' + Math.random().toString(36).substr(2, 9);
} 