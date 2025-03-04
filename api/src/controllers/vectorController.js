const { OpenAI } = require('openai');
const pinecone = require('../lib/pinecone');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate embedding for text using OpenAI
 * @param {string} text - The text to generate embedding for
 * @returns {Promise<Array<number>>} - The embedding vector
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
            encoding_format: "float"
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Create a vector from text
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function createVector(req, res) {
    const { text, profileId } = req.body;

    if (!text || !profileId) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: text and profileId are required'
        });
    }

    try {
        // Generate embedding for the text
        const embedding = await generateEmbedding(text);
        
        // Store document with embedding in Pinecone
        const id = await pinecone.storeDocumentWithEmbedding(text, profileId, embedding);
        
        res.status(201).json({
            success: true,
            data: {
                id,
                text,
                profileId
            },
            message: 'Vector created successfully'
        });
    } catch (error) {
        console.error('Error creating vector:', error);
        res.status(500).json({
            success: false,
            error: `Failed to create vector: ${error.message}`
        });
    }
}

/**
 * Search for similar vectors
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function searchVectors(req, res) {
    const { query, limit = 5, threshold = 0.3, debug = false } = req.query;
    
    if (!query) {
        return res.status(400).json({
            success: false,
            error: 'Query parameter is required'
        });
    }
    
    const limitNum = parseInt(limit, 10) || 5;
    const thresholdNum = parseFloat(threshold) || 0.3;
    const showDebug = debug === 'true';
    
    try {
        // Generate embedding for query text
        const embedding = await generateEmbedding(query);
        
        // Search for similar documents
        const results = await pinecone.searchSimilarDocuments(embedding, limitNum, thresholdNum);
        
        // Prepare response
        const response = {
            success: true,
            data: results
        };
        
        // Add debug info if requested
        if (showDebug) {
            response.debug = {
                threshold: thresholdNum,
                model: "text-embedding-3-small",
                dimensions: embedding.length,
                query_text: query
            };
        }
        
        res.json(response);
    } catch (error) {
        console.error('Error searching vectors:', error);
        res.status(500).json({
            success: false,
            error: `Failed to search vectors: ${error.message}`
        });
    }
}

/**
 * Delete a vector by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function deleteVector(req, res) {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Vector ID is required'
        });
    }
    
    try {
        const success = await pinecone.deleteDocument(id);
        
        if (success) {
            res.json({
                success: true,
                data: { id },
                message: 'Vector deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: `Vector with ID ${id} not found`
            });
        }
    } catch (error) {
        console.error('Error deleting vector:', error);
        res.status(500).json({
            success: false,
            error: `Failed to delete vector: ${error.message}`
        });
    }
}

/**
 * Delete all vectors for a profile
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function deleteProfileVectors(req, res) {
    const { profileId } = req.params;
    
    if (!profileId) {
        return res.status(400).json({
            success: false,
            error: 'Profile ID is required'
        });
    }
    
    try {
        const count = await pinecone.deletePersonDocuments(profileId);
        
        res.json({
            success: true,
            data: { 
                profileId,
                deletedCount: count
            },
            message: `Deleted ${count} vectors for profile ${profileId}`
        });
    } catch (error) {
        console.error('Error deleting profile vectors:', error);
        res.status(500).json({
            success: false,
            error: `Failed to delete profile vectors: ${error.message}`
        });
    }
}

/**
 * Get vector format metadata
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getVectorFormat(req, res) {
    try {
        // Get index stats from Pinecone
        const stats = await global.pineconeIndex.describeIndexStats();
        
        // Prepare response
        const formatInfo = {
            count: stats.totalVectorCount || 0,
            format: 'pinecone',
            has_strings: false,
            has_arrays: true,
            has_invalid: false,
            dimensions: 1536  // OpenAI's text-embedding-3-small dimension
        };
        
        res.json({
            success: true,
            data: formatInfo
        });
    } catch (error) {
        console.error('Error getting vector format:', error);
        
        // In case of error, return minimal information
        res.json({
            success: true,
            data: {
                count: 0,
                format: 'pinecone',
                has_strings: false,
                has_arrays: false,
                has_invalid: false,
                dimensions: 1536
            }
        });
    }
}

module.exports = {
    createVector,
    searchVectors,
    deleteVector,
    deleteProfileVectors,
    getVectorFormat,
    healthCheck
}; 