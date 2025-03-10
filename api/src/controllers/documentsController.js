/**
 * Documents Controller
 * 
 * Handles API requests for document operations with Pinecone
 */

const pineconeModule = require('../lib/pinecone');
const { OpenAI } = require('openai');

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate embedding from text using OpenAI
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array<number>>} Embedding vector
 */
async function generateEmbedding(text) {
  if (!text) {
    throw new Error('Text is required');
  }

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
 * Store a document with its embedding
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createDocument = async (req, res) => {
  try {
    const { text, userId, metadata = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Document text is required' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Generate embedding
    console.log(`Generating embedding for: "${text.substring(0, 30)}..."`);
    const embedding = await generateEmbedding(text);
    
    // Store the vector in Pinecone
    const id = await pineconeModule.storeDocumentWithEmbedding(text, userId, embedding, metadata);
    
    res.status(201).json({
      success: true,
      documentId: id,
      message: 'Document stored successfully'
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ 
      error: 'Error storing document', 
      message: error.message 
    });
  }
};

/**
 * Search for documents semantically
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const searchDocuments = async (req, res) => {
  try {
    const { query, limit = 5, threshold = 0.2, userId } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Set up filter if userId is provided
    const filter = userId ? { userId } : {};
    
    // Search for similar documents
    const results = await pineconeModule.searchSimilarDocuments(
      queryEmbedding, 
      parseInt(limit, 10), 
      parseFloat(threshold),
      filter
    );
    
    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ 
      error: 'Error searching documents', 
      message: error.message 
    });
  }
};

/**
 * Delete a document by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }
    
    await pineconeModule.deleteDocument(id);
    
    res.json({
      success: true,
      message: `Document ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      error: 'Error deleting document', 
      message: error.message 
    });
  }
};

/**
 * Delete all documents for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await pineconeModule.deleteUserDocuments(userId);
    
    res.json({
      success: true,
      message: `All documents for user ${userId} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user documents:', error);
    res.status(500).json({ 
      error: 'Error deleting user documents', 
      message: error.message 
    });
  }
};

module.exports = {
  createDocument,
  searchDocuments,
  deleteDocument,
  deleteUserDocuments,
  generateEmbedding
}; 