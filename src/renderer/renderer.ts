import type { Token } from 'markdown-it/index.js';
import { extend } from '../utils/extends';
import { PluginContext, PluginOptions, SmilesDrawerOptions } from '../plugin-options';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import SmilesDrawer from 'smiles-drawer';
import { isBrowser } from '../utils/isBrowser';

function generateRenderer(options: PluginOptions, context: PluginContext) {
    return function render(tokens: Token[], idx: number, smilesOptions: Partial<SmilesDrawerOptions>): string {
        const token = tokens[idx];
        if (!token) {
            return '';
        }
        const data = token.content;

        const format = options.format || 'svg';
        const tag = determineRenderTag(format, options);
        context.hasSmiles = true;

        const ATTRS_MAP: Record<string, keyof SmilesDrawerOptions> = {
            'data-smiles-reactant-weights': 'reactantWeights',
            'data-smiles-reagent-weights': 'reagentWeights',
            'data-smiles-product-weights': 'productWeights',
            'data-smiles-reaction-options': 'reactionOptions',
            'data-smiles-theme': 'theme',
            'data-smiles-weights': 'weights',
            width: 'width',
            height: 'height',
        };
        const attrs = Object.entries(ATTRS_MAP)
            .map(([key, smilesDrawerOptionsKey]) => {
                if (!smilesOptions[smilesDrawerOptionsKey]) {
                    return [];
                }
                const value = smilesOptions[smilesDrawerOptionsKey];
                if (Array.isArray(value)) {
                    if (Array.isArray(value[0])) {
                        const str = value
                            .map(item => {
                                if (Array.isArray(item)) {
                                    return item.join(',');
                                }
                                return item;
                            })
                            .join(';');
                        return [key, str];
                    }
                    return [key, value.join(',')];
                }
                return [key, value as string];
            })
            .filter(Boolean)
            .reduce(
                (acc, [key, value]) => {
                    if (key && value) {
                        acc[key] = value;
                    }
                    return acc;
                },
                {} as Record<string, string>
            );

        Object.assign(attrs, {
            'data-smiles': data,
            'data-smiles-options': JSON.stringify(smilesOptions).replaceAll('"', "'"),
        });
        const attrsStr = Object.entries(attrs)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');

        const html = `<${tag} ${attrsStr}></${tag}>`;

        if (!options.renderAtParse) {
            return html;
        }

        if (isBrowser()) {
            return html;
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const JSDOM = require('jsdom').JSDOM as typeof import('jsdom').JSDOM;
        const dom = new JSDOM(html);
        const exportedGlobalVariables = {
            window: dom.window,
            document: dom.window.document,
            HTMLImageElement: dom.window.HTMLImageElement,
            SVGElement: dom.window.SVGElement,
            Image: function () {
                return dom.window.document.createElement('img');
            },
        };
        Object.assign(globalThis, exportedGlobalVariables);
        try {
            let error: Error | undefined;
            SmilesDrawer.SmiDrawer.apply(undefined, undefined, undefined, undefined, null, (err: Error) => {
                error = err;
                options.errorHandling?.onError?.(err);
            });
            if (error) {
                if (options.errorHandling?.fallbackImage) {
                    return `<img src="${options.errorHandling.fallbackImage}" ${attrsStr}></img>`;
                } else {
                    return [
                        '<div',
                        ' class="smiles-error"',
                        ` data-smiles-error="Invalid SMILES: \\"${data}\\""`,
                        `>${error.message}</div>`,
                    ].join('');
                }
            }
            const element = dom.window.document.querySelector(tag);
            if (!element || format !== 'img') {
                return element?.outerHTML ?? '';
            }
            element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            const sharp = require('sharp') as typeof import('sharp');
            const bufferPromise = sharp(Buffer.from(element.outerHTML)).png().toBuffer();

            let buffer: Buffer | undefined;

            bufferPromise.then(it => {
                buffer = it;
            });

            const deasync = require('deasync');
            while (!buffer) {
                deasync.sleep(100);
            }

            const base64 = buffer.toString('base64');
            return `<img src="data:image/png;base64,${base64}" ${attrsStr}></img>`;
        } finally {
            for (const key in exportedGlobalVariables) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                delete globalThis[key];
            }
        }
    };
}

function determineRenderTag(format: string, options: PluginOptions) {
    switch (format) {
        case 'svg':
        case 'img':
            if (options.renderAtParse) {
                return 'svg';
            }
            break;
        default:
            throw new Error(`Invalid format: ${format}, only 'svg' and 'img' are supported`);
    }
    return format;
}

function createRendererWrapper(
    options: PluginOptions,
    context: PluginContext,
    className: string,
    optionType: 'block' | 'inline' = 'block'
) {
    const render = generateRenderer(options, context);
    return (tokens: Token[], idx: number): string => {
        const token = tokens[idx];
        if (!token) {
            return '';
        }
        const blockOptions: SmilesDrawerOptions = token.info ? JSON.parse(token.info) : {};
        const smilesOptions: Partial<SmilesDrawerOptions> = extend(
            {},
            options.smilesDrawerOptions?.default,
            options.smilesDrawerOptions?.[optionType],
            blockOptions as Record<string, unknown>
        );
        const html = render(tokens, idx, smilesOptions);
        const attrs: Record<string, string> = {};
        const { width, height } = smilesOptions;

        if (typeof width === 'number') {
            attrs.width = `${width}px`;
        }
        if (typeof height === 'number') {
            attrs.height = `${height}px`;
        }

        const style = Object.entries(attrs)
            .map(([key, value]) => `${key}:${value}`)
            .join(';');

        return `<div class="${className}" style="${style}">${html}</div>`;
    };
}

export function generateBlockRenderer(options: PluginOptions, context: PluginContext) {
    return createRendererWrapper(options, context, 'smiles-block', 'block');
}

export function generateInlineRenderer(options: PluginOptions, context: PluginContext) {
    return createRendererWrapper(options, context, 'smiles-inline', 'inline');
}
