const fs = require('fs');
const path = require('path');

// Import sample generation functions
const generateBasicExample = require('./samples/basic');
const generateBiochemistryExample = require('./samples/biochemistry');
const generateComplexExample = require('./samples/complex');
const generateThemesExample = require('./samples/themes');

// Generate all samples
console.log('Generating SSR samples...');

const samples = [];
const generators = [generateBasicExample, generateBiochemistryExample, generateComplexExample, generateThemesExample];

generators.forEach((generator, index) => {
    try {
        console.log(`Generating sample ${index + 1}/${generators.length}...`);
        const result = generator();
        samples.push(result);
        console.log(`✓ Successfully generated sample: ${result.name}`);
    } catch (error) {
        console.error(`✗ Failed to generate sample:`, error.message);
    }
});

// Create output data
const output = {
    meta: {
        generated: new Date().toISOString(),
        totalSamples: samples.length,
        version: require('../../package.json').version,
        description: 'Server-side rendered SMILES examples',
    },
    samples: samples,
};

// Write to file
const outputPath = path.join(__dirname, 'ssr-examples.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`\n✓ Successfully generated ${samples.length} samples to ${outputPath}`);
console.log('Sample list:');
samples.forEach(sample => {
    console.log(`  - ${sample.id}: ${sample.name}`);
});
