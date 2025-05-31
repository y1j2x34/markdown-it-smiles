export function extend(...sources: (undefined | null | Record<string, any>)[]): Record<string, any> {
    const result: Record<string, any> = {};
    (sources.filter(Boolean) as Record<string, any>[]).forEach(source => {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (Object.prototype.toString.call(source[key]) === '[object Object]') {
                    result[key] = extend(result[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
    });
    return result;
}
