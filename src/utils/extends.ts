export function extend(
    ...sources: (undefined | null | Record<string | symbol, unknown>)[]
): Record<string | symbol, unknown> {
    const result: Record<string | symbol, unknown> = {};
    (sources.filter(Boolean) as Record<string | symbol, unknown>[]).forEach(source => {
        const members = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)];
        for (const key of members) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (Object.prototype.toString.call(source[key]) === '[object Object]') {
                    result[key] = extend(
                        result[key] as Record<string, unknown>,
                        source[key] as Record<string, unknown>
                    );
                } else {
                    result[key] = source[key];
                }
            }
        }
    });
    return result;
}
