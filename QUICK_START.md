# Quick Start Guide

Get started with markdown-it-smiles in just a few minutes!

## 🚀 Installation

```bash
npm install markdown-it-smiles
```

## 📝 Basic Usage

### Node.js

```javascript
const MarkdownIt = require('markdown-it');
const markdownItSmiles = require('markdown-it-smiles');

const md = new MarkdownIt().use(markdownItSmiles);

const result = md.render(`
The molecule $smiles{CCO} is ethanol.

\`\`\`smiles
CCO
\`\`\`
`);

console.log(result);
```

### Browser

```html
<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css?family=Droid+Sans:400,700" rel="stylesheet">
</head>
<body>
    <div id="content"></div>
    
    <script src="https://unpkg.com/markdown-it@14.0.0/dist/markdown-it.min.js"></script>
    <script src="https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js"></script>
    <script src="https://unpkg.com/markdown-it-smiles/dist/markdown-it-smiles.min.js"></script>
    
    <script>
        const md = window.markdownit().use(window.markdownItSmiles);
        const html = md.render('The molecule $smiles{CCO} is ethanol.');
        document.getElementById('content').innerHTML = html;
    </script>
</body>
</html>
```

## 📖 Syntax Examples

### Block SMILES

````markdown
```smiles
CCO
```
````

### Block SMILES with Options

````markdown
```smiles {"width": 500, "height": 400, "bondThickness": 1.0}
C1CCCCC1
```
````

### Inline SMILES

```markdown
The molecule $smiles{CCO} is ethanol.
```

## 🧪 Common SMILES Examples

| Molecule | SMILES | Usage |
|----------|--------|-------|
| Water | `O` | `$smiles{O}` |
| Methane | `C` | `$smiles{C}` |
| Ethanol | `CCO` | `$smiles{CCO}` |
| Benzene | `c1ccccc1` | `$smiles{c1ccccc1}` |
| Cyclohexane | `C1CCCCC1` | `$smiles{C1CCCCC1}` |
| Caffeine | `CN1C=NC2=C1C(=O)N(C(=O)N2C)C` | `$smiles{CN1C=NC2=C1C(=O)N(C(=O)N2C)C}` |

## ⚙️ Configuration

```javascript
const md = new MarkdownIt().use(markdownItSmiles, {
    includeScript: true,  // Auto-include rendering scripts
    smilesDrawerUrl: 'https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js',
    fontUrl: 'https://fonts.googleapis.com/css?family=Droid+Sans:400,700'
});
```

## 🎨 Styling Options

Available in block SMILES JSON options:

```json
{
    "width": 400,
    "height": 300,
    "bondThickness": 0.6,
    "bondLength": 15,
    "atomVisualization": "default",
    "terminalCarbons": false,
    "explicitHydrogens": false,
    "compactDrawing": true,
    "isomeric": true
}
```

## 🔧 Troubleshooting

### SMILES not rendering?

1. Make sure SmilesDrawer is loaded before the plugin
2. Check browser console for errors
3. Verify SMILES syntax is correct
4. Ensure canvas element has proper dimensions

### Invalid SMILES?

The plugin will show an error message on the canvas. Common issues:
- Unmatched parentheses: `C(C` → `C(C)`
- Invalid atom symbols: `X` → use valid elements like `C`, `N`, `O`
- Broken ring closures: `C1CCC` → `C1CCCC1`

## 📚 More Examples

Check out the included example files:
- `example.html` - Interactive demo
- `simple-example.html` - Basic usage
- `test/test.js` - Test cases

## 🆘 Need Help?

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/y1j2x34/markdown-it-smiles/issues)
- 💡 [SMILES Tutorial](http://www.daylight.com/dayhtml/doc/theory/theory.smiles.html)

---

Happy molecule drawing! 🧬 