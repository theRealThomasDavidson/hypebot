/**
 * Pinecone Vector Database Integration
 * 
 * This module handles vector operations using Pinecone.
 * Implementation follows the official Pinecone documentation.
 */

require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

// Global client and index references
let pineconeClient = null;
let pineconeIndex = null;

/**
 * Set up Pinecone client and connect to index
 */
async function setupPinecone() {
  console.log('Setting up Pinecone...');
  
  try {
    // Get config from environment variables
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX || 'semantic-search';
    
    if (!apiKey) {
      throw new Error('Missing PINECONE_API_KEY in environment variables');
    }
    
    // Initialize the Pinecone client
    console.log('Initializing Pinecone client...');
    
    pineconeClient = new Pinecone({
      apiKey
    });
    
    // Connect to the index
    console.log(`Connecting to index: ${indexName}`);
    pineconeIndex = pineconeClient.index(indexName);
    
    // Verify index connection by checking stats
    try {
      const stats = await pineconeIndex.describeIndexStats();
      console.log(`Successfully connected to index '${indexName}'`);
      console.log(`Index stats: ${stats.dimension} dimensions, ${stats.totalVectorCount || 0} vectors`);
      return true;
    } catch (error) {
      console.error(`Error connecting to index '${indexName}':`, error);
      throw new Error(`Cannot connect to index: ${error.message}`);
    }
  } catch (error) {
    console.error('Pinecone setup failed:', error);
    throw error;
  }
}

// Mock implementation for development when Pinecone isn't available
function setupMockPinecone() {
  // In-memory storage
  const vectors = [];
  
  // Create a mock index with the same interface
  const mockIndex = {
    describeIndexStats: async () => ({
      namespaces: {},
      dimensions: 1536,
      totalVectorCount: vectors.length
    }),
    
    upsert: async (records) => {
      for (const record of records) {
        // Remove any existing records with the same ID
        const existingIndex = vectors.findIndex(v => v.id === record.id);
        if (existingIndex >= 0) {
          vectors.splice(existingIndex, 1);
        }
        vectors.push(record);
      }
      console.log(`[MOCK] Upserted ${records.length} vectors`);
      return { upsertedCount: records.length };
    },
    
    query: async ({ vector, topK, includeMetadata, filter }) => {
      console.log(`[MOCK] Querying for top ${topK} vectors`);
      
      // Simple cosine similarity
      function cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
          dotProduct += a[i] * b[i];
          normA += a[i] * a[i];
          normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      }
      
      // Apply filter if provided
      let filteredVectors = vectors;
      if (filter && filter.profile_id && filter.profile_id.$eq) {
        const profileId = filter.profile_id.$eq;
        filteredVectors = vectors.filter(v => 
          v.metadata && v.metadata.profile_id === profileId);
      }
      
      // Calculate similarities
      const matches = filteredVectors.map(v => ({
        id: v.id,
        score: cosineSimilarity(vector, v.values),
        metadata: includeMetadata ? v.metadata : undefined
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
      
      return { matches };
    },
    
    deleteOne: async (id) => {
      const initialLength = vectors.length;
      const index = vectors.findIndex(v => v.id === id);
      if (index >= 0) {
        vectors.splice(index, 1);
        console.log(`[MOCK] Deleted vector with ID ${id}`);
        return true;
      }
      return initialLength !== vectors.length;
    },
    
    deleteMany: async ({ filter }) => {
      if (filter && filter.profile_id && filter.profile_id.$eq) {
        const profileId = filter.profile_id.$eq;
        const initialLength = vectors.length;
        const newVectors = vectors.filter(v => 
          !v.metadata || v.metadata.profile_id !== profileId);
        const deletedCount = initialLength - newVectors.length;
        vectors.length = 0;
        vectors.push(...newVectors);
        console.log(`[MOCK] Deleted ${deletedCount} vectors for profile ${profileId}`);
        return { deletedCount };
      }
      return { deletedCount: 0 };
    }
  };
  
  // Set the global pineconeIndex to our mock implementation
  global.pineconeIndex = mockIndex;
  console.log('✅ Mock Pinecone setup complete');
}

/**
 * Store a document with its vector embedding
 * @param {string} text - Document text
 * @param {string} profileId - Profile ID associated with document
 * @param {Array<number>} embedding - Vector embedding
 * @returns {Promise<string>} - ID of stored document
 */
async function storeDocumentWithEmbedding(text, profileId, embedding) {
  try {
    console.log(`Storing document for profile ${profileId} in Pinecone...`);
    
    if (!global.pineconeIndex) {
      throw new Error('Pinecone index not initialized');
    }
    
    // Generate a unique ID
    const id = `${profileId}_${Date.now()}`;
    
    // Prepare metadata
    const metadata = {
      text,
      profile_id: profileId,
      created_at: new Date().toISOString()
    };
    
    // Upsert the vector following documentation
    await global.pineconeIndex.upsert([{
      id,
      values: embedding,
      metadata
    }]);
    
    console.log(`Document stored in Pinecone with ID: ${id}`);
    return id;
  } catch (error) {
    console.error('Error storing document in Pinecone:', error);
    throw error;
  }
}

/**
 * Search for similar documents
 * @param {Array<number>} queryEmbedding - Query vector embedding
 * @param {number} limit - Maximum number of results
 * @param {number} threshold - Minimum similarity score threshold
 * @returns {Promise<Array>} - Similar documents
 */
async function searchSimilarDocuments(queryEmbedding, limit = 5, threshold = 0.3) {
  try {
    console.log(`Searching for similar documents in Pinecone (limit: ${limit}, threshold: ${threshold})...`);
    
    // Query Pinecone following documentation
    const results = await global.pineconeIndex.query({
      vector: queryEmbedding,
      topK: limit * 2, // Get more results than needed to filter by threshold
      includeMetadata: true
    });
    
    if (!results || !results.matches) {
      console.log('No matches found in Pinecone');
      return [];
    }
    
    // Filter by threshold and format results
    const filteredResults = results.matches
      .filter(match => match.score >= threshold)
      .map(match => ({
        id: match.id,
        text: match.metadata.text,
        profile_id: match.metadata.profile_id,
        similarity: match.score,
        created_at: match.metadata.created_at
      }))
      .slice(0, limit);
    
    console.log(`Found ${filteredResults.length} documents above threshold ${threshold}`);
    return filteredResults;
  } catch (error) {
    console.error('Error searching documents in Pinecone:', error);
    return [];
  }
}

/**
 * Delete a document by ID
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} - True if document was deleted
 */
async function deleteDocument(id) {
  try {
    console.log(`Deleting document ${id} from Pinecone...`);
    
    await global.pineconeIndex.deleteOne(id);
    
    console.log(`Document ${id} deleted from Pinecone`);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${id} from Pinecone:`, error);
    return false;
  }
}

/**
 * Delete all documents for a profile
 * @param {string} profileId - Profile ID
 * @returns {Promise<number>} - Number of deleted documents
 */
async function deletePersonDocuments(profileId) {
  try {
    console.log(`Deleting all documents for profile ${profileId} from Pinecone...`);
    
    // Delete by filter following documentation
    const response = await global.pineconeIndex.deleteMany({
      filter: { profile_id: { $eq: profileId } }
    });
    
    const count = response.deletedCount || 0;
    console.log(`Deleted ${count} documents for profile ${profileId} from Pinecone`);
    return count;
  } catch (error) {
    console.error(`Error deleting documents for profile ${profileId} from Pinecone:`, error);
    return 0;
  }
}

module.exports = {
  setupPinecone,
  storeDocumentWithEmbedding,
  searchSimilarDocuments,
  deleteDocument,
  deletePersonDocuments
}; 