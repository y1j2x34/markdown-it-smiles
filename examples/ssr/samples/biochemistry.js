const markdownIt = require('markdown-it');
const { MarkdownItSmiles } = require('markdown-it-smiles');

module.exports = function generateBiochemistryExample() {
    const md = markdownIt().use(MarkdownItSmiles, {
        renderAtParse: true,
        smilesDrawerOptions: {
            default: {
                width: 400,
                height: 300,
                theme: 'light',
            },
            amino: {
                width: 350,
                height: 280,
                theme: 'light',
                bondThickness: 0.7,
            },
            nucleotide: {
                width: 500,
                height: 400,
                theme: 'light',
                bondThickness: 0.8,
            },
        },
    });

    const content = `# Biochemical Molecules

## Amino Acids

### Glycine (Simplest)
\`\`\`smiles {"width": 300, "height": 200}
NCC(=O)O
\`\`\`
*The simplest amino acid*

### Alanine
\`\`\`smiles {"width": 350, "height": 250}
C[C@@H](N)C(=O)O
\`\`\`
*Second simplest amino acid*

### Phenylalanine
\`\`\`smiles {"width": 450, "height": 350}
N[C@@H](Cc1ccccc1)C(=O)O
\`\`\`
*Aromatic amino acid - essential*

### Tryptophan
\`\`\`smiles {"width": 500, "height": 400}
N[C@@H](Cc1c[nH]c2ccccc12)C(=O)O
\`\`\`
*Largest amino acid - essential*

## Nucleotides

### Adenine
\`\`\`smiles {"width": 400, "height": 350}
Nc1ncnc2[nH]cnc12
\`\`\`
*Purine base in DNA/RNA*

### Guanine
\`\`\`smiles {"width": 400, "height": 350}
Nc1nc2[nH]cnc2c(=O)[nH]1
\`\`\`
*Purine base in DNA/RNA*

### Cytosine
\`\`\`smiles {"width": 350, "height": 300}
Nc1cc[nH]c(=O)n1
\`\`\`
*Pyrimidine base in DNA/RNA*

### Thymine
\`\`\`smiles {"width": 350, "height": 300}
Cc1c[nH]c(=O)[nH]c1=O
\`\`\`
*Pyrimidine base in DNA*

## Vitamins

### Vitamin C (Ascorbic Acid)
\`\`\`smiles {"width": 450, "height": 350}
OC[C@H](O)[C@H]1OC(=O)C(O)=C1O
\`\`\`
*Essential vitamin - antioxidant*

### Vitamin B1 (Thiamine)
\`\`\`smiles {"width": 500, "height": 400}
CCc1ncc(C[n+]2csc(N)c2C)c(N)n1
\`\`\`
*Essential for carbohydrate metabolism*

## Neurotransmitters

### Dopamine
\`\`\`smiles {"width": 400, "height": 300}
NCCc1ccc(O)c(O)c1
\`\`\`
*Reward and pleasure neurotransmitter*

### Serotonin
\`\`\`smiles {"width": 450, "height": 350}
NCCc1c[nH]c2ccc(O)cc12
\`\`\`
*Mood regulation neurotransmitters*

### GABA
\`\`\`smiles {"width": 300, "height": 200}
NCCCC(=O)O
\`\`\`
*Inhibitory neurotransmitter*`;

    const renderedHTML = md.render(content);

    return {
        id: 'biochemistry',
        name: 'Biochemistry',
        description: 'Amino acids, nucleotides, and biomolecules',
        options: {
            renderAtParse: true,
            smilesDrawerOptions: {
                default: {
                    width: 400,
                    height: 300,
                    theme: 'light',
                },
                amino: {
                    width: 350,
                    height: 280,
                    theme: 'light',
                    bondThickness: 0.7,
                },
                nucleotide: {
                    width: 500,
                    height: 400,
                    theme: 'light',
                    bondThickness: 0.8,
                },
            },
        },
        content: content,
        renderedHTML: renderedHTML,
        sourceCode: require('fs').readFileSync(__filename, 'utf8'),
        timestamp: new Date().toISOString(),
    };
};
