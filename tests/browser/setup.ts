// @ts-expect-error
globalThis.require = () => {
    throw new Error('require is not supported in browser environment');
};
// @ts-expect-error
globalThis.process = {
    env: {
        IS_BROWSER: 'true'
    }
};