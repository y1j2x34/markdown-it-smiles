import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from '~/index';

describe('Basic SMILES Rendering Tests', () => {
    it('should render a simple SMILES block', () => {
        const md = new MarkdownIt().use(MarkdownItSmiles);
        const input = '```smiles\nC1=CC=CC=C1\n```';
        const result = md.render(input);

        expect(result).toContain('class="smiles-block"');
        expect(result).toContain("data-smiles='C1=CC=CC=C1'");
    });

    it('should render inline SMILES', () => {
        const md = new MarkdownIt().use(MarkdownItSmiles);
        const input = 'The benzene molecule is $smiles{C1=CC=CC=C1}$.';
        const result = md.render(input);

        expect(result).toContain('class="smiles-inline"');
        expect(result).toContain("data-smiles='C1=CC=CC=C1'");
    });

    it('should handle empty SMILES gracefully', () => {
        const md = new MarkdownIt().use(MarkdownItSmiles);
        const input = '```smiles\n\n```';
        const result = md.render(input);

        expect(result).toContain('class="smiles-block"');
        expect(result).toContain("data-smiles=''");
    });
});
