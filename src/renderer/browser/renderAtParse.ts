import DefaultSmilesDrawer from 'smiles-drawer';
import type { PluginContext, PluginOptions, SmilesDrawerOptions } from '../../plugin-options';
import { resolveSmilesDrawerSync } from '../../utils/smilesDrawerModule';
import { AttributeMap, filterRuntimeDataAttributes } from '../shared/attributes';

type SupportedFormat = 'svg' | 'img';

interface BrowserRenderInput {
    smiles: string;
    format: SupportedFormat;
    attrs: AttributeMap;
    options: PluginOptions;
    context: PluginContext;
    smilesOptions: Partial<SmilesDrawerOptions>;
}

function cloneMoleculeOptions(options: Partial<SmilesDrawerOptions>) {
    const {
        reactantWeights,
        reagentWeights,
        productWeights,
        reactionOptions,
        weights,
        ...moleculeOptions
    } = options;

    return {
        moleculeOptions,
        reactionOptions,
        weights,
        reactantWeights,
        reagentWeights,
        productWeights,
    };
}

function parseReactionOptions(reactionOptions: unknown): Record<string, unknown> | undefined {
    if (!reactionOptions) {
        return undefined;
    }

    if (typeof reactionOptions === 'object') {
        return { ...(reactionOptions as Record<string, unknown>) };
    }

    if (typeof reactionOptions === 'string') {
        try {
            return JSON.parse(reactionOptions.replace(/'/g, '"')) as Record<string, unknown>;
        } catch (error) {
            throw new Error(`Failed to parse reactionOptions: ${(error as Error).message}`);
        }
    }

    return undefined;
}

function buildWeightsMap(input: Partial<SmilesDrawerOptions>) {
    const payload: Record<string, unknown> = {};

    if (input.weights) {
        payload.weights = input.weights;
    }

    if (input.reactantWeights) {
        payload.reactants = input.reactantWeights;
    }

    if (input.reagentWeights) {
        payload.reagents = input.reagentWeights;
    }

    if (input.productWeights) {
        payload.products = input.productWeights;
    }

    if ('weights' in payload || 'reactants' in payload || 'reagents' in payload || 'products' in payload) {
        return payload;
    }

    return undefined;
}

export function renderSmilesAtParseBrowser({
    smiles,
    format,
    attrs,
    options,
    context,
    smilesOptions,
}: BrowserRenderInput): string {
    const module = resolveSmilesDrawerSync(options, context, DefaultSmilesDrawer);
    const SmilesDrawerCtor = module.SmiDrawer as unknown as
        | (new (molecule?: Record<string, unknown>, reaction?: Record<string, unknown>) => {
              draw: (
                  smilesText: string,
                  target: string | Element,
                  theme?: string,
                  success?: (el: Element) => void,
                  error?: (err: Error) => void,
                  weights?: unknown
              ) => void;
          })
        | undefined;

    if (!SmilesDrawerCtor) {
        throw new Error('Resolved SmilesDrawer module does not expose SmilesDrawer constructor');
    }

    const { moleculeOptions, reactionOptions, weights, ...weightSources } = cloneMoleculeOptions(smilesOptions);
    const parsedReactionOptions = parseReactionOptions(reactionOptions);
    const weightsPayload = weights ?? buildWeightsMap(weightSources);
    const drawerInstance = new SmilesDrawerCtor(moleculeOptions, parsedReactionOptions);

    let renderedElement: Element | undefined;
    let renderError: Error | undefined;

    const targetType: 'svg' | 'img' = format === 'img' ? 'img' : 'svg';

    drawerInstance.draw(
        smiles,
        targetType,
        smilesOptions.theme ?? 'light',
        element => {
            renderedElement = element;
        },
        error => {
            renderError = error;
            options.errorHandling?.onError?.(error);
        },
        weightsPayload
    );

    if (renderError) {
        if (options.errorHandling?.fallbackImage) {
            const attrString = Object.entries(attrs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            return `<img src="${options.errorHandling.fallbackImage}"${attrString ? ` ${attrString}` : ''}></img>`;
        }

        const message = renderError.message || 'Unknown SMILES rendering error';
        return [
            '<div',
            ' class="smiles-error"',
            ` data-smiles-error="Invalid SMILES: \"${smiles}\""`,
            `>${message}</div>`,
        ].join('');
    }

    if (!renderedElement) {
        return '';
    }

    const filteredAttrs = filterRuntimeDataAttributes(attrs);
    for (const [key, value] of Object.entries(filteredAttrs)) {
        renderedElement!.setAttribute(key, value);
    }
    return renderedElement.outerHTML;
}
