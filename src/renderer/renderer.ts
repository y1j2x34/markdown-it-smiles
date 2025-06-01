import { Options } from 'markdown-it';
import type { Renderer, Token } from 'markdown-it/index.js';
import { PluginContext, PluginOptions, SmileDrawerOptions } from '../plugin-options';
import { extend } from '~/utils/extends';

function generateRenderer(options: PluginOptions, context: PluginContext) {
    return function render(tokens: Token[], idx: number, smilesOptions: Partial<SmileDrawerOptions>): string {
        const token = tokens[idx];
        if (!token) {
            return '';
        }
        const data = token.content;

        const format = options.format || 'svg';
        switch (format) {
            case 'svg':
            case 'img':
                break;
            default:
                throw new Error(`Invalid format: ${format}, only 'svg' and 'img' are supported`);
        }
        context.hasSmiles = true;

        const ATTRS_MAP: Record<string, keyof SmileDrawerOptions> = {
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
                    return;
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
                        return `${key}="${str}"`;
                    }
                    return `${key}="${value.join(',')}"`;
                }
                return `${key}="${value}"`;
            })
            .filter(Boolean)
            .join(' ');

        return `<${format} 
            data-smiles="${data}" 
            ${attrs}
            data-smiles-options='${JSON.stringify(smilesOptions)}'></${format}>`;
    };
}

function createRendererWrapper(
    options: PluginOptions,
    context: PluginContext,
    className: string,
    optionType: 'block' | 'inline' = 'block'
) {
    const render = generateRenderer(options, context);
    return (tokens: Token[], idx: number, rendererOptions: Options, env: any, self: Renderer): string => {
        const token = tokens[idx];
        if (!token) {
            return '';
        }
        const blockOptions: SmileDrawerOptions = token.info ? JSON.parse(token.info) : {};
        const smilesOptions: Partial<SmileDrawerOptions> = extend(
            {},
            options.smileDrawerOptions?.default,
            options.smileDrawerOptions?.[optionType],
            blockOptions
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
