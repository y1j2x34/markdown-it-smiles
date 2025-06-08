import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from '../src/index';
import { PluginOptions } from '../src/plugin-options';

// Mock environment variables and dependencies
const mockJSDOM = {
    JSDOM: jest.fn().mockImplementation((html: string) => ({
        window: {
            document: {
                createElement: jest.fn().mockReturnValue({
                    setAttribute: jest.fn(),
                    outerHTML: '<svg></svg>'
                }),
                querySelector: jest.fn().mockReturnValue({
                    setAttribute: jest.fn(),
                    outerHTML: '<svg></svg>'
                })
            },
            HTMLImageElement: class { },
            SVGElement: class { },
        }
    }))
};

const mockSharp = jest.fn().mockReturnValue({
    png: jest.fn().mockReturnValue({
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data'))
    })
});

const mockDeasync = {
    sleep: jest.fn()
};

let mockSmilesDrawer: any = (globalThis as any).mockSmilesDrawer;

// Mock fs for script content reading
const mockFs = {
    readFileSync: jest.fn().mockReturnValue('/* mock smiles-drawer script */')
};

// Mock require function
const originalRequire = require;
jest.mock('jsdom', () => mockJSDOM);
jest.mock('sharp', () => mockSharp);
jest.mock('deasync', () => mockDeasync);
jest.mock('smiles-drawer', () => {
    if (!(globalThis as any).mockSmilesDrawer) {
        (globalThis as any).mockSmilesDrawer = {
            SmiDrawer: {
                apply: jest.fn()
            }
        };
    }
    return (globalThis as any).mockSmilesDrawer;

});
jest.mock('fs', () => mockFs);

describe('MarkdownItSmiles Plugin', () => {
    let md: MarkdownIt;

    beforeEach(() => {
        md = new MarkdownIt();
        jest.clearAllMocks();
    });

    describe('Plugin Registration', () => {
        it('should register the plugin without errors', () => {
            expect(() => {
                md.use(MarkdownItSmiles);
            }).not.toThrow();
        });

        it('should register custom block and inline rules', () => {
            md.use(MarkdownItSmiles);

            // Check if custom renderers are registered
            expect(md.renderer.rules.smiles_block).toBeDefined();
            expect(md.renderer.rules.smiles_inline).toBeDefined();
        });
    });

    describe('Block SMILES Rendering', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should render basic block SMILES', () => {
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('class="smiles-block"');
        });

        it('should render block SMILES with options', () => {
            const input = '```smiles {"width": 300, "height": 200}\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('width:300px');
            expect(result).toContain('height:200px');
        });

        it('should handle malformed block options gracefully', () => {
            const input = '```smiles {invalid json}\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('class="smiles-block"');
        });

        it('should not process non-smiles code blocks', () => {
            const input = '```javascript\nconsole.log("hello");\n```';
            const result = md.render(input);

            expect(result).not.toContain('data-smiles');
            expect(result).not.toContain('class="smiles-block"');
        });
    });

    describe('Inline SMILES Rendering', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should render basic inline SMILES', () => {
            const input = 'This is benzene: $smiles{C1=CC=CC=C1}';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('class="smiles-inline"');
        });

        it('should render inline SMILES with options', () => {
            const input = 'Benzene: $smiles{C1=CC=CC=C1}{"width": 50, "height": 50}';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(result).toContain('width:50px');
            expect(result).toContain('height:50px');
        });

        it('should handle nested braces in SMILES', () => {
            const input = '$smiles{C1=CC=C(C(=O)O)C=C1}';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=C(C(=O)O)C=C1'");
        });

        it('should handle malformed inline options gracefully', () => {
            const input = '$smiles{C1=CC=CC=C1}{invalid json}';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
        });
    });

    describe('Plugin Options', () => {
        it('should respect format option (svg)', () => {
            const options: PluginOptions = { format: 'svg' };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('<svg');
        });

        it('should respect format option (img) in node environment', () => {
            const originalEnv = process.env.IS_BROWSER;
            delete process.env.IS_BROWSER;

            const options: PluginOptions = {
                format: 'img',
                renderAtParse: true
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");

            process.env.IS_BROWSER = originalEnv;
        });

        it('should apply default SmileDrawer options', () => {
            const options: PluginOptions = {
                smileDrawerOptions: {
                    default: { theme: 'dark', width: 400 },
                    block: { height: 300 }
                }
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('data-smiles-theme="dark"');
            expect(result).toContain('width:400px');
            expect(result).toContain('height:300px');
        });

        it('should merge inline and default options correctly', () => {
            const options: PluginOptions = {
                smileDrawerOptions: {
                    default: { theme: 'dark', width: 400 },
                    inline: { width: 50, height: 50 }
                }
            };
            md.use(MarkdownItSmiles, options);

            const input = 'Benzene: $smiles{C1=CC=CC=C1}';
            const result = md.render(input);

            expect(result).toContain('data-smiles-theme="dark"');
            expect(result).toContain('width:50px');
            expect(result).toContain('height:50px');
        });
    });

    describe('Script and Style Injection', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should inject scripts and styles when SMILES are present', () => {
            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('<style>');
            expect(result).toContain('.smiles-block');
            expect(result).toContain('.smiles-inline');
            expect(result).toContain('<script>');
            expect(result).toContain('SmiDrawer.apply()');
        });

        it('should not inject scripts when no SMILES are present', () => {
            const input = 'Regular markdown content';
            const result = md.render(input);

            expect(result).not.toContain('<style>');
            expect(result).not.toContain('<script>');
        });

        it('should use custom script URL when provided', () => {
            const options: PluginOptions = {
                smileDrawerScript: 'https://example.com/smiles-drawer.js'
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('src="https://example.com/smiles-drawer.js"');
        });
    });

    describe('Node Environment Specific', () => {
        beforeEach(() => {
            delete process.env.IS_BROWSER;
        });

        it('should support renderAtParse in node environment', () => {
            const options: PluginOptions = { renderAtParse: true };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=CC=C1'");
            expect(mockJSDOM.JSDOM).toHaveBeenCalled();
        });

        it('should generate PNG images when format is img and renderAtParse is true', () => {
            const options: PluginOptions = {
                format: 'img',
                renderAtParse: true
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('data:image/png;base64,');
            expect(mockSharp).toHaveBeenCalled();
        });

        it('should read inline script content in node environment', () => {
            const options: PluginOptions = { renderAtParse: false };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('/* mock smiles-drawer script */');
            expect(mockFs.readFileSync).toHaveBeenCalled();
        });
    });

    describe('Browser Environment Specific', () => {
        beforeEach(() => {
            process.env.IS_BROWSER = 'true';
        });

        afterEach(() => {
            delete process.env.IS_BROWSER;
        });

        it('should disable renderAtParse in browser environment', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const options: PluginOptions = { renderAtParse: true };
            md.use(MarkdownItSmiles, options);

            expect(consoleSpy).toHaveBeenCalledWith(
                'renderAtParse is not supported in browser environment, it will be ignored'
            );

            consoleSpy.mockRestore();
        });

        it('should return empty script content in browser environment', () => {
            md.use(MarkdownItSmiles);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            // Should not contain inline script content
            expect(result).not.toContain('/* mock smiles-drawer script */');
            expect(mockFs.readFileSync).not.toHaveBeenCalled();
        });

        it('should handle document availability check', () => {
            // Mock document to simulate browser environment
            global.document = {} as Document;

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const options: PluginOptions = { renderAtParse: true };
            md.use(MarkdownItSmiles, options);

            expect(consoleSpy).toHaveBeenCalled();

            delete (global as any).document;
            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should handle empty SMILES gracefully', () => {
            const input = '```smiles\n\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles=''");
        });

        it('should handle invalid SMILES syntax gracefully', () => {
            const input = '```smiles\nINVALID_SMILES\n```';
            const result = md.render(input);

            expect(result).toContain("data-smiles='INVALID_SMILES'");
            expect(result).toContain('class="smiles-block"');
        });

        it('should handle missing closing markers gracefully', () => {
            const input = '```smiles\nC1=CC=CC=C1';
            const result = md.render(input);

            // Should be treated as regular paragraph
            expect(result).not.toContain('data-smiles');
        });

        it('should handle malformed inline SMILES gracefully', () => {
            const input = '$smiles{C1=CC=CC=C1';
            const result = md.render(input);

            // Should be treated as regular text
            expect(result).not.toContain('data-smiles');
            expect(result).toContain('$smiles{C1=CC=CC=C1');
        });
    });

    describe('Complex Scenarios', () => {
        beforeEach(() => {
            md.use(MarkdownItSmiles);
        });

        it('should handle multiple SMILES in one document', () => {
            const input = `
# Chemical Structures

Benzene: $smiles{C1=CC=CC=C1}

\`\`\`smiles
C1=CC=CC=C1
\`\`\`

And caffeine: $smiles{CN1C=NC2=C1C(=O)N(C(=O)N2C)C}
            `;

            const result = md.render(input);

            // Should contain multiple SMILES
            const smilesMatches = result.match(/data-smiles=/g);
            expect(smilesMatches).toHaveLength(3);

            // Should inject scripts only once
            expect(result).toContain('<script>');
        });

        it('should handle SMILES with special characters', () => {
            const input = '$smiles{C1=CC=C(C(=O)O)C=C1}';
            const result = md.render(input);

            expect(result).toContain("data-smiles='C1=CC=C(C(=O)O)C=C1'");
        });

        it('should handle array-type SmileDrawer options', () => {
            const options: PluginOptions = {
                smileDrawerOptions: {
                    default: {
                        reactantWeights: [[1, 2], [3, 4]],
                        weights: [1, 2, 3]
                    }
                }
            };
            md.use(MarkdownItSmiles, options);

            const input = '```smiles\nC1=CC=CC=C1\n```';
            const result = md.render(input);

            expect(result).toContain('data-smiles-reactant-weights="1,2;3,4"');
            expect(result).toContain('data-smiles-weights="1,2,3"');
        });
    });
}); 