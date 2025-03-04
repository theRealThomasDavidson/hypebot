/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log(supabaseUrl);
console.log(supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Stores a document
 * @param {string} text - The text content
 * @param {string} personId - The person ID associated with the document
 * @returns {Promise<number|null>} The ID of the stored document or null on error
 */
async function storeDocument(text, personId) {
    try {
        const { data, error } = await supabase
            .from('documents')
            .insert([
                { text, person_id: personId }
            ])
            .select('id')
            .single();

        if (error) {
            console.error('Error storing document:', error);
            return null;
        }

        return data.id;
    } catch (error) {
        console.error('Error storing document:', error);
        return null;
    }
}

/**
 * Deletes a document by ID
 * @param {number} id - The document ID
 * @returns {Promise<boolean>} True if deletion was successful
 */
async function deleteDocument(id) {
    try {
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting document:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting document:', error);
        return false;
    }
}

/**
 * Deletes all documents for a person
 * @param {string} personId - The person ID
 * @returns {Promise<number>} Number of deleted documents
 */
async function deletePersonDocuments(personId) {
    try {
        const { data, error } = await supabase
            .from('documents')
            .delete()
            .eq('person_id', personId)
            .select('id');

        if (error) {
            console.error('Error deleting person documents:', error);
            return 0;
        }

        return data.length;
    } catch (error) {
        console.error('Error deleting person documents:', error);
        return 0;
    }
}

module.exports = {
    supabase,
    storeDocument,
    deleteDocument,
    deletePersonDocuments
}; 