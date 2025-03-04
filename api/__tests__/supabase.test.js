/**
 * Tests for the supabase.js module
 */

// Import the module to test
const supabaseModule = require('../src/lib/supabase');

// Mock the @supabase/supabase-js module
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => {
            return Promise.resolve(callback({
                data: [{ id: 1 }],
                error: null
            }));
        })
    }))
}));

describe('Supabase Module', () => {
    // Save the original console.error
    const originalConsoleError = console.error;

    beforeEach(() => {
        // Mock console.error to prevent test output pollution
        console.error = jest.fn();
    });

    afterEach(() => {
        // Restore console.error
        console.error = originalConsoleError;
        jest.clearAllMocks();
    });

    describe('storeDocument', () => {
        it('should store a document and return its ID', async () => {
            // Mock a successful response
            const mockData = { id: 123 };
            jest.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockData,
                            error: null
                        })
                    })
                })
            });

            const result = await supabaseModule.storeDocument('Test document', 'user123');

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(result).toBe(123);
        });

        it('should return null if there is an error during insert', async () => {
            // Mock an error response
            jest.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Database error')
                        })
                    })
                })
            });

            const result = await supabaseModule.storeDocument('Test document', 'user123');

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(console.error).toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should return null if an exception is thrown', async () => {
            // Mock a thrown exception
            jest.spyOn(supabaseModule.supabase, 'from').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            const result = await supabaseModule.storeDocument('Test document', 'user123');

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(console.error).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('deleteDocument', () => {
        it('should delete a document and return true on success', async () => {
            // Mock a successful response
            jest.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [{ id: 1 }],
                        error: null
                    })
                })
            });

            const result = await supabaseModule.deleteDocument(1);

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(result).toBe(true);
        });

        it('should return false if there is an error during delete', async () => {
            // Mock an error response
            jest.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: new Error('Database error')
                    })
                })
            });

            const result = await supabaseModule.deleteDocument(1);

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(console.error).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('should return false if an exception is thrown', async () => {
            // Mock a thrown exception
            jest.spyOn(supabaseModule.supabase, 'from').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            const result = await supabaseModule.deleteDocument(1);

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(console.error).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('deletePersonDocuments', () => {
        it('should delete all documents for a person and return the count', async () => {
            // Mock a successful response with multiple documents
            jest.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockResolvedValue({
                            data: [{ id: 1 }, { id: 2 }, { id: 3 }],
                            error: null
                        })
                    })
                })
            });

            const result = await supabaseModule.deletePersonDocuments('user123');

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(result).toBe(3);
        });

        it('should return 0 if there is an error during delete', async () => {
            // Mock an error response
            jest.spyOn(supabaseModule.supabase, 'from').mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Database error')
                        })
                    })
                })
            });

            const result = await supabaseModule.deletePersonDocuments('user123');

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(console.error).toHaveBeenCalled();
            expect(result).toBe(0);
        });

        it('should return 0 if an exception is thrown', async () => {
            // Mock a thrown exception
            jest.spyOn(supabaseModule.supabase, 'from').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            const result = await supabaseModule.deletePersonDocuments('user123');

            expect(supabaseModule.supabase.from).toHaveBeenCalledWith('documents');
            expect(console.error).toHaveBeenCalled();
            expect(result).toBe(0);
        });
    });
}); 