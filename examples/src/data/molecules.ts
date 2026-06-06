export type MoleculeSource = 'smiles-drawer' | 'wikipedia';

export interface MoleculeRenderDimensions {
  width?: number;
  height?: number;
}

export interface MoleculePreviewSizing {
  inline?: MoleculeRenderDimensions;
  block?: MoleculeRenderDimensions;
}

export interface MoleculeSample {
  id: string;
  name: string;
  smiles: string;
  origin: MoleculeSource;
  description: string;
  notes?: string;
  options?: Record<string, unknown>;
  previewSize?: MoleculePreviewSizing;
  tags: string[];
}

export const moleculeCatalog: MoleculeSample[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    origin: 'smiles-drawer',
    description: 'Classic stimulant used in quick start examples. Shows hetero atoms and fused rings.',
    options: {
      width: 420,
      height: 320,
      atomVisualization: 'balls',
      explicitHydrogens: true
    },
    previewSize: {
      block: { width: 420, height: 320 },
      inline: { width: 96, height: 84 }
    },
    tags: ['alkaloid', 'stimulant', 'draw() demo']
  },
  {
    id: 'vanillin',
    name: 'Vanillin',
    smiles: 'c1(C=O)cc(OC)c(O)cc1',
    origin: 'smiles-drawer',
    description: 'Aromatic flavor compound highlighting substituted benzene ring handling.',
    options: {
      width: 380,
      height: 280,
      theme: 'light'
    },
    previewSize: {
      block: { width: 380, height: 280 },
      inline: { width: 94, height: 80 }
    },
    tags: ['aromatic', 'flavor']
  },
  {
    id: 'serotonin',
    name: 'Serotonin',
    smiles: 'C1=CC2=C(C=C1O)C(=CN2)CCN',
    origin: 'wikipedia',
    description: 'Neurotransmitter with indole structure. Captured from the Serotonin Wikipedia entry.',
    notes: 'Useful for demonstrating inline rendering inside narrative content.',
    options: {
      width: 360,
      height: 260,
      terminalCarbons: true
    },
    previewSize: {
      block: { width: 360, height: 260 },
      inline: { width: 92, height: 78 }
    },
    tags: ['neurotransmitter', 'biogenic amine']
  },
  {
    id: 'cholesterol',
    name: 'Cholesterol',
    smiles: 'C[C@H](CCCC(C)C)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC=C4[C@@]3(CC[C@@H](C4)O)C)C',
    origin: 'wikipedia',
    description: 'Steroid scaffold demonstrates stereochemistry annotations and ring fusions.',
    options: {
      width: 520,
      height: 340,
      compactDrawing: false,
      isometric: true
    },
    previewSize: {
      block: { width: 520, height: 340 },
      inline: { width: 96, height: 84 }
    },
    tags: ['stereochemistry', 'lipid']
  },
  {
    id: 'nicotine',
    name: 'Nicotine',
    smiles: 'c1ncccc1[C@@H]2CCCN2C',
    origin: 'wikipedia',
    description: 'Alkaloid featuring heterocycles, ideal for showcasing text-size adjustments.',
    options: {
      width: 360,
      height: 240,
      fontSizeLarge: 8
    },
    previewSize: {
      block: { width: 360, height: 240 },
      inline: { width: 88, height: 74 }
    },
    tags: ['alkaloid', 'heterocycle']
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    smiles: 'O=C(C)Oc1ccccc1C(=O)O',
    origin: 'wikipedia',
    description: 'Classic analgesic; great for demonstrating inline + block rendering combos.',
    options: {
      width: 320,
      height: 220,
      padding: 24
    },
    previewSize: {
      block: { width: 320, height: 220 },
      inline: { width: 86, height: 72 }
    },
    tags: ['analgesic', 'pharmaceutical']
  },
  {
    id: 'capsaicin',
    name: 'Capsaicin',
    smiles: 'O=C(NCc1cc(OC)c(O)cc1)CCCC/C=C/C(C)C',
    origin: 'wikipedia',
    description: 'Spicy vanilloid compound highlighting long chains with conjugated bonds.',
    options: {
      width: 520,
      height: 280,
      bondLength: 22,
      bondSpacing: 3.2
    },
    previewSize: {
      block: { width: 520, height: 280 },
      inline: { width: 96, height: 76 }
    },
    tags: ['vanilloid', 'hydrophobic chain']
  },
  {
    id: 'glucose',
    name: 'D-Glucose',
    smiles: 'C([C@@H]1[C@H]([C@@H]([C@H](C(O1)O)O)O)O)O',
    origin: 'smiles-drawer',
    description: 'Polyalcohol example showing chair conformation and stereochemical markers.',
    options: {
      width: 420,
      height: 320,
      theme: 'light',
      explicitHydrogens: true
    },
    previewSize: {
      block: { width: 420, height: 320 },
      inline: { width: 94, height: 82 }
    },
    tags: ['carbohydrate', 'stereochemistry']
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    origin: 'smiles-drawer',
    description: 'Propionic acid NSAID showing substituent control and inline sizing.',
    options: {
      width: 360,
      height: 240,
      theme: 'light'
    },
    previewSize: {
      block: { width: 360, height: 240 },
      inline: { width: 88, height: 74 }
    },
    tags: ['pharmaceutical', 'inline sizing']
  }
];
