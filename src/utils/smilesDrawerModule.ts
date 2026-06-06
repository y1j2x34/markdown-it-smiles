import type { PluginContext, PluginOptions, SmilesDrawerLoaderResult } from '../plugin-options';

export interface SmilesDrawerModuleCache {
    module?: SmilesDrawerLoaderResult;
    modulePromise?: Promise<SmilesDrawerLoaderResult>;
}

type LoaderResult = Promise<SmilesDrawerLoaderResult> | SmilesDrawerLoaderResult | undefined;

export function normalizeSmilesDrawerModule(module: unknown): SmilesDrawerLoaderResult {
    if (!module) {
        throw new Error('Failed to resolve SmilesDrawer: loader returned an empty value');
    }

    const candidate = module as SmilesDrawerLoaderResult & { default?: unknown };

    if (candidate.SmiDrawer) {
        return candidate;
    }

    if (candidate.default) {
        return normalizeSmilesDrawerModule(candidate.default);
    }

    throw new Error('Failed to resolve SmilesDrawer: module does not expose SmiDrawer');
}

export function getContextCache(context: PluginContext): SmilesDrawerModuleCache {
    const cache = (context.smilesDrawerModuleCache ??= {} as SmilesDrawerModuleCache);
    return cache;
}

export function resolveSmilesDrawerSync(
    options: PluginOptions,
    context: PluginContext,
    defaultModule: SmilesDrawerLoaderResult
): SmilesDrawerLoaderResult {
    const cache = getContextCache(context);
    if (cache.module) {
        context.smilesDrawerModule = cache.module;
        return cache.module;
    }

    const loader = options.loadSmilesDrawer;
    if (!loader) {
        cache.module = normalizeSmilesDrawerModule(defaultModule);
        context.smilesDrawerModule = cache.module;
        return cache.module;
    }

    const result = loader();
    if (result && typeof (result as Promise<unknown>).then === 'function') {
        throw new Error('loadSmilesDrawer() returned a Promise but synchronous resolution was requested');
    }

    cache.module = normalizeSmilesDrawerModule(result);
    context.smilesDrawerModule = cache.module;
    return cache.module;
}

export function resolveSmilesDrawerAsync(
    options: PluginOptions,
    context: PluginContext,
    defaultModule: SmilesDrawerLoaderResult
): Promise<SmilesDrawerLoaderResult> {
    const cache = getContextCache(context);

    if (cache.module) {
        context.smilesDrawerModule = cache.module;
        return Promise.resolve(cache.module);
    }

    if (cache.modulePromise) {
        return cache.modulePromise;
    }

    const loader = options.loadSmilesDrawer;
    let maybeResult: LoaderResult;

    try {
        maybeResult = loader ? loader() : defaultModule;
    } catch (error) {
        return Promise.reject(error);
    }

    if (maybeResult && typeof (maybeResult as Promise<unknown>).then === 'function') {
        cache.modulePromise = (maybeResult as Promise<SmilesDrawerLoaderResult>).then(mod => {
            const normalized = normalizeSmilesDrawerModule(mod);
            cache.module = normalized;
            context.smilesDrawerModule = normalized;
            return normalized;
        });
        return cache.modulePromise;
    }

    const normalized = normalizeSmilesDrawerModule(maybeResult);
    cache.module = normalized;
    context.smilesDrawerModule = normalized;
    return Promise.resolve(normalized);
}
