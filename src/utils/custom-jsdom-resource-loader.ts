import type { JSDOM, FetchOptions } from 'jsdom';

export function createCustomResourceLoader() {
    const jsdom = require('jsdom');
    class CustomResourceLoader extends jsdom.ResourceLoader {
        fetch(url: string, options: FetchOptions) {
            // Handle data:image/svg+xml;base64 URLs
            if (url.startsWith('data:image/svg+xml;base64,')) {
                const base64Data = url.split(',')[1]!;
                const buffer = Buffer.from(base64Data, 'base64');
                return Promise.resolve(buffer); // Return buffer for the SVG
            }
            // Fallback to default fetch behavior for other URLs
            return super.fetch(url, options);
        }
    }
    return new CustomResourceLoader()
}