import MarkdownIt from 'markdown-it';
import markdownItSmiles from '../src/index.mjs';

// Create markdown-it instance and use plugin
const md = new MarkdownIt().use(markdownItSmiles);

// Test cases
const testCases = [
    {
        name: 'Block SMILES - Basic',
        input: `# Chemical Structure

\`\`\`smiles
CCO
\`\`\`

This is ethanol.`,
        description: 'Basic block-level SMILES rendering',
    },
    {
        name: 'Block SMILES - With Options',
        input: `\`\`\`smiles {"width": 500, "height": 400, "bondThickness": 1.0}
C1CCCCC1
\`\`\``,
        description: 'Block-level SMILES rendering with options',
    },
    {
        name: 'Inline SMILES',
        input: `The molecule $smiles{CCO} is ethanol, while $smiles{C1CCCCC1} is cyclohexane.`,
        description: 'Inline SMILES rendering',
    },
    {
        name: 'Complex SMILES',
        input: `\`\`\`smiles
CC(C)(C)c1ccc(O)cc1
\`\`\`

This is 4-tert-butylphenol.`,
        description: 'Complex SMILES structure',
    },
    {
        name: 'Mixed Content',
        input: `# Organic Chemistry Examples

## Alcohols
The simplest alcohol is $smiles{CO} (methanol).

## Aromatic Compounds
\`\`\`smiles {"width": 300, "height": 250}
c1ccccc1
\`\`\`

Benzene is the simplest aromatic compound.`,
        description: 'Mixed content test',
    },
];

console.log('Testing markdown-it-smiles plugin...\n');

testCases.forEach((testCase, index) => {
    console.log(`\n=== Test ${index + 1}: ${testCase.name} ===`);
    console.log(`Description: ${testCase.description}`);
    console.log('\nInput:');
    console.log(testCase.input);
    console.log('\nOutput:');
    try {
        const result = md.render(testCase.input);
        console.log(result);
    } catch (error) {
        console.error('Error:', error.message);
    }

    console.log('\n' + '='.repeat(50));
});

console.log('\nAll tests completed!');
