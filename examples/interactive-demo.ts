import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from 'markdown-it-smiles';

type ExampleKey = 'basic' | 'organic' | 'drugs' | 'inline';

type ExamplesMap = Record<ExampleKey, string>;

declare global {
    interface Window {
        loadExample: (type: ExampleKey) => void;
    }
}

const md = MarkdownIt().use(MarkdownItSmiles, {
    smilesDrawerOptions: {
        default: {
            bondThickness: '0.6px',
            bondLength: '15px',
            atomVisualization: 'default',
            isomeric: false,
            terminalCarbons: false,
            explicitHydrogens: false,
            compactDrawing: true,
            fontSizeLarge: '5pt',
            fontSizeSmall: '3pt',
            padding: '1.25rem',
        },
    },
});

const markdownInputElement = document.getElementById('markdown-input');
const outputContainerElement = document.getElementById('output');

if (!(markdownInputElement instanceof HTMLTextAreaElement)) {
    throw new Error('Interactive demo markdown input is missing from the document.');
}

if (!(outputContainerElement instanceof HTMLElement)) {
    throw new Error('Interactive demo output container is missing from the document.');
}

const markdownInput = markdownInputElement;
const outputContainer = outputContainerElement;

const examples: ExamplesMap = {
    basic: `# Basic SMILES Examples

## Simple Molecules
Water: $smiles{O}
Methane: $smiles{C}
Ethanol: $smiles{CCO}

## Block Examples
\`\`\`smiles
CCO
\`\`\``,
    organic: `# Organic Chemistry

## Alcohols
- Methanol: $smiles{CO}
- Ethanol: $smiles{CCO}
- Propanol: $smiles{CCCO}

## Aromatic Compounds
Benzene:
\`\`\`smiles {"width": 300, "height": 250}
c1ccccc1
\`\`\`

Toluene:
\`\`\`smiles
Cc1ccccc1
\`\`\``,
    drugs: `# Drug Molecules

## Aspirin
\`\`\`smiles {"width": 400, "height": 300}
CC(=O)OC1=CC=CC=C1C(=O)O
\`\`\`

## Caffeine
\`\`\`smiles {"width": 400, "height": 300}
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
\`\`\`

## Ibuprofen
\`\`\`smiles
CC(C)CC1=CC=C(C=C1)C(C)C(=O)O
\`\`\``,
    inline: `# Inline SMILES Examples

Common solvents include $smiles{CCO} (ethanol), $smiles{O} (water), and $smiles{CC(C)=O} (acetone).

The difference between $smiles{C1CCCCC1} (cyclohexane) and $smiles{c1ccccc1} (benzene) is aromaticity.

Functional groups: $smiles{CC(=O)O} (carboxylic acid), $smiles{CCO} (alcohol), $smiles{CC=O} (aldehyde).`,
};

function createIframe(content: string) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 479px;
        height: 1778px;
        border: none;
    `;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Droid Sans', Arial, sans-serif;
                    padding: 10px;
                    margin: 0;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    iframe.addEventListener(
        'load',
        () => {
            URL.revokeObjectURL(url);
            const doc = iframe.contentDocument;
            if (doc?.body) {
                const height = doc.body.scrollHeight + 100;
                const width = doc.body.scrollWidth + 40;
                iframe.style.height = `${height}px`;
                iframe.style.width = `${width}px`;
            }
        },
        { once: true }
    );
    return iframe;
}

function updateOutput() {
    try {
        const iframe = createIframe(md.render(markdownInput.value));
        outputContainer.innerHTML = '';
        outputContainer.appendChild(iframe);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        outputContainer.innerHTML = `<p style="color: red;">Error: ${message}</p>`;
    }
}

function loadExample(type: ExampleKey) {
    const example = examples[type];
    markdownInput.value = example;
    updateOutput();
}

window.loadExample = loadExample;
markdownInput.addEventListener('input', updateOutput);
updateOutput();
