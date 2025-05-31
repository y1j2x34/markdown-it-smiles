// import {  } from 'smiles-drawer';

export interface SmileDrawerTheme {
    C: string;
    O: string;
    N: string;
    F: string;
    CL: string;
    BR: string;
    I: string;
    P: string;
    S: string;
    B: string;
    SI: string;
    H: string;
    BACKGROUND: string;
}

export interface SmileDrawerOptions {
    /** Drawing width */
    width?: number;
    /** Drawing height */
    height?: number;
    /** Bond thickness */
    bondThickness?: number;
    /** Bond length */
    bondLength?: number;
    /** Short bond length (e.g. double bonds) in percent of bond length */
    shortBondLength?: number;
    /** Bond spacing (e.g. space between double bonds) */
    bondSpacing?: number;
    /** Atom Visualization */
    atomVisualization?: 'default' | 'balls' | 'none';
    /** Large Font Size (in pt for elements) */
    fontSizeLarge?: number;
    /** Small Font Size (in pt for numbers) */
    fontSizeSmall?: number;
    /** Padding */
    padding?: number;
    /** Use experimental features */
    experimental?: boolean;
    /** Show Terminal Carbons (CH3) */
    terminalCarbons?: boolean;
    /** Show explicit hydrogens */
    explicitHydrogens?: boolean;
    /** Overlap sensitivity */
    overlapSensitivity?: number;
    /** # of overlap resolution iterations */
    overlapResolutionIterations?: number;
    /** Draw concatenated terminals and pseudo elements */
    compactDrawing?: boolean;
    /** Draw isometric SMILES if available */
    isometric?: boolean;
    /** Debug (draw debug information to canvas) */
    debug?: boolean;
    themes?: Record<string, SmileDrawerTheme>;
    theme?: string;
    reactantWeights?: string | number[][];
    productWeights?: string | number[][];
    reactionOptions?: string;
    weights?: string | number[];
    reagentWeights?: string | number[][];
}

export interface PluginOptions {
    fontUrl?: string;
    format?: 'svg' | 'img' | 'canvas';
    smileDrawerScript?: string;

    smileDrawerOptions?: {
        default?: Partial<SmileDrawerOptions>;
        inline?: Partial<SmileDrawerOptions>;
        block?: Partial<SmileDrawerOptions>;
    };
    errorHandling?: {
        onError?: (e: Error) => void;
        fallbackImage?: string;
    };
}

export interface PluginContext {
    hasSmiles: boolean;
}
