# markdown-it-smiles

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin for rendering chemical structures from SMILES notation using [smilesDrawer](https://github.com/reymond-group/smilesDrawer).

## 🌐 Live Demo

**[View Interactive Demo →](https://y1j2x34.github.io/markdown-it-smiles/)**

Try the plugin live with interactive examples showcasing all features!

## Features

- 🧪 **Block-level SMILES rendering** with customizable options
- 🔬 **Inline SMILES rendering** for seamless integration in text
- ⚙️ **Configurable rendering options** (size, bond thickness, etc.)
- 🎨 **Responsive design** with mobile support
- 🚀 **High performance** using canvas-based rendering
- 📱 **Cross-platform** compatibility

## Installation

```bash
npm install markdown-it-smiles
```

## Usage

### Basic Setup

```javascript
const MarkdownIt = require('markdown-it');
const markdownItSmiles = require('markdown-it-smiles');

const md = new MarkdownIt().use(markdownItSmiles);

const result = md.render(`
# Chemical Structure

\`\`\`smiles
CCO
\`\`\`

The molecule $smiles{CCO} is ethanol.
`);
```

### Browser Usage

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

## Syntax

### Block SMILES

Use fenced code blocks with the `smiles` language identifier:

````markdown
```smiles
CCO
```
````

#### With Options

You can specify rendering options as JSON:

````markdown
```smiles {"width": 500, "height": 400, "bondThickness": 1.0}
C1CCCCC1
```
````

### Inline SMILES

Use the `$smiles{...}` syntax for inline rendering:

```markdown
The molecule $smiles{CCO} is ethanol, while $smiles{C1CCCCC1} is cyclohexane.
```

## Configuration Options

### Plugin Options

```javascript
const md = new MarkdownIt().use(markdownItSmiles, {
    includeScript: true,  // Include rendering scripts automatically
    smilesDrawerUrl: 'https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js',
    fontUrl: 'https://fonts.googleapis.com/css?family=Droid+Sans:400,700'
});
```

### Rendering Options

These options can be specified in block SMILES:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 400 | Canvas width in pixels |
| `height` | number | 300 | Canvas height in pixels |
| `bondThickness` | number | 0.6 | Thickness of chemical bonds |
| `bondLength` | number | 15 | Length of chemical bonds |
| `shortBondLength` | number | 0.85 | Short bond length ratio |
| `bondSpacing` | number | 2.7 | Spacing between double bonds |
| `atomVisualization` | string | 'default' | Atom visualization mode |
| `fontSizeLarge` | number | 5 | Large font size for elements |
| `fontSizeSmall` | number | 3 | Small font size for numbers |
| `padding` | number | 20.0 | Canvas padding |
| `terminalCarbons` | boolean | false | Show terminal carbons (CH3) |
| `explicitHydrogens` | boolean | false | Show explicit hydrogens |
| `compactDrawing` | boolean | true | Use compact drawing mode |
| `isomeric` | boolean | true | Draw isometric SMILES |

## Examples

### Basic Molecules

````markdown
# Basic Molecules

Water: $smiles{O}
Methane: $smiles{C}
Ethanol: $smiles{CCO}

## Ethanol Structure
```smiles
CCO
```
````

### Organic Compounds

````markdown
# Organic Chemistry

## Aromatic Compounds

Benzene:
```smiles {"width": 300, "height": 250}
c1ccccc1
```

Toluene: $smiles{Cc1ccccc1}
````

### Drug Molecules

````markdown
# Pharmaceutical Compounds

## Aspirin
```smiles {"width": 400, "height": 300}
CC(=O)OC1=CC=CC=C1C(=O)O
```

## Caffeine
```smiles
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
```
````

### Complex Structures

````markdown
# Complex Molecules

Vitamin C: $smiles{OC[C@H](O)[C@H]1OC(=O)C(O)=C1O}

## Cholesterol
```smiles {"width": 500, "height": 400, "bondThickness": 0.8}
CC(C)CCCC(C)C1CCC2C1(CCC3C2CC=C4C3(CCC(C4)O)C)C
```
````

## SMILES Notation

SMILES (Simplified Molecular Input Line Entry System) is a specification for describing the structure of chemical molecules using short ASCII strings. Here are some basic examples:

- `C` - Methane
- `CC` - Ethane  
- `CCO` - Ethanol
- `C1CCCCC1` - Cyclohexane
- `c1ccccc1` - Benzene
- `CC(=O)O` - Acetic acid
- `CN1C=NC2=C1C(=O)N(C(=O)N2C)C` - Caffeine

For more information about SMILES notation, visit [Daylight Chemical Information Systems](http://www.daylight.com/dayhtml/doc/theory/theory.smiles.html).

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- [markdown-it](https://github.com/markdown-it/markdown-it) >= 8.0.0
- [smiles-drawer](https://github.com/reymond-group/smilesDrawer) ^1.0.10

## Development

```bash
# Clone the repository
git clone https://github.com/y1j2x34/markdown-it-smiles.git
cd markdown-it-smiles

# Install dependencies
npm install

# Run tests
npm test

# Build for browser
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [smilesDrawer](https://github.com/reymond-group/smilesDrawer) for the excellent chemical structure rendering
- [markdown-it](https://github.com/markdown-it/markdown-it) for the extensible markdown parser
- The chemistry community for SMILES notation

## Related Projects

- [smilesDrawer](https://github.com/reymond-group/smilesDrawer) - JavaScript library for drawing chemical structures
- [markdown-it](https://github.com/markdown-it/markdown-it) - Markdown parser with plugin support
- [RDKit](https://github.com/rdkit/rdkit) - Cheminformatics toolkit

---

Made with ❤️ for the chemistry and web development communities. 