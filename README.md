# markdown-it-smiles

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d7d1c7f439d94a90b6ba459a7c63bc93)](https://app.codacy.com/gh/y1j2x34/markdown-it-smiles/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/d7d1c7f439d94a90b6ba459a7c63bc93)](https://app.codacy.com/gh/y1j2x34/markdown-it-smiles/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)


A [markdown-it](https://github.com/markdown-it/markdown-it) plugin for rendering chemical structures from SMILES notation using [smilesDrawer](https://github.com/reymond-group/smilesDrawer).

## 🌐 Live Demo

**[View Interactive Demo →](https://y1j2x34.github.io/markdown-it-smiles/)**

Try the plugin live with interactive examples showcasing all features!

## Features

- 🧪 **Block-level SMILES rendering** with customizable options
- 🔬 **Inline SMILES rendering** for seamless integration in text  
- 🚀 **Dual rendering strategies**: Parse-time (Node.js) or Display-time (Browser)
- 🖼️ **High-quality image output** with Sharp.js integration (Node.js only)
- ⚙️ **JSON5 configuration** for flexible option syntax
- 🛡️ **Enhanced error handling** with custom callbacks and fallback images
- 🎨 **Responsive design** with improved mobile support
- 📦 **Environment-specific builds** for optimal performance
- 🔧 **Granular configuration** with separate options for block/inline rendering
- 📱 **Cross-platform** compatibility (Browser & Node.js)

## Installation

```bash
npm install markdown-it-smiles
```

## Usage

### Basic Setup (Node.js)

```javascript
import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from 'markdown-it-smiles';

const md = new MarkdownIt().use(MarkdownItSmiles);

const result = md.render(`
# Chemical Structure

\`\`\`smiles
CCO
\`\`\`

The molecule $smiles{CCO} is ethanol.
`);
```

### Advanced Configuration (Node.js)

```javascript
import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from 'markdown-it-smiles';

const md = new MarkdownIt().use(MarkdownItSmiles, {
  // Render immediately during parsing (Node.js only)
  renderAtParse: true,
  
  // Output format: 'svg' or 'img'
  format: 'svg',
  
  // Separate configuration for different contexts
  smilesDrawerOptions: {
    default: {
      width: 400,
      height: 300,
      theme: 'light'
    },
    inline: {
      width: 100,
      height: 100
    },
    block: {
      width: 500,
      height: 400,
      bondThickness: 0.8
    }
  },
  
  // Error handling (renderAtParse only)
  errorHandling: {
    onError: (err) => console.error('SMILES error:', err),
    fallbackImage: '/images/error-molecule.png'
  }
});
```

### Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>SMILES Demo</title>
</head>
<body>
    <div id="content"></div>
    
    <script type="module">
        import MarkdownIt from 'https://esm.sh/markdown-it@14';
        import { MarkdownItSmiles } from 'https://esm.sh/markdown-it-smiles@2';
        
        const md = new MarkdownIt().use(MarkdownItSmiles, {
          // Browser environment: only display-time rendering supported
          smilesDrawerOptions: {
            default: { width: 300, height: 250 }
          }
        });
        
        const html = md.render(`
# Molecules
The molecule $smiles{CCO} is ethanol.

\`\`\`smiles {"width": 400}
c1ccccc1
\`\`\`
        `);
        
        document.getElementById('content').innerHTML = html;
    </script>
</body>
</html>
```

## Rendering Strategies

### Display-time Rendering (Default)

- **When**: HTML includes smiles-drawer script, renders when displayed in browser
- **Where**: Both Node.js and Browser environments
- **Benefits**: Smaller HTML output, client-side processing
- **Usage**: Set `renderAtParse: false` (default) or omit the option

```javascript
const md = new MarkdownIt().use(MarkdownItSmiles, {
  renderAtParse: false // Default behavior
});
```

### Parse-time Rendering (Node.js Only)

- **When**: SMILES rendered immediately during markdown parsing
- **Where**: Node.js environment only
- **Benefits**: Pre-rendered images/SVG embedded in HTML, no client-side dependencies
- **Usage**: Set `renderAtParse: true`

```javascript
const md = new MarkdownIt().use(MarkdownItSmiles, {
  renderAtParse: true, // Renders during parsing
  format: 'svg', // or 'img' for PNG
  errorHandling: {
    onError: (err) => console.error(err),
    fallbackImage: '/error.png'
  }
});
```

## Syntax

### Block SMILES

Use fenced code blocks with the `smiles` language identifier:

````markdown
```smiles
CCO
```
````

#### With JSON5 Options

You can specify rendering options using JSON5 syntax:

````markdown
```smiles {width: 500, height: 400, bondThickness: 1.0}
C1CCCCC1
```
````

#### Advanced Block Configuration

````markdown
```smiles {
  width: 600,
  height: 450,
  theme: 'dark',
  terminalCarbons: true,
  explicitHydrogens: false,
  atomVisualization: 'balls'
}
CC(C)CCCC(C)C1CCC2C1(CCC3C2CC=C4C3(CCC(C4)O)C)C
```
````

### Inline SMILES

Use the `$smiles{...}` syntax for inline rendering:

```markdown
The molecule $smiles{CCO} is ethanol, while $smiles{c1ccccc1} is benzene.
```

#### Inline with Options

```markdown
Large inline molecule: $smiles{CN1C=NC2=C1C(=O)N(C(=O)N2C)C}{width: 200, height: 150}
```

## Configuration Options

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `renderAtParse` | boolean | `false` | Render during parsing (Node.js only) |
| `format` | string | `'svg'` | Output format: 'svg' or 'img' |
| `fontUrl` | string | - | Custom font URL for rendering |
| `smilesDrawerScript` | string | CDN URL | Custom smiles-drawer script URL |
| `smilesDrawerOptions` | object | `{}` | SmilesDrawer configuration |
| `errorHandling` | object | - | Error handling options (renderAtParse only) |

### SmilesDrawer Options

These options can be specified in `smilesDrawerOptions.default`, `smilesDrawerOptions.block`, `smilesDrawerOptions.inline`, or in block/inline SMILES directly:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 500 | Canvas width in pixels |
| `height` | number | 500 | Canvas height in pixels |
| `bondThickness` | number | 0.6 | Thickness of chemical bonds |
| `bondLength` | number | 15 | Length of chemical bonds |
| `shortBondLength` | number | 0.85 | Short bond length ratio |
| `bondSpacing` | number | 2.7 | Spacing between double bonds |
| `atomVisualization` | string | `'default'` | 'default', 'balls', or 'none' |
| `fontSizeLarge` | number | 6 | Large font size for elements |
| `fontSizeSmall` | number | 4 | Small font size for numbers |
| `padding` | number | 20.0 | Canvas padding |
| `terminalCarbons` | boolean | false | Show terminal carbons (CH3) |
| `explicitHydrogens` | boolean | false | Show explicit hydrogens |
| `compactDrawing` | boolean | true | Use compact drawing mode |
| `isometric` | boolean | true | Draw isometric SMILES |
| `theme` | string | `'light'` | Color theme: 'light' or 'dark' |
| `experimental` | boolean | false | Enable experimental features |
| `debug` | boolean | false | Draw debug information |

### Theme Configuration

```javascript
const md = new MarkdownIt().use(MarkdownItSmiles, {
  smilesDrawerOptions: {
    default: {
      theme: 'dark',
      themes: {
        custom: {
          C: '#ffffff',
          O: '#ff6b6b',
          N: '#4ecdc4',
          // ... other atom colors
          BACKGROUND: '#2c3e50'
        }
      }
    }
  }
});
```

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
```smiles {width: 300, height: 250, theme: 'light'}
c1ccccc1
```

Toluene: $smiles{Cc1ccccc1}

## Complex Ring Systems
```smiles {
  width: 500, 
  height: 400, 
  bondThickness: 0.8,
  terminalCarbons: true
}
CC12CCC3C(C1CCC4=CC(=O)CCC34C)CCC5=C2C=CC(=C5)O
```
````

### Pharmaceutical Compounds

````markdown
# Drug Molecules

## Aspirin (Parse-time rendering)
```smiles {width: 400, height: 300}
CC(=O)OC1=CC=CC=C1C(=O)O
```

## Caffeine with options
```smiles {
  width: 350,
  height: 280,
  atomVisualization: 'balls',
  explicitHydrogens: true
}
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
```

Ibuprofen: $smiles{CC(C)CC1=CC=C(C=C1)C(C)C(=O)O}{width: 180}
````

### Stereochemistry Examples

````markdown
# Stereochemistry

L-Alanine: $smiles{N[C@@H](C)C(=O)O}
D-Glucose: $smiles{C([C@@H]1[C@H]([C@@H]([C@H](C(O1)O)O)O)O)O}

## Cholesterol
```smiles {width: 600, height: 450, compactDrawing: false}
CC(C)CCCC(C)C1CCC2C1(CCC3C2CC=C4C3(CCC(C4)O)C)C
```
````

## Environment Support

### Node.js Environment

- Uses `dist/node` build
- Supports both rendering strategies
- Full feature set including error handling
- Requires Node.js dependencies: jsdom, sharp, deasync

### Browser Environment  

- Uses `dist/browser` build
- Display-time rendering only
- Automatic script injection
- No server-side dependencies

## SMILES Notation

SMILES (Simplified Molecular Input Line Entry System) is a specification for describing chemical molecule structures using ASCII strings:

**Basic Examples:**
- `C` - Methane
- `CC` - Ethane  
- `CCO` - Ethanol
- `C=O` - Formaldehyde
- `C#N` - Hydrogen cyanide

**Ring Structures:**
- `C1CCCCC1` - Cyclohexane
- `c1ccccc1` - Benzene (aromatic)
- `c1ccncc1` - Pyridine

**Complex Molecules:**
- `CC(=O)O` - Acetic acid
- `CN1C=NC2=C1C(=O)N(C(=O)N2C)C` - Caffeine
- `CC(C)CC1=CC=C(C=C1)C(C)C(=O)O` - Ibuprofen

For comprehensive SMILES documentation, visit [Daylight Chemical Information Systems](http://www.daylight.com/dayhtml/doc/theory/theory.smiles.html).
<!-- 
## Migration from v1.x

### Configuration Changes

```javascript
// v1.x
md.use(markdownItSmiles, {
  includeScript: true,
  smilesDrawerUrl: 'https://cdn.example.com/smiles-drawer.js'
});

// v2.x  
md.use(MarkdownItSmiles, {
  smilesDrawerScript: 'https://cdn.example.com/smiles-drawer.js',
  smilesDrawerOptions: {
    default: { width: 400, height: 300 }
  }
});
```

### Import Changes

```javascript
// v1.x
const markdownItSmiles = require('markdown-it-smiles');

// v2.x  
import { MarkdownItSmiles } from 'markdown-it-smiles';
// or
const { MarkdownItSmiles } = require('markdown-it-smiles');
``` -->

## Browser Compatibility

- Chrome 85+
- Firefox 78+  
- Safari 14+
- Edge 85+

## Dependencies

### Core Dependencies
- [markdown-it](https://github.com/markdown-it/markdown-it) ^14.0.0
- [smiles-drawer](https://github.com/reymond-group/smilesDrawer) ^2.1.7
- [json5](https://github.com/json5/json5) ^2.2.3

### Node.js Dependencies (for renderAtParse)
- [jsdom](https://github.com/jsdom/jsdom) ^26.1.0
- [sharp](https://github.com/lovell/sharp) ^0.34.2  
- [deasync](https://github.com/abbr/deasync) ^0.1.30


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## Acknowledgments

- [smilesDrawer](https://github.com/reymond-group/smilesDrawer) for excellent chemical structure rendering
- [markdown-it](https://github.com/markdown-it/markdown-it) for the extensible markdown parser
- The chemistry community for SMILES notation standards

## Related Projects

- [smilesDrawer](https://github.com/reymond-group/smilesDrawer) - JavaScript library for drawing chemical structures
- [markdown-it](https://github.com/markdown-it/markdown-it) - Markdown parser with plugin support
- [RDKit](https://github.com/rdkit/rdkit) - Cheminformatics toolkit
- [OpenEye](https://www.eyesopen.com/) - Chemical information management

---

Made with ❤️ for the chemistry and web development communities.
