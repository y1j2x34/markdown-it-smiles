// Client-side rendering script for SMILES structures
export function getClientScript() {
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

// Extract the core rendering logic for testing
export function createSmilesRenderer() {
  return {
    // Default rendering options
    getDefaultOptions: function(canvas) {
      return {
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
    },
    
    // Render SMILES on a canvas element
    renderOnCanvas: function(canvas, smiles, options = {}) {
      const defaultOptions = this.getDefaultOptions(canvas);
      const finalOptions = Object.assign(defaultOptions, options);
      
      return new Promise((resolve, reject) => {
        if (typeof SmilesDrawer === 'undefined') {
          reject(new Error('SmilesDrawer not loaded'));
          return;
        }
        
        const drawer = new SmilesDrawer.Drawer(finalOptions);
        
        SmilesDrawer.parse(smiles, function(tree) {
          try {
            drawer.draw(tree, canvas.id, 'light', false);
            resolve();
          } catch (err) {
            reject(err);
          }
        }, function(err) {
          reject(new Error('SMILES parsing error: ' + err));
        });
      });
    },
    
    // Render error message on canvas
    renderError: function(canvas, message) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.font = '12px Arial';
      ctx.fillText(message, 10, 20);
    }
  };
} 