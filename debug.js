const markdownIt = require('markdown-it');
const { MarkdownItSmiles } = require('./dist/index');

const md = markdownIt({
    html: true,
    breaks: true,
    typographer: true,
});
md.use(MarkdownItSmiles, {
    format: 'img',
    renderAtParse: true,
});

const html = md.render(`
# Hello World

This is a test of the markdown-it library.
\`\`\`smiles { width: 100, height: 100}
C1=CC=CC=C1
\`\`\`

$smiles{C1=CC=CC=C1}{width: 10, height: 10} hello world

---

# Drug Discovery Research

## Analgesics Comparison

### Aspirin
$smiles{CC(=O)OC1=CC=CC=C1C(=O)O} is widely used for pain relief.

### Ibuprofen  
$smiles{CC(C)CC1=CC=C(C=C1)C(C)C(=O)O}{width: 32, height: 32} offers anti-inflammatory properties.

## Detailed Structure Analysis

\`\`\`smiles {"width": 500, "height": 400}
CC(=O)OC1=CC=CC=C1C(=O)O
\`\`\`

The aspirin molecule shows the characteristic acetyl group...
`);
console.log(html)
require('fs').writeFileSync('debug.html', html);