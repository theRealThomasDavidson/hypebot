/**
 * Tests for the supabase client initialization
 */

// Mock dotenv.config
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

// Mock createClient
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => 'mocked-supabase-client')
}));

describe('Supabase Client Initialization', () => {
    let consoleErrorSpy;
    let processExitSpy;
    let originalProcessExit;

    beforeEach(() => {
        // Save original process.exit and mock it
        originalProcessExit = process.exit;
        process.exit = jest.fn();

        // Spy on console.error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Reset environment variables
        process.env.SUPABASE_URL = 'https://test-url.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

        // Clear module cache to force reinitialization
        jest.resetModules();
    });

    afterEach(() => {
        // Restore original functions
        process.exit = originalProcessExit;
        consoleErrorSpy.mockRestore();

        // Clear mocks
        jest.clearAllMocks();
    });

    it('should initialize supabase client with valid credentials', () => {
        // Import the module
        const { createClient } = require('@supabase/supabase-js');
        const supabaseModule = require('../src/lib/supabase');

        // Verify the client was created with correct params
        expect(createClient).toHaveBeenCalledWith(
            'https://test-url.supabase.co',
            'test-key'
        );

        // Ensure no errors were logged and process didn't exit
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
    });

    it('should exit if SUPABASE_URL is missing', () => {
        // Delete the URL env var
        delete process.env.SUPABASE_URL;

        // Import the module (should trigger error)
        require('../src/lib/supabase');

        // Verify appropriate error handling
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Missing Supabase credentials. Please check your .env file.'
        );
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should exit if SUPABASE_SERVICE_ROLE_KEY is missing', () => {
        // Delete the key env var
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Import the module (should trigger error)
        require('../src/lib/supabase');

        // Verify appropriate error handling
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Missing Supabase credentials. Please check your .env file.'
        );
        expect(process.exit).toHaveBeenCalledWith(1);
    });
}); 