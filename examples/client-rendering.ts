import MarkdownIt from 'markdown-it';
import { MarkdownItSmiles } from 'markdown-it-smiles';

declare global {
    interface Window {
        renderMarkdown: () => void;
        SmiDrawer?: {
            apply: () => void;
        };
    }
}

let md = MarkdownIt().use(MarkdownItSmiles, {
    renderAtParse: false,
});

const markdownInputElement = document.getElementById('markdown-input');
const widthInputElement = document.getElementById('default-width');
const heightInputElement = document.getElementById('default-height');
const themeSelectElement = document.getElementById('theme-select');
const bondThicknessElement = document.getElementById('bond-thickness');
const bondThicknessValueElement = document.getElementById('bond-thickness-value');
const statusElement = document.getElementById('render-status');
const outputContainerElement = document.getElementById('output-container');

if (!(markdownInputElement instanceof HTMLTextAreaElement)) {
    throw new Error('Client rendering markdown input is missing from the document.');
}
if (!(widthInputElement instanceof HTMLInputElement)) {
    throw new Error('Client rendering width input is missing from the document.');
}
if (!(heightInputElement instanceof HTMLInputElement)) {
    throw new Error('Client rendering height input is missing from the document.');
}
if (!(themeSelectElement instanceof HTMLSelectElement)) {
    throw new Error('Client rendering theme select is missing from the document.');
}
if (!(bondThicknessElement instanceof HTMLInputElement)) {
    throw new Error('Client rendering bond thickness input is missing from the document.');
}
if (!(bondThicknessValueElement instanceof HTMLElement)) {
    throw new Error('Client rendering bond thickness value label is missing from the document.');
}
if (!(statusElement instanceof HTMLElement)) {
    throw new Error('Client rendering status element is missing from the document.');
}
if (!(outputContainerElement instanceof HTMLElement)) {
    throw new Error('Client rendering output container is missing from the document.');
}

const markdownInput = markdownInputElement;
const widthInput = widthInputElement;
const heightInput = heightInputElement;
const themeSelect = themeSelectElement;
const bondThicknessInput = bondThicknessElement;
const bondThicknessValue = bondThicknessValueElement;
const statusNode = statusElement;
const outputContainer = outputContainerElement;

function renderMarkdown() {
    const markdownContent = markdownInput.value;
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);
    const theme = themeSelect.value;
    const bondThickness = parseFloat(bondThicknessInput.value);

    try {
        md = MarkdownIt().use(MarkdownItSmiles, {
            renderAtParse: false,
            smilesDrawerOptions: {
                default: {
                    width,
                    height,
                    theme,
                    bondThickness,
                },
            },
        });

        const html = md.render(markdownContent);
        outputContainer.innerHTML = html;
        renderDemoContent();
        statusNode.innerHTML = '<div class="status success">✅ Rendered successfully!</div>';

        setTimeout(() => {
            window.SmiDrawer?.apply();
        }, 100);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        statusNode.innerHTML = `<div class="status error">❌ Error: ${message}</div>`;
        console.error('Rendering error:', error);
    }
}

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
            const doc = iframe.contentDocument;
            if (doc?.body) {
                const height = doc.body.scrollHeight;
                iframe.style.height = `${Math.max(height, 100)}px`;
            }
        },
        { once: true }
    );
    return iframe;
}

const demos = [
    {
        id: 'demo1',
        content: `Simple molecule: $smiles{CCO}

\`\`\`smiles
C1CCCCC1
\`\`\``,
    },
    {
        id: 'demo2',
        content: `Dynamic content example:

Ethanol: $smiles{CCO}
Methanol: $smiles{CO}
Propanol: $smiles{CCCO}`,
    },
    {
        id: 'demo3',
        content: `\`\`\`smiles {"width": 600, "height": 500, "theme": "dark", "bondThickness": 1.5}
CC(C)(C)c1ccc(O)cc1
\`\`\`

Complex molecule with custom styling.`,
    },
];

function renderDemoContent() {
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
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            element.innerHTML = `<div style="color: red; padding: 10px;">Error rendering demo: ${message}</div>`;
        }
    });
}

bondThicknessInput.addEventListener('input', () => {
    bondThicknessValue.textContent = bondThicknessInput.value;
});

window.renderMarkdown = renderMarkdown;
renderDemoContent();
renderMarkdown();
