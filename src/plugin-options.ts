/**
 * Theme colors for SmileDrawer rendering engine.
 * Each property represents a color for a specific atom or drawing element.
 *
 * See: https://github.com/reymond-group/smilesDrawer#options
 */
export interface SmileDrawerTheme {
    /** Carbon color (default: '#fff' for dark, '#222' for light) */
    C: string;
    /** Oxygen color (default: '#e74c3c') */
    O: string;
    /** Nitrogen color (default: '#3498db') */
    N: string;
    /** Fluorine color (default: '#27ae60') */
    F: string;
    /** Chlorine color (default: '#16a085') */
    CL: string;
    /** Bromine color (default: '#d35400') */
    BR: string;
    /** Iodine color (default: '#8e44ad') */
    I: string;
    /** Phosphorus color (default: '#d35400') */
    P: string;
    /** Sulfur color (default: '#f1c40f') */
    S: string;
    /** Boron color (default: '#e67e22') */
    B: string;
    /** Silicon color (default: '#e67e22') */
    SI: string;
    /** Hydrogen color (default: '#fff' for dark, '#222' for light) */
    H: string;
    /** Background color (default: '#141414' for dark, '#fff' for light) */
    BACKGROUND: string;
}

/**
 * Options for configuring the SmilesDrawer rendering engine.
 *
 * See: https://github.com/reymond-group/smilesDrawer#options
 */
export interface SmileDrawerOptions {
    /** Drawing width (default: 500px; for inline SMILES: 1em) */
    width?: number;
    /** Drawing height (default: 500px; for inline SMILES: 1em) */
    height?: number;
    /** Bond thickness in pixels (default: 0.6) */
    bondThickness?: number;
    /** Bond length in pixels (default: 15) */
    bondLength?: number;
    /** Short bond length (e.g. double bonds) as a fraction of bond length (default: 0.85) */
    shortBondLength?: number;
    /** Bond spacing (e.g. space between double bonds) in pixels (default: 0.18 * 15) */
    bondSpacing?: number;
    /** Atom visualization style: 'default', 'balls', or 'none' (default: 'default') */
    atomVisualization?: 'default' | 'balls' | 'none';
    /** Large font size (in pt) for element symbols (default: 6) */
    fontSizeLarge?: number;
    /** Small font size (in pt) for numbers (default: 4) */
    fontSizeSmall?: number;
    /** Padding around the drawing in pixels (default: 20.0) */
    padding?: number;
    /** Enable experimental features for complex ring systems (default: false) */
    experimental?: boolean;
    /** Show terminal carbons (e.g. CH3 groups) (default: false) */
    terminalCarbons?: boolean;
    /** Show explicit hydrogens (default: false) */
    explicitHydrogens?: boolean;
    /** Overlap sensitivity for atom placement (default: 0.42) */
    overlapSensitivity?: number;
    /** Number of overlap resolution iterations (default: 1) */
    overlapResolutionIterations?: number;
    /** Draw concatenated terminals and pseudo elements in a compact style (default: true) */
    compactDrawing?: boolean;
    /** Draw isometric SMILES if available (default: true) */
    isometric?: boolean;
    /** Draw debug information to canvas (default: false) */
    debug?: boolean;
    /** Color themes for rendering, keyed by theme name (default: {dark, light}) */
    themes?: Record<string, SmileDrawerTheme>;
    /** Name of the theme to use (e.g. 'light' or 'dark') */
    theme?: string;
    /** Weights for reactants in reactions (advanced, rarely used) */
    reactantWeights?: string | number[][];
    /** Weights for products in reactions (advanced, rarely used) */
    productWeights?: string | number[][];
    /** Additional reaction options as a string (advanced, rarely used) */
    reactionOptions?: string;
    /** Weights for atoms (advanced, rarely used) */
    weights?: string | number[];
    /** Weights for reagents in reactions (advanced, rarely used) */
    reagentWeights?: string | number[][];
}

/**
 * Options for configuring the markdown-it-smiles plugin.
 * These options extend the core SmilesDrawer options for integration with markdown-it.
 */
export interface PluginOptions {
    /**
     * URL to a custom font to use for rendering.
     */
    fontUrl?: string;
    /**
     * Output format for rendered SMILES: SVG or image.
     */
    format?: 'svg' | 'img';
    /**
     * Path or URL to the SmileDrawer script to use for rendering.
     */
    smileDrawerScript?: string;
    /**
     * If true, the smiles will be rendered at parse time.
     * This is useful for markdown-it-container, but it will work only in node environment.
     */
    renderAtParse?: boolean;
    /**
     * SmileDrawer rendering options for different contexts.
     * - default: options for all renderings
     * - inline: options for inline SMILES
     * - block: options for block SMILES
     */
    smileDrawerOptions?: {
        /** Default options for all renderings */
        default?: Partial<SmileDrawerOptions>;
        /** Options for inline SMILES */
        inline?: Partial<SmileDrawerOptions>;
        /** Options for block SMILES */
        block?: Partial<SmileDrawerOptions>;
    };
    /**
     * Error handling options.
     * - onError: callback for handling errors
     * - fallbackImage: image to use if rendering fails
     */
    errorHandling?: {
        /** Callback for handling errors */
        onError?: (e: Error) => void;
        /** Fallback image URL or data URI if rendering fails */
        fallbackImage?: string;
    };
}

/**
 * Context object for the plugin, used internally to track state.
 */
export interface PluginContext {
    /** Whether the document contains any SMILES blocks */
    hasSmiles: boolean;
}
