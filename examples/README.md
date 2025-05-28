# markdown-it-smiles Examples

This directory contains interactive examples and demos for the `markdown-it-smiles` plugin.

## 🌐 Live Demo

Visit the live demo at: **[https://y1j2x34.github.io/markdown-it-smiles/examples/](https://y1j2x34.github.io/markdown-it-smiles/examples/)**

## 📁 Files

- `index.html` - Interactive demo page showcasing all plugin features
- `advanced.html` - Advanced examples with pharmaceutical and natural compounds
- `README.md` - This file
- `.nojekyll` - Prevents Jekyll processing on GitHub Pages

## 🚀 Local Development

To run the examples locally:

1. Clone the repository
2. Build the project: `npm run build`
3. Open `examples/index.html` in your browser

Or start a local server:
```bash
cd examples
python3 -m http.server 8000
# Visit http://localhost:8000
```

## 📋 Examples Included

### Basic Demo (`index.html`)
- Block SMILES rendering
- Inline SMILES rendering
- Custom options and styling
- Mixed content examples
- Installation and usage instructions

### Advanced Demo (`advanced.html`)
- 🧬 Pharmaceutical compounds (Aspirin, Caffeine, Ibuprofen, Penicillin)
- 🌿 Natural products (Vitamin C, Cholesterol, Glucose, Morphine)
- 🔬 Research compounds (Taxol, Chlorophyll)
- 📝 Research paper integration example

## 🔧 Customization

Both demo pages use the built distribution file (`../dist/markdown-it-smiles.min.js`). You can modify the examples by editing the JavaScript sections in the HTML files.

## 📖 Documentation

For complete documentation, visit the [main README](../README.md). 