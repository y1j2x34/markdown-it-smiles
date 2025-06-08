import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from '~/index';
import { PluginOptions } from '~/plugin-options';

describe('Integration Tests', () => {
    let md: MarkdownIt;

    beforeEach(() => {
        md = new MarkdownIt();
    });

    describe('Real-world Usage Scenarios', () => {
        it('should handle complex stereochemistry', () => {
            md.use(MarkdownItSmiles);

            const input = `
                \`\`\`smiles
                C[C@]12CC[C@H]3[C@H]4CC[C@H](O)[C@@]4(C)CC[C@H]3[C@@H]1CC[C@@H]2O
                \`\`\`
                
                $smiles{N[C@@H](CC1=CC=CC=C1)C(=O)O}
            `.replace(/\n\s+/g, '\n');

            const result = md.render(input);

            // Should handle complex stereochemistry
            expect(result).toContain("data-smiles='C[C@]12CC[C@H]3");
            expect(result).toContain("data-smiles='N[C@@H](CC1=CC=CC=C1)");
        });

        it('should handle large documents with many SMILES efficiently', () => {
            md.use(MarkdownItSmiles);

            // Create a document with 100 SMILES (50 inline + 50 block)
            const inlineSmiles = new Array(50).fill('$smiles{C1=CC=CC=C1}').join('\n');
            const blockSmiles = new Array(50).fill('```smiles\nC1=CC=CC=C1\n```').join('\n');
            const input = inlineSmiles + '\n' + blockSmiles;

            const result = md.render(input);

            // Should contain all SMILES
            const smilesMatches = result.match(/data-smiles='[^']+'/g);
            expect(smilesMatches).toHaveLength(100); // 50 inline + 50 block

            // Should only inject scripts once
            const scriptMatches = result.match(/<script>/g);
            expect(scriptMatches).toHaveLength(2); // One for smiles-drawer, one for auto-apply
        });

        it('should handle empty and whitespace-only SMILES', () => {
            md.use(MarkdownItSmiles);

            const input = `
                Empty inline: $smiles{}
                Whitespace inline: $smiles{   }
                
                \`\`\`smiles
                
                \`\`\`
                
                \`\`\`smiles
                   
                \`\`\`
            `.replace(/\n\s+/g, '\n');

            const result = md.render(input);

            expect(result).toContain("data-smiles=''");
            expect(result).toContain("data-smiles='   '");
        });

        it('should handle malformed but parseable SMILES syntax', () => {
            md.use(MarkdownItSmiles);

            const input = `
                Unclosed braces: $smiles{C1=CC=CC=C1
                Missing end marker: \`\`\`smiles
                C1=CC=CC=C1
                
                Nested quotes: $smiles{C1=CC=C(C(=O)"test")C=C1}
            `.replace(/\n\s+/g, '\n');

            const result = md.render(input);

            // Should handle gracefully without breaking the page
            expect(result).toContain('$smiles{C1=CC=CC=C1');
            expect(result).toContain('Missing end marker:');
            expect(result).toContain('data-smiles=\'C1=CC=C(C(=O)"test")C=C1\'');
        });
    });

    describe('Configuration Combinations', () => {
        it('should handle all option combinations', () => {
            const options: PluginOptions = {
                smileDrawerOptions: {
                    default: {
                        theme: 'dark',
                        experimental: true,
                        terminalCarbons: true,
                        atomVisualization: 'balls',
                    },
                },
            };

            const md = new MarkdownIt().use(MarkdownItSmiles, options);
            const input = `Block:
            \`\`\`smiles
            C1=CC=CC=C1
            \`\`\`
            Inline: $smiles{C1=CC=CC=C1}
            `.replace(/\n\s+/g, '\n');
            const result = md.render(input);

            // Should apply all configurations
            expect(result).toContain('class="smiles-block"');
            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('data-smiles-theme=\'dark\'');
            expect(result).toContain('"experimental":true');
        });

        it('should handle option inheritance correctly', () => {
            const options: PluginOptions = {
                smileDrawerOptions: {
                    default: {
                        theme: 'dark',
                        width: 200,
                    },
                    block: {
                        height: 400,
                    },
                },
            };

            const md = new MarkdownIt().use(MarkdownItSmiles, options);
            const input = `Block: 
            \`\`\`smiles {"height": 400}
            C1=CC=CC=C1
            \`\`\`
            Inline: $smiles{C1=CC=CC=C1}
            `.replace(/\n\s+/g, '\n');;
            const result = md.render(input);

            // Block should inherit default + block + local options
            expect(result).toContain('class="smiles-block"');
            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('data-smiles-theme=\'dark\'');
            expect(result).toContain('style="width:200px;height:400px"');
        });
    });

    describe('Error Recovery and Robustness', () => {
        it('should continue processing after encountering errors', () => {
            md.use(MarkdownItSmiles);

            const input = `
            Valid: $smiles{C1=CC=CC=C1}
            Invalid: $smiles{invalid}
            Valid again: $smiles{CC1=CC=CC=C1}
            Another valid: $smiles{CN1C=NC2=C1C(=O)N(C(=O)N2C)C}
            `.replace(/\n\s+/g, '\n');

            const result = md.render(input);

            // Should process valid SMILES despite errors
            const smilesMatches = result.match(/data-smiles='[^']+'/g);
            expect(smilesMatches).toHaveLength(4);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain("data-smiles='CC1=CC=CC=C1'");
        });

        it('should handle malformed SMILES input', () => {
            md.use(MarkdownItSmiles);

            const input = `
                Invalid SMILES: $smiles{C1=CC=CC=C1 and unclosed brace
            `.replace(/\n\s+/g, '\n');

            const result = md.render(input);

            expect(result).toContain('$smiles{C1=CC=CC=C1 and unclosed brace');
            expect(result).toContain('Invalid SMILES');
        });

        it('should handle concurrent rendering correctly', () => {
            md.use(MarkdownItSmiles);

            const inputs = new Array(10).fill('$smiles{C1=CC=CC=C1}');

            // Render concurrently
            const results = inputs.map(input => md.render(input));

            // Each result should be properly rendered
            results.forEach((result, index) => {
                const smilesMatch = inputs[index]?.match(/\{(.+?)\}/);
                const expectedSmiles = smilesMatch?.[1] || '';
                expect(result).toContain(`data-smiles='${expectedSmiles}'`);
            });
        });
    });
});
