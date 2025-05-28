# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- smiles-drawer ^1.0.10

### Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## [Unreleased]

### Planned

- SVG rendering support
- Dark theme support
- Additional atom visualization modes
- Performance optimizations
- TypeScript definitions
- More comprehensive error messages
- Plugin configuration validation
