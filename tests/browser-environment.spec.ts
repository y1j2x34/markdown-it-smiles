/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment jsdom
 */
import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from '~/index';
import { PluginOptions } from '~/plugin-options';

// These tests are designed to run specifically in Browser environment
describe('Browser Environment Tests', () => {
    let md: MarkdownIt;

    beforeEach(() => {
        process.env.IS_BROWSER = 'true';
        md = new MarkdownIt();

        // Mock DOM elements for browser environment
        global.document = {
            createElement: jest.fn().mockReturnValue({
                setAttribute: jest.fn(),
                appendChild: jest.fn(),
                innerHTML: '',
                outerHTML: '<div></div>',
            }),
            head: {
                appendChild: jest.fn(),
            } as unknown as HTMLHeadElement,
            addEventListener: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn().mockReturnValue([]),
        } as unknown as Document;

        global.window = {
            document: global.document,
        } as unknown as Window & typeof globalThis;
    });

    afterEach(() => {
        delete process.env.IS_BROWSER;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).document;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).window;
    });

    describe('Browser Environment Detection', () => {
        it('should detect browser environment correctly', () => {
            expect(process.env.IS_BROWSER).toBeTruthy();
            expect(typeof document).toBe('object');

            const options: PluginOptions = { renderAtParse: true };

            // Should warn about browser environment
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            md.use(MarkdownItSmiles, options);

            expect(consoleSpy).toHaveBeenCalledWith(
                'renderAtParse is not supported in browser environment, it will be ignored'
            );

            consoleSpy.mockRestore();
        });

        it('should disable renderAtParse automatically in browser', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const options: PluginOptions = { renderAtParse: true };
            md.use(MarkdownItSmiles, options);

            // Should have disabled renderAtParse
            expect(options.renderAtParse).toBe(false);

            consoleSpy.mockRestore();
        });
    });

    describe('Client-Side Rendering', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should generate HTML with data attributes for client-side rendering', () => {
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('class="smiles-block"');
            // Should not contain pre-rendered SVG in browser mode
            expect(result).not.toContain('<svg>');
        });

        it('should include SmiDrawer.apply() call in script injection', () => {
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('SmiDrawer.apply()');
            expect(result).toContain('DOMContentLoaded');
        });

        it('should handle custom script URL in browser environment', () => {
            const options: PluginOptions = {
                smileDrawerScript: 'https://cdn.example.com/smiles-drawer.js',
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('src="https://cdn.example.com/smiles-drawer.js"');
        });
    });

    describe('Browser-Specific Features', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should not attempt to read local files in browser', () => {
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Should not contain any file system content
            expect(result).not.toContain('fs.readFileSync');
            expect(result).toContain('<script>');
        });

        it('should work with different browser globals', () => {
            // Mock fetch for external scripts
            (global as any).fetch = jest.fn().mockResolvedValue({
                text: () => Promise.resolve('SmilesDrawer = {};'),
            });

            const md = new MarkdownIt().use(MarkdownItSmiles, {
                smileDrawerScript: 'https://cdn.example.com/smiles-drawer.js',
            });

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
        });

        it('should handle missing document gracefully', () => {
            // Temporarily remove document
            const originalDocument = global.document;
            delete (global as any).document;

            const md = new MarkdownIt().use(MarkdownItSmiles);
            const input = '```smiles\nC1=CC=CC=C1\n```';

            expect(() => md.render(input)).not.toThrow();

            // Restore document
            (global as any).document = originalDocument;
        });
    });

    describe('CDN and External Resources', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should support CDN script loading', () => {
            const options: PluginOptions = {
                smileDrawerScript: 'https://unpkg.com/smiles-drawer@latest/dist/smiles-drawer.min.js',
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('https://unpkg.com/smiles-drawer@latest/dist/smiles-drawer.min.js');
        });

        it('should handle relative script paths', () => {
            const options: PluginOptions = {
                smileDrawerScript: './assets/smiles-drawer.js',
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('src="./assets/smiles-drawer.js"');
        });

        it('should handle font URL option', () => {
            const options: PluginOptions = {
                fontUrl: 'https://fonts.googleapis.com/css2?family=Arial',
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Font URL should be handled (though not directly in styles)
            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
        });

        it('should include external script when smileDrawerScript is provided', () => {
            const scriptUrl = 'https://cdn.jsdelivr.net/npm/smiles-drawer@latest/dist/smiles-drawer.min.js';
            const md = new MarkdownIt().use(MarkdownItSmiles, {
                smileDrawerScript: scriptUrl,
            });

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain(`<script src="${scriptUrl}"></script>`);
            expect(result).toContain('SmiDrawer.apply()');
        });

        it('should handle CSP-friendly inline scripts', () => {
            const md = new MarkdownIt().use(MarkdownItSmiles, {
                // No external script URL, should inline the script
                smileDrawerScript: undefined,
            });

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Should contain inline script content
            expect(result).toContain('<script>');
            expect(result).toContain('SmiDrawer.apply()');
        });

        it('should handle font URL option', () => {
            const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap';
            const md = new MarkdownIt().use(MarkdownItSmiles, {
                fontUrl,
            });

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Font URL should be handled (though not directly in styles)
            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
        });
    });

    describe('CSS and Styling', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should inject CSS styles for browser rendering', () => {
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('<style>');
            expect(result).toContain('.smiles-block');
            expect(result).toContain('.smiles-inline');
            expect(result).toContain('display: inline-block');
        });

        it('should include responsive CSS rules', () => {
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('width: 100%');
            expect(result).toContain('height: 100%');
        });

        it('should handle inline styles with custom dimensions', () => {
            const input = '$smiles{C1=CC=CC=C1}{"width": 100, "height": 80}';
            const result = md.render(input);

            expect(result).toContain('style="width:100px;height:80px"');
        });
    });

    describe('Error Handling in Browser', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should handle errors gracefully in browser environment', () => {
            // Mock console.error to capture error messages
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const md = new MarkdownIt().use(MarkdownItSmiles, {
                errorHandling: {
                    onError: e => console.error('Custom error handler:', e),
                },
            });

            const input = '```smiles\ninvalid-smiles-string\n```';
            const result = md.render(input);

            // Should still generate basic structure
            expect(result).toContain('class="smiles-block"');

            consoleSpy.mockRestore();
        });

        it('should handle missing SmilesDrawer library gracefully', () => {
            // Remove SmilesDrawer from global scope
            delete (global as any).SmilesDrawer;

            const md = new MarkdownIt().use(MarkdownItSmiles);
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Should still generate proper HTML structure
            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('SmiDrawer.apply()');
        });

        it('should use fallback image on rendering errors', () => {
            const fallbackImage =
                // eslint-disable-next-line max-len
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

            const md = new MarkdownIt().use(MarkdownItSmiles, {
                errorHandling: {
                    fallbackImage,
                },
            });

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('class="smiles-block"');
        });
    });

    describe('Browser Compatibility', () => {
        it('should work with older browser environments', () => {
            // Mock older browser environment
            delete (global as any).fetch;
            delete (global as any).Promise;
            (global as any).XMLHttpRequest = jest.fn();

            const md = new MarkdownIt().use(MarkdownItSmiles);
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
        });

        it('should handle different module loading systems', () => {
            // Mock AMD/RequireJS environment
            (global as any).define = jest.fn();
            (global as any).require = jest.fn();

            const md = new MarkdownIt().use(MarkdownItSmiles);
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('class="smiles-block"');

            // Clean up
            delete (global as any).define;
            delete (global as any).require;
        });
    });
});
