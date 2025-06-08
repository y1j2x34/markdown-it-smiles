// Browser-specific test setup
import { JSDOM } from 'jsdom';

// Setup DOM environment for browser tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
});

// Set global browser APIs
global.window = dom.window as any;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.SVGElement = dom.window.SVGElement;

// Mock browser-specific APIs
global.Image = function () {
    return dom.window.document.createElement('img');
} as any;

// Mock CSS and styling APIs
global.getComputedStyle = dom.window.getComputedStyle;

// Set browser environment flag
process.env.IS_BROWSER = 'true';

// Mock browser-specific dependencies that might not be available
jest.mock('fs', () => ({
    readFileSync: jest.fn(() => '/* mock browser script */'),
    existsSync: jest.fn(() => false)
}));

// Mock Node.js specific modules for browser environment
jest.mock('jsdom', () => ({
    JSDOM: jest.fn().mockImplementation((html: string) => ({
        window: {
            document: {
                createElement: jest.fn().mockReturnValue({
                    setAttribute: jest.fn(),
                    outerHTML: '<div></div>'
                }),
                querySelector: jest.fn().mockReturnValue({
                    setAttribute: jest.fn(),
                    outerHTML: '<div></div>'
                })
            },
            HTMLImageElement: class { },
            SVGElement: class { }
        }
    }))
}));

jest.mock('sharp', () => {
    throw new Error('Sharp not available in browser environment');
});

jest.mock('deasync', () => {
    throw new Error('Deasync not available in browser environment');
});

// Clean up after tests
afterAll(() => {
    // Note: jsdom window doesn't have a close method
    // Just clean up environment variable
    delete process.env.IS_BROWSER;
});

export { }; 