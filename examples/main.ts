import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from 'markdown-it-smiles';

type Demo = {
    id: string;
    content: string;
};

const demos: Demo[] = [
    {
        id: 'demo1',
        content: '```smiles\nCCO\n```',
    },
    {
        id: 'demo2',
        content: '```smiles {"width": 400, "height": 300, "bondThickness": 1.2}\nC1CCCCC1\n```',
    },
    {
        id: 'demo3',
        content: '```smiles {"width": 500, "height": 350, "theme": "dark"}\nCC(C)(C)c1ccc(O)cc1\n```',
    },
    {
        id: 'demo4',
        content: '```smiles {"width": 300, "height": 250, "bondLength": 20, "atomVisualization": "balls"}\nc1ccccc1\n```',
    },
    {
        id: 'demo5',
        content: 'The molecule $smiles{CCO} is ethanol, while $smiles{C1CCCCC1} is cyclohexane.',
    },
    {
        id: 'demo6',
        content: 'Caffeine $smiles{CN1C=NC2=C1C(=O)N(C(=O)N2C)C}{"width": 100, "height": 80} is a stimulant found in coffee.',
    },
    {
        id: 'demo7',
        content: `# Organic Chemistry Examples

## Simple Alcohols
The simplest alcohol is $smiles{CO} (methanol), followed by $smiles{CCO} (ethanol).

## Aromatic Compounds
\`\`\`smiles {"width": 350, "height": 280}
c1ccccc1
\`\`\`

Benzene is the fundamental aromatic compound with the molecular formula C₆H₆.

## Complex Molecules
Aspirin has the structure $smiles{CC(=O)OC1=CC=CC=C1C(=O)O} and is widely used as a pain reliever.`,
    },
];

const md = MarkdownIt().use(MarkdownItSmiles, {
    renderAtParse: false,
});

function createIframe(content: string) {
    const iframe = document.createElement('iframe');
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 10px;
                    margin: 0;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    iframe.addEventListener(
        'load',
        () => {
            URL.revokeObjectURL(url);
        },
        { once: true }
    );
    return iframe;
}

function renderDemos() {
    demos.forEach(demo => {
        const element = document.getElementById(demo.id);
        if (!element) {
            return;
        }
        try {
            const renderedHtml = md.render(demo.content);
            const iframe = createIframe(renderedHtml);
            element.innerHTML = '';
            element.appendChild(iframe);
            iframe.onload = () => {
                try {
                    const height = iframe.contentDocument?.body.scrollHeight ?? 150;
                    iframe.style.height = `${Math.max(height, 100)}px`;
                } catch (error) {
                    console.error('[markdown-it-smiles examples] Failed to resize iframe', error);
                    iframe.style.height = '150px';
                }
            };
        } catch (error) {
            element.innerHTML = `<div style="color: red; padding: 10px;">Error rendering demo: ${(error as Error).message}</div>`;
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderDemos, { once: true });
} else {
    renderDemos();
}
