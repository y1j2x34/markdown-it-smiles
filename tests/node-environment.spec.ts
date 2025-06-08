import MarkdownIt from 'markdown-it';
import { PluginOptions } from '~/plugin-options';
import { MarkdownItSmiles } from '~/index';
import { JSDOM } from 'jsdom';

// Mock external dependencies at module level
jest.mock('fs');
jest.mock('sharp');
jest.mock('deasync');

// These tests are designed to run specifically in Node.js environment
describe('Node.js Environment Tests', () => {
    let md: MarkdownIt;
    let dom: JSDOM;
    let originalWindow: any;
    let originalDocument: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Store original globals
        originalWindow = global.window;
        originalDocument = global.document;

        // Create a new JSDOM instance
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost',
            pretendToBeVisual: true
        });

        // Set up global variables
        (global as any).window = dom.window;
        (global as any).document = dom.window.document;
        (global as any).HTMLElement = dom.window.HTMLElement;
        (global as any).HTMLImageElement = dom.window.HTMLImageElement;
        (global as any).SVGElement = dom.window.SVGElement;
        (global as any).Image = class {
            constructor() {
                return dom.window.document.createElement('img');
            }
        };

        md = new MarkdownIt();
        // Ensure we're in Node environment
        delete process.env.IS_BROWSER;

        // Mock SmilesDrawer global
        (global as any).SmilesDrawer = {
            apply: jest.fn(),
            parse: jest.fn().mockReturnValue({
                draw: jest.fn().mockReturnValue('<svg></svg>')
            })
        };
    });

    afterEach(() => {
        // Restore original globals
        global.window = originalWindow;
        global.document = originalDocument;

        // Clean up other globals
        delete (global as any).HTMLElement;
        delete (global as any).HTMLImageElement;
        delete (global as any).SVGElement;
        delete (global as any).Image;
        delete (global as any).SmilesDrawer;

        // Reset modules and mocks
        jest.resetModules();
        jest.clearAllMocks();
    });

    it('should render a simple SMILES block', () => {
        md.use(MarkdownItSmiles);
        const input = '```smiles\nC1=CC=CC=C1\n```';
        const result = md.render(input);

        expect(result).toContain('class="smiles-block"');
        expect(result).toContain("data-smiles='C1=CC=CC=C1'");
    });

    describe('Server-Side Rendering (renderAtParse)', () => {
        it('should generate SVG content directly when renderAtParse is true', () => {
            const options: PluginOptions = {
                renderAtParse: true,
                format: 'svg'
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('<div class="smiles-block"');
            expect(result).toContain('</div>');
            // With renderAtParse, should not rely on client-side rendering
            expect(result).not.toContain('data-smiles=');
        });

        it('should handle different image formats in server-side rendering', () => {
            const options: PluginOptions = {
                renderAtParse: true,
                format: 'img'
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nCCO\n```';
            const result = md.render(input);

            expect(result).toContain('<div class="smiles-block"');
        });

        it('should fall back gracefully when dependencies are missing', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Should work even without external dependencies in test environment
            expect(result).toContain('<div class="smiles-block"');
        });
    });

    describe('Node Dependencies', () => {
        it('should handle JSDOM initialization', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('class="smiles-block"');
        });

        it('should handle Sharp for image processing', () => {
            const options: PluginOptions = {
                renderAtParse: true,
                format: 'img'
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nCCO\n```';
            const result = md.render(input);

            expect(result).toContain('class="smiles-block"');
        });

        it('should handle script loading from filesystem', () => {
            // Test that filesystem operations work in Node environment
            const options: PluginOptions = {
                renderAtParse: false // Client-side rendering should load scripts
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('data-smiles=');
            expect(result).toContain('<script>');
        });
    });

    describe('Global Variable Management', () => {
        it('should handle global variable cleanup', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Should not leak global variables after rendering
            expect((global as any).window).toBe(originalWindow);
            expect((global as any).document).toBe(originalDocument);
        });

        it('should handle concurrent rendering without conflicts', async () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            const inputs = [
                '```smiles\nC1=CC=CC=C1\n```',
                '```smiles\nCCO\n```',
                '```smiles\nCC(C)C\n```'
            ];

            const promises = inputs.map(input =>
                Promise.resolve(md.render(input))
            );

            const results = await Promise.all(promises);

            results.forEach(result => {
                expect(result).toContain('class="smiles-block"');
            });
        });
    });

    describe('Memory Management', () => {
        it('should handle memory efficiently with large inputs', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            // Generate multiple SMILES blocks
            const largeInput = Array.from({ length: 10 }, (_, i) =>
                `\`\`\`smiles\nC${'C'.repeat(i)}O\n\`\`\``
            ).join('\n\n');

            const result = md.render(largeInput);

            expect(result).toContain('class="smiles-block"');
            // Should handle multiple blocks without issues
            expect((result.match(/class="smiles-block"/g) || []).length).toBe(10);
        });

        it('should clean up properly after errors', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            // Test with potentially problematic input
            const input = '```smiles\n[invalid-syntax]\n```';

            expect(() => md.render(input)).not.toThrow();

            // Should still clean up globals
            expect((global as any).window).toBe(originalWindow);
        });
    });

    describe('Performance', () => {
        it('should render efficiently in Node environment', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';

            const start = Date.now();
            const result = md.render(input);
            const duration = Date.now() - start;

            expect(result).toContain('class="smiles-block"');
            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });

        it('should handle batch processing efficiently', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            const documents = Array(5).fill(0).map((_, i) => `
                Document ${i + 1}: \`\`\`smiles
                CO
                \`\`\`
            `);

            const results = documents.map(doc => md.render(doc));

            results.forEach((result, i) => {
                expect(result).toContain('class="smiles-block"');
                expect(result).toContain(`Document ${i + 1}`);
            });
        });
    });

    describe('Error Recovery', () => {
        it('should recover gracefully from rendering errors', () => {
            const options: PluginOptions = {
                renderAtParse: true,
                errorHandling: {
                    onError: jest.fn()
                }
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\n!!invalid!!\n```';
            const result = md.render(input);

            expect(result).toContain('class="smiles-block"');
        });

        it('should handle missing dependencies gracefully', () => {
            const options: PluginOptions = {
                renderAtParse: true
            };

            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Should work even if external libs are mocked
            expect(result).toContain('class="smiles-block"');
        });
    });
}); 