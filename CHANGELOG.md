# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- TypeScript definitions export
- Additional atom visualization modes
- Dark theme support improvements
- Performance optimizations

## [2.0.0] - 2025-06-20

### Added

- 🚀 **Dual Rendering Strategy**: 
  - **Parse-time Rendering**: `renderAtParse=true` embeds rendered SMILES as images/SVG directly in HTML (Node.js only)
  - **Display-time Rendering**: `renderAtParse=false` injects smiles-drawer script for browser-side rendering (default)
- 🖼️ **High-Quality Image Output**: Sharp.js integration for PNG generation (Node.js only)
- 🛡️ **Enhanced Error Handling**: Custom error callbacks and fallback images (Node.js only)
- 🎨 **JSON5 Configuration**: Flexible configuration syntax in SMILES code blocks
- 📦 **Environment-Specific Builds**: Optimized `dist/node` and `dist/browser` distributions
- 🧪 **Advanced Molecular Structures**: Better support for complex organic compounds
- 🔧 **Granular Configuration**: Separate rendering options for block and inline SMILES

### Enhanced

- 🎪 **Responsive Design**: Improved CSS with better mobile and inline support
- ⚡ **Performance**: Optimized rendering pipeline and resource loading
- 🧹 **Error Recovery**: Graceful degradation with invalid SMILES strings
- 📋 **Comprehensive Testing**: Full test coverage for both rendering modes

### Changed

- **BREAKING**: `renderAtParse` option only available in Node.js environment
- **BREAKING**: Enhanced configuration structure for better flexibility
- **BREAKING**: Improved CSS classes and styling (may affect custom styles)
- Browser environment now shows warning when `renderAtParse` is used
- Refactored internal architecture with modular design

### Rendering Modes

#### Browser Environment
- Uses `dist/browser` build when running markdown-it in browser
- Only supports **display-time rendering** (`renderAtParse` not supported)
- Generated HTML includes smiles-drawer script injection
- SMILES structures render when HTML is displayed in browser

#### Node.js Environment
- Uses `dist/node` build when running markdown-it in Node.js
- Supports both rendering strategies:
  - **Parse-time rendering** (`renderAtParse=true`): Renders SMILES immediately during markdown parsing, embeds final images/SVG in HTML
  - **Display-time rendering** (`renderAtParse=false`): Generates HTML with smiles-drawer script injection for browser rendering
- Enhanced error handling and high-quality image generation available

### Dependencies

- **Updated**: smiles-drawer ^2.1.7
- **Added**: sharp ^0.34.2 (for high-quality image processing in Node.js)
- **Added**: jsdom ^26.1.0 (for server-side DOM manipulation)
- **Added**: json5 ^2.2.3 (for enhanced configuration parsing)
- **Added**: deasync ^0.1.30 (for synchronous operations in Node.js)

### Migration Guide

```javascript
// v1.x - Simple configuration
md.use(MarkdownItSmiles, {
  width: 300,
  height: 300
});

// v2.x - Enhanced dual-mode configuration
md.use(MarkdownItSmiles, {
  // Rendering mode (Node.js only)
  renderAtParse: true,
  
  // Separate configuration for different contexts
  smilesDrawerOptions: {
    default: { width: 300, height: 300 },
    inline: { width: 100, height: 100 },
    block: { width: 500, height: 500 }
  },
  
  // Error handling (Node.js only)
  errorHandling: {
    onError: (err) => console.error(err),
    fallbackImage: '/error-molecule.png'
  }
});
```

## [1.0.0] - 2025-05-29

### Added

- Initial release of markdown-it-smiles plugin
- Block-level SMILES rendering with ````smiles` syntax
- Inline SMILES rendering with `$smiles{...}` syntax
- Configurable rendering options (width, height, bond thickness, etc.)
- Automatic inclusion of required CSS styles and JavaScript
- Support for custom smilesDrawer options
- Responsive design with mobile support
- Error handling for invalid SMILES strings
- Browser and Node.js compatibility
- Comprehensive test suite
- Complete documentation and examples

### Features

- 🧪 Block-level SMILES rendering with customizable options
- 🔬 Inline SMILES rendering for seamless text integration
- ⚙️ JSON-based configuration for rendering options
- 🎨 Responsive canvas-based rendering
- 🚀 High performance with lazy loading
- 📱 Cross-platform compatibility
- 🛡️ Error handling and validation
- 🎯 TypeScript-friendly (implicit)

### Dependencies

- markdown-it >= 8.0.0
- smiles-drawer ^2.1.7

### Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## [Unreleased]

### Planned

- SVG/PNG rendering support
- Dark theme support
- Additional atom visualization modes
- TypeScript definitions
