const markdownIt = require('markdown-it');
const { MarkdownItSmiles } = require('./dist/index');

const md = markdownIt({
    html: true,
    breaks: true,
    typographer: true,
});
md.use(MarkdownItSmiles, {});

const html = md.render(`
# Hello World

This is a test of the markdown-it library.
\`\`\`smiles
C1=CC=CC=C1
\`\`\`

$smiles{C1=CC=CC=C1}
`);
console.log(html);
