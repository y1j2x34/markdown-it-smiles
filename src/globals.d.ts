declare const IS_BROWSER: boolean;

declare module 'smiles-drawer' {
    export type SmilesDrawerTheme = Record<string, string>;

    export interface SmilesDrawerInstance {
        draw(
            tree: unknown,
            target: string | HTMLElement,
            theme?: string,
            keepExisting?: boolean,
            onError?: (error: Error) => void
        ): void;
    }

    export interface SmilesDrawerModule {
        Drawer: new (options?: Record<string, unknown>) => SmilesDrawerInstance;
        SvgDrawer: new (options?: Record<string, unknown>) => SmilesDrawerInstance;
        parse(
            smiles: string,
            onSuccess: (tree: unknown) => void,
            onError?: (message: string) => void
        ): void;
        apply(
            selector?: string | HTMLElement,
            theme?: string,
            weights?: unknown,
            smiles?: string | null,
            onError?: (error: Error) => void
        ): void;
        SmiDrawer: {
            apply(...args: unknown[]): void;
        };
        [key: string]: unknown;
    }

    const SmilesDrawer: SmilesDrawerModule;

    export = SmilesDrawer;
    export as namespace SmilesDrawer;
}
