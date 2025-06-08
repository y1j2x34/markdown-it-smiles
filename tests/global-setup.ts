// Global test setup that runs once before all tests
export default async function globalSetup() {
    // Set up any global test configuration
    console.log('🧪 Setting up tests for markdown-it-smiles...');

    // Ensure we have a clean environment
    delete process.env.IS_BROWSER;

    // Set test environment variables
    process.env.NODE_ENV = 'test';

    console.log('✅ Global test setup complete');
} 