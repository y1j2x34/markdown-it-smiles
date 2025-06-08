// Global test setup for all environments

// Mock console methods to avoid noise in test output
(global as any).console = {
    ...console,
    // Uncomment below to suppress console.log during tests
    // log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
};

// Mock timers for performance tests
jest.useFakeTimers();

// Test utilities
const testUtils = {
    // Helper to create a mock MarkdownIt token
    createMockToken: (type: string, content: string, info?: string) => ({
        type,
        content,
        info: info || '',
        tag: '',
        attrGet: jest.fn(),
        attrSet: jest.fn(),
        attrPush: jest.fn(),
        attrJoin: jest.fn(),
        markup: '',
        block: true,
        hidden: false,
        children: null,
        level: 0,
        map: null,
        meta: null,
        nesting: 0
    }),

    // Helper to check if HTML contains valid SMILES attributes
    hasValidSmilesAttributes: (html: string) => {
        const hasDataSmiles = html.includes('data-smiles=');
        const hasClass = html.includes('class="smiles-');
        return hasDataSmiles && hasClass;
    },

    // Helper to extract SMILES from rendered HTML
    extractSmilesFromHtml: (html: string) => {
        const matches = html.match(/data-smiles='([^']+)'/g);
        return matches?.map(match => match.match(/data-smiles='([^']+)'/)?.[1]) || [];
    }
};

// Add test utilities to global scope
(global as any).testUtils = testUtils;

// Setup environment detection
if (typeof process !== 'undefined' && process.env) {
    // Ensure we have a clean environment for each test
    delete process.env.IS_BROWSER;
}

// Mock performance API for Node.js environment
if (typeof performance === 'undefined') {
    (global as any).performance = {
        now: jest.fn(() => Date.now())
    };
}

export { }; 