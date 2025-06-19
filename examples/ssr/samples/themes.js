const markdownIt = require('markdown-it');
const { MarkdownItSmiles } = require('markdown-it-smiles');

module.exports = function generateThemesExample() {
    const md = markdownIt().use(MarkdownItSmiles, {
        renderAtParse: true,
        smilesDrawerOptions: {
            default: {
                width: 400,
                height: 300,
                theme: 'light',
            },
            dark: {
                width: 400,
                height: 300,
                theme: 'dark',
                bondThickness: 1.2,
            },
            minimal: {
                width: 350,
                height: 250,
                theme: 'light',
                bondThickness: 0.4,
            },
            bold: {
                width: 450,
                height: 350,
                theme: 'light',
                bondThickness: 1.5,
            },
        },
    });

    const content = `# Theme and Styling Examples

## Light Theme (Default)
\`\`\`smiles
CCO
\`\`\`
*Ethanol in light theme*

## Dark Theme
\`\`\`smiles {"theme": "dark", "width": 400, "height": 300}
CCO
\`\`\`
*Ethanol in dark theme*

## Minimal Style
\`\`\`smiles {"theme": "light", "bondThickness": 0.4, "width": 350, "height": 250}
c1ccccc1
\`\`\`
*Benzene with thin bonds*

## Bold Style
\`\`\`smiles {"theme": "light", "bondThickness": 1.5, "width": 450, "height": 350}
c1ccccc1
\`\`\`
*Benzene with thick bonds*

## Size Variations

### Small
\`\`\`smiles {"width": 250, "height": 200}
CC(=O)OC1=CC=CC=C1C(=O)O
\`\`\`

### Medium
\`\`\`smiles {"width": 400, "height": 300}
CC(=O)OC1=CC=CC=C1C(=O)O
\`\`\`

### Large
\`\`\`smiles {"width": 600, "height": 450}
CC(=O)OC1=CC=CC=C1C(=O)O
\`\`\`

## Mixed Styles in One Document

Caffeine (default):
\`\`\`smiles
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
\`\`\`
    
Caffeine (dark):
\`\`\`smiles {"theme": "dark"}
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
\`\`\`

Caffeine (bold):
\`\`\`smiles {"bondThickness": 1.8}
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
\`\`\`
`;

    const renderedHTML = md.render(content);

    return {
        id: 'themes',
        name: 'Themes & Styling',
        description: 'Different visual themes and styling options',
        options: {
            renderAtParse: true,
            smilesDrawerOptions: {
                default: {
                    width: 400,
                    height: 300,
                    theme: 'light',
                },
                dark: {
                    width: 400,
                    height: 300,
                    theme: 'dark',
                    bondThickness: 1.2,
                },
                minimal: {
                    width: 350,
                    height: 250,
                    theme: 'light',
                    bondThickness: 0.4,
                },
                bold: {
                    width: 450,
                    height: 350,
                    theme: 'light',
                    bondThickness: 1.5,
                },
            },
        },
        content: content,
        renderedHTML: renderedHTML,
        sourceCode: require('fs').readFileSync(__filename, 'utf8'),
        timestamp: new Date().toISOString(),
    };
};
