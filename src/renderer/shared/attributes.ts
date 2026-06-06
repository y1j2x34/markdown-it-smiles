export type AttributeMap = Record<string, string>;

const DATA_PREFIX = 'data-smiles';
const RENDERED_FLAG = 'data-smiles-rendered';

export function cloneAttributes(attrs: AttributeMap): AttributeMap {
    return { ...attrs };
}

export function attributesToString(attrs: AttributeMap): string {
    return Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
}

export function filterRuntimeDataAttributes(attrs: AttributeMap): AttributeMap {
    const filtered: AttributeMap = {};
    for (const [key, value] of Object.entries(attrs)) {
        if (key.startsWith(DATA_PREFIX)) {
            continue;
        }
        filtered[key] = value;
    }
    filtered[RENDERED_FLAG] = 'true';
    return filtered;
}
