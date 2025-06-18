module.exports = {
  name: 'Complex Molecules',
  description: 'Pharmaceutical compounds and natural products',
  options: {
    renderAtParse: true,
    smilesDrawerOptions: {
      default: {
        width: 500,
        height: 400,
        theme: 'light',
        bondThickness: 0.8
      },
      large: {
        width: 600,
        height: 500,
        theme: 'light',
        bondThickness: 1.0
      }
    }
  },
  content: `# Complex Molecular Structures

## Pharmaceutical Compounds

### Aspirin
\`\`\`smiles {"width": 500, "height": 350}
CC(=O)OC1=CC=CC=C1C(=O)O
\`\`\`
*Acetylsalicylic acid - widely used analgesic and antipyretic*

### Caffeine
\`\`\`smiles {"width": 450, "height": 400}
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
\`\`\`
*1,3,7-trimethylxanthine - central nervous system stimulant*

### Ibuprofen
\`\`\`smiles {"width": 550, "height": 350}
CC(C)CC1=CC=C(C=C1)C(C)C(=O)O
\`\`\`
*Nonsteroidal anti-inflammatory drug (NSAID)*

## Natural Products

### Glucose
\`\`\`smiles {"width": 400, "height": 350}
C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O)O)O)O)O
\`\`\`
*α-D-glucopyranose - primary source of energy for cells*

### Morphine
\`\`\`smiles {"width": 500, "height": 450, "theme": "dark"}
CN1CC[C@]23C4=C5C=CC(O)=C4O[C@H]2[C@@H](O)C=C[C@H]3[C@H]1C5
\`\`\`
*Opiate alkaloid - potent pain medication*

### Cholesterol
\`\`\`smiles {"width": 600, "height": 400}
C[C@H](CCCC(C)C)[C@H]1CC[C@@H]2[C@@H]3CC=C4C[C@@H](O)CC[C@]4(C)[C@H]3CC[C@]12C
\`\`\`
*Sterol - essential component of cell membranes*`
}; 