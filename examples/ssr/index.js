const markdownIt = require('markdown-it');
const markdownItSmiles = require('markdown-it-smiles');

const md = markdownIt().use(markdownItSmiles);

const content = `

`;

console.log(md.render(content));
