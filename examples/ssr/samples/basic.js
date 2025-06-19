const markdownIt = require('markdown-it');
const { MarkdownItSmiles } = require('markdown-it-smiles');

module.exports = function generateBasicExample() {
    const md = markdownIt().use(MarkdownItSmiles, {
        renderAtParse: true,
        smilesDrawerOptions: {
            default: {
                width: 400,
                height: 300,
                theme: 'light',
            },
        },
    });

    const content = `# Basic Molecular Structures

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
*Benzene - aromatic ring*`;

    const renderedHTML = md.render(content);

    return {
        id: 'basic',
        name: 'Basic Molecules',
        description: 'Simple molecular structures with default settings',
        options: {
            renderAtParse: true,
            smilesDrawerOptions: {
                default: {
                    width: 400,
                    height: 300,
                    theme: 'light',
                },
            },
        },
        content: content,
        renderedHTML: renderedHTML,
        sourceCode: require('fs').readFileSync(__filename, 'utf8'),
        timestamp: new Date().toISOString(),
    };
};
