// CSS styles for SMILES rendering
export function getCSS() {
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
