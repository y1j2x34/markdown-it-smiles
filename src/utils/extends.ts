export function extend(
    target: Record<string, any>,
    ...sources: (undefined | null | Record<string, any>)[]
): Record<string, any> {
    const result: Record<string, any> = {};
    (sources.filter(Boolean) as Record<string, any>[]).forEach(source => {
        Object.keys(source).forEach(key => {
            if (typeof target[key] === 'object' && target[key] !== null) {
                target[key] = extend(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });
    });
    return result;
}
