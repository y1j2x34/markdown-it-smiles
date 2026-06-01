import type { CssLengthValue, CssUnitContext, SmilesDrawerOptions } from '../plugin-options';

const DEFAULT_ROOT_FONT_SIZE = 16;
const DEFAULT_BASE_FONT_SIZE = 16;
const PX_PER_POINT = 96 / 72;
const CSS_LENGTH_REGEX = /^(-?\d*\.?\d+)(px|pt|em|rem)?$/i;

type TargetUnit = 'px' | 'pt';

const LENGTH_FIELDS_PX = ['width', 'height', 'bondThickness', 'bondLength', 'bondSpacing', 'padding'] as const;
const LENGTH_FIELDS_PT = ['fontSizeLarge', 'fontSizeSmall'] as const;
const STYLE_FIELDS = ['width', 'height'] as const;

type LengthFieldPx = (typeof LENGTH_FIELDS_PX)[number];
type LengthFieldPt = (typeof LENGTH_FIELDS_PT)[number];
type StyleField = (typeof STYLE_FIELDS)[number];

function resolveContext(context?: CssUnitContext) {
    return {
        rootFontSize: context?.rootFontSize ?? DEFAULT_ROOT_FONT_SIZE,
        baseFontSize: context?.baseFontSize ?? context?.rootFontSize ?? DEFAULT_BASE_FONT_SIZE,
    };
}

function parseCssLength(value: string): { amount: number; unit: string } {
    const trimmed = value.trim();
    const match = CSS_LENGTH_REGEX.exec(trimmed);
    if (!match) {
        throw new Error(`Unsupported CSS length value: "${value}"`);
    }
    return {
        amount: Number.parseFloat(match[1]!),
        unit: (match[2] ?? '').toLowerCase(),
    };
}

function toPixels(value: CssLengthValue, context?: CssUnitContext): number {
    if (typeof value === 'number') {
        return value;
    }
    const { amount, unit } = parseCssLength(value);
    const { rootFontSize, baseFontSize } = resolveContext(context);

    switch (unit) {
        case '':
        case 'px':
            return amount;
        case 'em':
            return amount * baseFontSize;
        case 'rem':
            return amount * rootFontSize;
        case 'pt':
            return amount * PX_PER_POINT;
        default:
            throw new Error(`Unsupported CSS unit: "${unit}" in length "${value}"`);
    }
}

export function toNumericLength(
    value: CssLengthValue,
    targetUnit: TargetUnit,
    context?: CssUnitContext
): number {
    const pixels = toPixels(value, context);

    if (Number.isNaN(pixels) || !Number.isFinite(pixels)) {
        throw new Error(`Failed to resolve CSS length to numeric value: "${value}"`);
    }

    if (targetUnit === 'px') {
        return pixels;
    }

    return pixels / PX_PER_POINT;
}

export function formatCssLength(value?: CssLengthValue): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value === 'number') {
        return `${value}px`;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

type LengthAccumulator = Partial<Record<LengthFieldPx | LengthFieldPt, number>> &
    Partial<SmilesDrawerOptions>;

type CssLengthAccumulator = Partial<Record<StyleField, string>>;

function mapLengthFields(
    source: Partial<SmilesDrawerOptions>,
    context?: CssUnitContext
): { normalized: Partial<SmilesDrawerOptions>; cssLengths: CssLengthAccumulator } {
    const normalized: LengthAccumulator = {};
    const cssLengths: CssLengthAccumulator = {};

    for (const field of LENGTH_FIELDS_PX) {
        const value = source[field];
        if (value === undefined) {
            continue;
        }
        normalized[field] = toNumericLength(value, 'px', context);
        if ((STYLE_FIELDS as readonly string[]).includes(field as StyleField)) {
            cssLengths[field as StyleField] = formatCssLength(value);
        }
    }

    for (const field of LENGTH_FIELDS_PT) {
        const value = source[field];
        if (value === undefined) {
            continue;
        }
        normalized[field] = toNumericLength(value, 'pt', context);
    }

    return { normalized, cssLengths };
}

export function normalizeSmilesDrawerOptions(
    options: Partial<SmilesDrawerOptions>,
    context?: CssUnitContext
): { normalizedOptions: Partial<SmilesDrawerOptions>; cssLengths: CssLengthAccumulator } {
    const { normalized, cssLengths } = mapLengthFields(options, context);

    return {
        normalizedOptions: {
            ...options,
            ...normalized,
        },
        cssLengths,
    };
}
