import { Options } from 'markdown-it';
import type { Renderer, Token } from 'markdown-it/index.js';
import { PluginContext, PluginOptions, SmileDrawerOptions, SmilerDrawerBlockOptions } from '../plugin-options';
// @ts-ignore
import smilesDrawer from 'smiles-drawer';
import { extend } from '~/utils/extends';

function generateRenderer(options: PluginOptions, context: PluginContext) {
    return function render(tokens: Token[], idx: number, rendererOptions: Options, env: any, self: Renderer): string {
        const token = tokens[idx];
        if (!token) {
            return '';
        }
        const data = token.content;
        const blockOptions: SmilerDrawerBlockOptions = token.info ? JSON.parse(token.info) : {};
        const smilesOptions: Partial<SmileDrawerOptions> = extend(
            {},
            options.smileDrawerOptions?.default,
            options.smileDrawerOptions?.block,
            blockOptions.options
        );

        const format = options.format || 'svg';
        context.hasSmiles = true;
        console.log('render', data);

        const ATTRS_MAP: Record<string, keyof SmilerDrawerBlockOptions> = {
            'data-smiles-reactant-weights': 'reactantWeights',
            'data-smiles-product-weights': 'productWeights',
            'data-smiles-reaction-options': 'reactionOptions',
        };
        const attrs = Object.entries(ATTRS_MAP)
            .map(([key, value]) => {
                if (!blockOptions[value]) {
                    return;
                }
                return `${key}="${blockOptions[value]}"`;
            })
            .filter(Boolean)
            .join(' ');

        switch (format) {
            case 'svg': {
                return `<svg 
                    data-smiles="${data}" 
                    ${attrs}
                    data-smiles-options="${JSON.stringify(smilesOptions)}"></img>`;
            }
            case 'png': {
                return `<img 
                    data-smiles="${data}" 
                    ${attrs}
                    data-smiles-options="${JSON.stringify(smilesOptions)}"></img>`;
            }
            case 'canvas':
                return ``;
        }
    };
}
export function generateBlockRenderer(options: PluginOptions, context: PluginContext) {
    const render = generateRenderer(options, context);
    return (tokens: Token[], idx: number, rendererOptions: Options, env: any, self: Renderer): string => {
        const html = render(tokens, idx, rendererOptions, env, self);
        return `<div class="smiles-block">${html}</div>`;
    };
}

export function generateInlineRenderer(options: PluginOptions, context: PluginContext) {
    const render = generateRenderer(options, context);
    return (tokens: Token[], idx: number, rendererOptions: Options, env: any, self: Renderer): string => {
        const html = render(tokens, idx, rendererOptions, env, self);
        return `<div class="smiles-inline">${html}</div>`;
    };
}
