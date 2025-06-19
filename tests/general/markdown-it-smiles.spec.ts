import MarkdownIt from 'markdown-it';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarkdownItSmiles } from '../../src';

describe('markdown-it-smiles', () => {
    let md: MarkdownIt;

    beforeEach(() => {
        md = new MarkdownIt();
    });

    describe('Basic Functionality', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should render inline SMILES', () => {
            const input = 'This is ethanol: $smiles{CCO}';
            const result = md.render(input);
            expect(result).toContain('smiles-inline');
            expect(result).toContain('data-smiles="CCO"');
        });

        it('should render block SMILES', () => {
            const input = '```smiles\nCCO\n```';
            const result = md.render(input);
            expect(result).toContain('smiles-block');
            expect(result).toContain('data-smiles="CCO"');
        });

        it('should handle multiple SMILES in one document', () => {
            const input = `
Here are some molecules:
- Ethanol: $smiles{CCO}
- Benzene: $smiles{c1ccccc1}

And a block:
\`\`\`smiles
CC(=O)O
\`\`\`
`;
            const result = md.render(input);
            expect(result).toContain('data-smiles="CCO"');
            expect(result).toContain('data-smiles="c1ccccc1"');
            expect(result).toContain('data-smiles="CC(=O)O"');
        });

        it('should not affect normal markdown content', () => {
            const input = '# Title\n\nNormal *markdown* content';
            const result = md.render(input);
            expect(result).toContain('<h1>Title</h1>');
            expect(result).toContain('<em>markdown</em>');
        });
    });

    describe('Configuration Options', () => {
        it('should respect format option', () => {
            md.use(MarkdownItSmiles, { format: 'img' });
            const result = md.render('$smiles{CCO}');
            expect(result).toContain('<img');
        });

        it('should apply custom SmileDrawer options', () => {
            md.use(MarkdownItSmiles, {
                smileDrawerOptions: {
                    default: {
                        theme: 'dark',
                        width: 300,
                        height: 300,
                    },
                },
            });
            const result = md.render('$smiles{CCO}');
            expect(result).toContain('width="300"');
            expect(result).toContain('height="300"');
        });

        it('should apply different options for block and inline', () => {
            md.use(MarkdownItSmiles, {
                smileDrawerOptions: {
                    inline: { width: 100 },
                    block: { width: 500 },
                },
            });
            const inline = md.render('$smiles{CCO}');
            const block = md.render('```smiles\nCCO\n```');
            expect(inline).toContain('width="100"');
            expect(block).toContain('width="500"');
        });
    });

    if (!IS_BROWSER) {
        describe('Error Handling', () => {
            it('should handle invalid SMILES syntax', () => {
                const errorHandler = vi.fn();
                md.use(MarkdownItSmiles, {
                    renderAtParse: true,
                    errorHandling: {
                        onError: errorHandler,
                        fallbackImage: 'error.png',
                    },
                });

                const result = md.render('$smiles{InvalidSMILES}');
                expect(errorHandler).toHaveBeenCalled();
                expect(result).toContain('error.png');
            });
        });
    }

    describe('Environment Compatibility', () => {
        if (IS_BROWSER) {
            it('should warn about renderAtParse in browser environment', () => {
                const consoleSpy = vi.spyOn(console, 'warn');

                md.use(MarkdownItSmiles, { renderAtParse: true });
                expect(consoleSpy).toHaveBeenCalledWith(
                    'renderAtParse is not supported in browser environment, it will be ignored'
                );

                consoleSpy.mockRestore();
            });
        }

        it('should include necessary scripts and styles', () => {
            md.use(MarkdownItSmiles);
            const result = md.render('$smiles{CCO}');

            expect(result).toContain('<style>');
            expect(result).toContain('<script>');
            expect(result).toContain('SmiDrawer.apply()');
        });

        it('should use external script if provided', () => {
            md.use(MarkdownItSmiles, {
                smileDrawerScript: 'https://cdn.example.com/smiles-drawer.js',
            });
            const result = md.render('$smiles{CCO}');

            expect(result).toContain('src="https://cdn.example.com/smiles-drawer.js"');
        });
    });

    describe('Complex SMILES Examples', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should handle complex organic molecules', () => {
            const examples = [
                // Caffeine
                'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
                // Aspirin
                'CC(=O)OC1=CC=CC=C1C(=O)O',
                // Glucose
                'C([C@@H]1[C@H]([C@@H]([C@H](C(O1)O)O)O)O)O',
            ];

            examples.forEach(smiles => {
                const result = md.render(`$smiles{${smiles}}`);
                expect(result).toContain(`data-smiles="${smiles}"`);
            });
        });

        it('should handle aromatic compounds', () => {
            const examples = [
                // Benzene
                'c1ccccc1',
                // Pyridine
                'c1ccncc1',
                // Furan
                'c1ccoc1',
            ];

            examples.forEach(smiles => {
                const result = md.render(`$smiles{${smiles}}`);
                expect(result).toContain(`data-smiles="${smiles}"`);
            });
        });
    });
});
