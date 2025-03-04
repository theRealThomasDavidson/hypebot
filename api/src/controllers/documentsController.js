/**
 * Documents Controller
 * 
 * Handles API requests for document operations with Pinecone
 */

const { storeDocument, semanticSearch } = require('../semantic_search');
const { deleteVectors, deleteVectorsByFilter } = require('../pinecone_operations');

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
    
    const result = await storeDocument({
      text,
      userId,
      metadata
    });
    
    res.status(201).json({
      success: true,
      documentId: result.id,
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
    const { query, limit = 5, threshold = 0.7, userId } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Prepare filter if userId is provided
    const filter = userId ? { userId } : {};
    
    const results = await semanticSearch({
      query,
      limit: parseInt(limit, 10),
      threshold: parseFloat(threshold),
      filter
    });
    
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
    
    await deleteVectors([id]);
    
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
    
    await deleteVectorsByFilter({ userId });
    
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
  deleteUserDocuments
}; 