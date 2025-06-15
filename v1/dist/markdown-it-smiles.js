'use strict';

// Block-level SMILES rule for markdown-it
function smilesBlock(state, start, end, silent) {
  const marker = '```';
  let pos = state.bMarks[start] + state.tShift[start];
  let max = state.eMarks[start];

  // Check if it starts with ```
  if (pos + 3 > max) return false;
  
  const markerStr = state.src.slice(pos, pos + 3);
  if (markerStr !== marker) return false;

  pos += 3;
  const firstLine = state.src.slice(pos, max).trim();
  
  // Check if it's a smiles code block
  if (!firstLine.startsWith('smiles')) return false;

  // Parse options (if any)
  const optionsMatch = firstLine.match(/^smiles\s*({.*})?/);
  let options = {};
  if (optionsMatch && optionsMatch[1]) {
    try {
      options = JSON.parse(optionsMatch[1]);
    } catch (e) {
      // Ignore parsing errors, use default options
    }
  }

  if (silent) return true;

  // Find end marker
  let nextLine = start + 1;
  let haveEndMarker = false;
  
  while (nextLine < end) {
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    
    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    
    if (state.src.slice(pos, pos + 3) === marker) {
      haveEndMarker = true;
      break;
    }
    
    nextLine++;
  }

  if (!haveEndMarker) return false;

  // Extract SMILES content
  const content = state.getLines(start + 1, nextLine, 0, false).trim();
  
  const token = state.push('smiles_block', 'div', 0);
  token.content = content;
  token.info = options;
  token.map = [start, nextLine + 1];

  state.line = nextLine + 1;
  return true;
}

// Inline SMILES rule for markdown-it
function smilesInline(state, silent) {
  const start = state.pos;
  const max = state.posMax;

  // Check if it starts with $smiles{
  if (start + 8 > max) return false;
  if (state.src.slice(start, start + 8) !== '$smiles{') return false;

  // Find closing }
  let pos = start + 8;
  let level = 1;
  
  while (pos < max && level > 0) {
    if (state.src[pos] === '{') {
      level++;
    } else if (state.src[pos] === '}') {
      level--;
    }
    pos++;
  }

  if (level !== 0) return false;

  const content = state.src.slice(start + 8, pos - 1);
  
  if (silent) return true;

  const token = state.push('smiles_inline', 'span', 0);
  token.content = content;
  token.markup = '$smiles{';

  state.pos = pos;
  return true;
}

// Generate unique ID for SMILES elements
function generateId() {
  return 'smiles-' + Math.random().toString(36).substr(2, 9);
}

// Render functions for SMILES tokens
function renderSmilesBlock(tokens, idx, options, env, renderer) {
  const token = tokens[idx];
  const smiles = token.content;
  const smilesOptions = token.info || {};
  
  const id = generateId();
  const width = smilesOptions.width || 400;
  const height = smilesOptions.height || 300;
  
  return `<div class="smiles-container">
    <canvas id="${id}" width="${width}" height="${height}" data-smiles="${smiles}" data-options='${JSON.stringify(smilesOptions)}'></canvas>
  </div>\n`;
}

function renderSmilesInline(tokens, idx, options, env, renderer) {
  const token = tokens[idx];
  const smiles = token.content;
  
  const id = generateId();
  const width = 200;
  const height = 150;
  
  return `<canvas class="smiles-inline" id="${id}" width="${width}" height="${height}" data-smiles="${smiles}" data-options='{"width":${width},"height":${height}}'></canvas>`;
}

// CSS styles for SMILES rendering
function getCSS() {
  return `
<style>
.smiles-container {
  margin: 1em 0;
  text-align: center;
}

.smiles-container canvas {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.smiles-inline {
  vertical-align: middle;
  border: 1px solid #ddd;
  border-radius: 2px;
  background: white;
  margin: 0 2px;
}

@media (max-width: 768px) {
  .smiles-container canvas {
    max-width: 100%;
    height: auto;
  }
}
</style>`;
}

// Client-side rendering script for SMILES structures
function getClientScript() {
  return `
<script>
(function() {
  function renderSmiles() {
    const canvases = document.querySelectorAll('canvas[data-smiles]');
    
    canvases.forEach(function(canvas) {
      const smiles = canvas.getAttribute('data-smiles');
      const options = JSON.parse(canvas.getAttribute('data-options') || '{}');
      
      // Default options
      const defaultOptions = {
        width: canvas.width,
        height: canvas.height,
        bondThickness: 0.6,
        bondLength: 15,
        atomVisualization: 'default',
        isomeric: true,
        terminalCarbons: false,
        explicitHydrogens: false,
        compactDrawing: true,
        fontSizeLarge: 5,
        fontSizeSmall: 3,
        padding: 20.0
      };
      
      const finalOptions = Object.assign(defaultOptions, options);
      
      if (typeof SmilesDrawer !== 'undefined') {
        const drawer = new SmilesDrawer.Drawer(finalOptions);
        
        SmilesDrawer.parse(smiles, function(tree) {
          drawer.draw(tree, canvas.id, 'light', false);
        }, function(err) {
          console.error('SMILES parsing error:', err);
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ff0000';
          ctx.font = '12px Arial';
          ctx.fillText('Error: Invalid SMILES', 10, 20);
        });
      } else {
        console.error('SmilesDrawer not loaded');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.font = '12px Arial';
        ctx.fillText('Error: SmilesDrawer not loaded', 10, 20);
      }
    });
  }
  
  // If SmilesDrawer is already loaded, render immediately
  if (typeof SmilesDrawer !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderSmiles);
    } else {
      renderSmiles();
    }
  } else {
    // Wait for SmilesDrawer to load
    let checkCount = 0;
    const checkInterval = setInterval(function() {
      if (typeof SmilesDrawer !== 'undefined') {
        clearInterval(checkInterval);
        renderSmiles();
      } else if (checkCount++ > 50) { // 5 second timeout
        clearInterval(checkInterval);
        console.error('SmilesDrawer failed to load within timeout');
      }
    }, 100);
  }
})();
</script>`;
}

// Main plugin function
function markdownItSmiles(md, options) {
  options = options || {};
  
  // Register block rule
  md.block.ruler.before('fence', 'smiles_block', smilesBlock, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  });
  
  // Register inline rule
  md.inline.ruler.before('emphasis', 'smiles_inline', smilesInline);
  
  // Register renderers
  md.renderer.rules.smiles_block = renderSmilesBlock;
  md.renderer.rules.smiles_inline = renderSmilesInline;
  
  // Add necessary scripts and styles if needed
  if (options.includeScript !== false) {
    const originalRender = md.render.bind(md);
    md.render = function(src, env) {
      const result = originalRender(src, env);
      
      // Check if SMILES content is included
      if (result.includes('data-smiles')) {
        const smilesDrawerScript = options.smilesDrawerUrl || 'https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js';
        const fontLink = options.fontUrl || 'https://fonts.googleapis.com/css?family=Droid+Sans:400,700';
        
        return `<link href="${fontLink}" rel="stylesheet">\n` +
               getCSS() + '\n' +
               result + '\n' +
               `<script src="${smilesDrawerScript}"></script>\n` +
               getClientScript();
      }
      
      return result;
    };
  }
}

module.exports = markdownItSmiles;
