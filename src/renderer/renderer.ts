import type { Token } from 'markdown-it/index.js';
import { extend } from '../utils/extends';
import { PluginContext, PluginOptions, SmilesDrawerOptions } from '../plugin-options';
import { isBrowser } from '../utils/isBrowser';
import { normalizeSmilesDrawerOptions } from '../utils/cssUnits';
import { renderSmilesAtParseNode } from './node/renderAtParse';
import { renderSmilesAtParseBrowser } from './browser/renderAtParse';

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
            const attrMap = Object.entries(attrs).reduce<Record<string, string>>((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

            return renderSmilesAtParseBrowser({
                smiles: data,
                format,
                attrs: attrMap,
                options,
                context,
                smilesOptions,
            });
        }

        return renderSmilesAtParseNode({
            html,
            tag,
            format,
            attrs: attrsStr,
            smiles: data,
            options,
            context,
        });
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
        const blockOptions: Partial<SmilesDrawerOptions> = token.info ? JSON.parse(token.info) : {};
        const mergedOptions = extend(
            {},
            options.smilesDrawerOptions?.default,
            options.smilesDrawerOptions?.[optionType],
            blockOptions as Record<string, unknown>
        ) as Partial<SmilesDrawerOptions>;
        const { normalizedOptions, cssLengths } = normalizeSmilesDrawerOptions(
            mergedOptions,
            options.cssUnitContext
        );
        const html = render(tokens, idx, normalizedOptions);

        const style = Object.entries(cssLengths)
            .filter(([, value]) => Boolean(value))
            .map(([key, value]) => `${key}:${value}`)
            .join(';');

        const styleAttr = style.length > 0 ? ` style="${style}"` : '';

        const tagName = optionType === 'inline' ? 'span' : 'div';
        return `<${tagName} class="${className}"${styleAttr}>${html}</${tagName}>`;
    };
}

export function generateBlockRenderer(options: PluginOptions, context: PluginContext) {
    return createRendererWrapper(options, context, 'smiles-block', 'block');
}

export function generateInlineRenderer(options: PluginOptions, context: PluginContext) {
    return createRendererWrapper(options, context, 'smiles-inline', 'inline');
}
