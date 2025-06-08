// Global test teardown that runs once after all tests
export default async function globalTeardown() {
    // Clean up any global test resources
    console.log('🧹 Cleaning up after tests...');

    // Restore environment variables
    delete process.env.NODE_ENV;
    delete process.env.IS_BROWSER;

    console.log('✅ Global test teardown complete');
} 