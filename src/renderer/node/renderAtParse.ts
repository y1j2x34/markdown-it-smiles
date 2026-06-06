import type { PluginContext, PluginOptions } from '../../plugin-options';
import { resolveSmilesDrawerSync } from '../../utils/smilesDrawerModule';
import DefaultSmilesDrawer from 'smiles-drawer';
import { filterRuntimeDataAttributes, attributesToString } from '../shared/attributes';

type SupportedFormat = 'svg' | 'img';

interface RenderInput {
    html: string;
    tag: string;
    format: SupportedFormat;
    attrs: string;
    smiles: string;
    options: PluginOptions;
    context: PluginContext;
}

interface GlobalBindingMap {
    [key: string]: unknown;
}

function installDomGlobals(dom: import('jsdom').JSDOM): () => void {
    const bindings: GlobalBindingMap = {
        window: dom.window,
        document: dom.window.document,
        HTMLImageElement: dom.window.HTMLImageElement,
        SVGElement: dom.window.SVGElement,
        Image: () => dom.window.document.createElement('img'),
    };

    const previous: GlobalBindingMap = {};

    for (const key of Object.keys(bindings)) {
        previous[key] = (globalThis as GlobalBindingMap)[key];
        (globalThis as GlobalBindingMap)[key] = bindings[key];
    }

    return () => {
        for (const key of Object.keys(bindings)) {
            if (previous[key] === undefined) {
                delete (globalThis as GlobalBindingMap)[key];
            } else {
                (globalThis as GlobalBindingMap)[key] = previous[key];
            }
        }
    };
}

function toSvgDataUri(svgMarkup: string): string {
    const encoded = encodeURIComponent(svgMarkup)
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function renderSmilesAtParseNode({ html, tag, format, attrs, smiles, options, context }: RenderInput): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JSDOM } = require('jsdom') as typeof import('jsdom');
    const dom = new JSDOM(html, { pretendToBeVisual: true });
    const cleanup = installDomGlobals(dom);

    try {
        let renderError: Error | undefined;
        const smilesDrawer = resolveSmilesDrawerSync(options, context, DefaultSmilesDrawer);

        smilesDrawer.SmiDrawer.apply(undefined, undefined, undefined, undefined, null, (err: Error) => {
            renderError = err;
            options.errorHandling?.onError?.(err);
        });

        if (renderError) {
            if (options.errorHandling?.fallbackImage) {
                const attrMap = filterRuntimeDataAttributes(parseAttributeString(attrs));
                const attrString = attributesToString(attrMap);
                return `<img src="${options.errorHandling.fallbackImage}"${attrString ? ` ${attrString}` : ''}></img>`;
            }

            const message = renderError.message || 'Unknown SMILES rendering error';
            return [
                '<div',
                ' class="smiles-error"',
                ` data-smiles-error="Invalid SMILES: \\\"${smiles}\\\""`,
                `>${message}</div>`,
            ].join('');
        }

        const element = dom.window.document.querySelector(tag);
        if (!element) {
            return '';
        }

        if (format === 'img') {
            const svgMarkup = element.outerHTML ?? '';
            if (!svgMarkup) {
                return '';
            }
            const dataUri = toSvgDataUri(svgMarkup);
            const attrMap = filterRuntimeDataAttributes(parseAttributeString(attrs));
            const attrString = attributesToString(attrMap);
            return `<img src="${dataUri}"${attrString ? ` ${attrString}` : ''}></img>`;
        }

        const attrMap = filterRuntimeDataAttributes(parseAttributeString(attrs));
        for (const [key, value] of Object.entries(attrMap)) {
            element.setAttribute(key, value);
        }

        return element.outerHTML ?? '';
    } finally {
        cleanup();
    }
}

function parseAttributeString(attrs: string): Record<string, string> {
    if (!attrs.trim()) {
        return {};
    }

    return attrs.split(/\s+/).reduce<Record<string, string>>((acc, chunk) => {
        const [key, rawValue] = chunk.split('=');
        if (!key || !rawValue) {
            return acc;
        }
        const value = rawValue.replace(/^"|"$/g, '');
        acc[key] = value;
        return acc;
    }, {});
}
