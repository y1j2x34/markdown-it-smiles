module.exports = {
  name: 'Basic Molecules',
  description: 'Simple molecular structures with default settings',
  options: {
    renderAtParse: true,
    smilesDrawerOptions: {
      default: {
        width: 400,
        height: 300,
        theme: 'light'
      }
    }
  },
  content: `# Basic Molecular Structures

## Simple Molecules
Water equivalent: $smiles{O}
Methane: $smiles{C}
Ethanol: $smiles{CCO}
Methanol: $smiles{CO}

## Basic Organic Compounds
Ethylene: $smiles{C=C}
Acetylene: $smiles{C#C}
Propane: $smiles{CCC}
Butane: $smiles{CCCC}

## Simple Cyclic Structures
\`\`\`smiles
C1CCCCC1
\`\`\`
*Cyclohexane - a six-membered ring*

\`\`\`smiles
c1ccccc1
\`\`\`
*Benzene - aromatic ring*`
}; 