/**
 * Pinecone Vector Database Integration
 * 
 * This module handles vector operations using Pinecone.
 * Implementation follows the official Pinecone documentation.
 * Includes client initialization and index management.
 */

require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

// Global client and index references
let pineconeClient = null;
let pineconeIndex = null;

/**
 * Connect to Pinecone and initialize the index
 * This function handles the entire connection process in one step
 * @returns {Promise<Object>} Object containing the client and index
 */
async function connectPinecone() {
  console.log('Connecting to Pinecone...');
  
  // Get config from environment variables
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || 'semantic-search';
  const indexHost = process.env.PINECONE_URL || 'semantic-search-qv3okx6.svc.aped-4627-b74a.pinecone.io';
  
  if (!apiKey) {
    throw new Error('Missing PINECONE_API_KEY in environment variables');
  }
  
  // Initialize the Pinecone client with just the API key
  console.log('Initializing Pinecone client...');
  pineconeClient = new Pinecone({ apiKey });
  
  try {
    // Connect directly to the index with both name and host
    console.log(`Connecting to index '${indexName}' at host '${indexHost}'...`);
    
    // Note: According to the updated SDK, we need to specify both name and host
    console.log(`Connecting to index '${indexName}' at host '${indexHost}'...`);
    pineconeIndex = pineconeClient.index(indexName, indexHost);
    
    // Verify connection with a simple operation
    console.log('Verifying connection...');
    const stats = await pineconeIndex.describeIndexStats();
    console.log('Connected to index. Current stats:', stats);
    
    // Make the index globally available
    global.pineconeIndex = pineconeIndex;
    
    console.log('✅ Pinecone connection complete');
    
    return {
      client: pineconeClient,
      index: pineconeIndex
    };
  } catch (error) {
    console.error('Error setting up Pinecone:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

/**
 * Get a specific Pinecone index
 * @param {string} indexName - The name of the index (defaults to PINECONE_INDEX environment variable)
 * @param {string} indexHost - The host of the index (defaults to PINECONE_URL environment variable)
 * @returns {Object} The Pinecone index
 */
function getIndex(indexName = process.env.PINECONE_INDEX, indexHost = process.env.PINECONE_URL) {
  if (!indexName) {
    throw new Error('Index name is required (either pass as parameter or set PINECONE_INDEX env variable)');
  }
  
  if (!indexHost) {
    throw new Error('Index host is required (either pass as parameter or set PINECONE_URL env variable)');
  }

  const pc = getPineconeClient();
  return pc.index(indexName, indexHost);
}

/**
 * List all available indexes
 * @returns {Promise<Array>} Array of index information
 */
async function listIndexes() {
  const pc = getPineconeClient();
  return pc.listIndexes();
}

/**
 * Set up Pinecone client and connect to index
 */
async function setupPinecone() {
  console.log('Setting up Pinecone...');
  
  try {
    // Get config from environment variables
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX || 'semantic-search';
    const indexHost = process.env.PINECONE_URL || 'semantic-search-qv3okx6.svc.aped-4627-b74a.pinecone.io';
    
    if (!apiKey) {
      throw new Error('Missing PINECONE_API_KEY in environment variables');
    }
    
    // Initialize the Pinecone client with just the API key
    console.log('Initializing Pinecone client...');
    pineconeClient = new Pinecone({ apiKey });
    
    // Connect directly to the index with both name and host
    console.log(`Connecting to index '${indexName}' at host '${indexHost}'...`);
    pineconeIndex = pineconeClient.index(indexName, indexHost);
    
    // Verify connection with a simple operation
    console.log('Verifying connection...');
    const stats = await pineconeIndex.describeIndexStats();
    console.log('Connected to index. Current stats:', stats);
    
    // Make the index globally available
    global.pineconeIndex = pineconeIndex;
    
    console.log('✅ Pinecone setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up Pinecone:', error);
    console.error('Error details:', error.message);
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
      if (filter) {
        // Handle userId filter
        if (filter.userId && filter.userId.$eq) {
          const userId = filter.userId.$eq;
          filteredVectors = vectors.filter(v => 
            v.metadata && v.metadata.userId === userId);
        }
        // Backward compatibility for profile_id filter
        else if (filter.profile_id && filter.profile_id.$eq) {
          const profileId = filter.profile_id.$eq;
          filteredVectors = vectors.filter(v => 
            v.metadata && v.metadata.profile_id === profileId);
        }
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
      // Handle userId filter
      if (filter && filter.userId && filter.userId.$eq) {
        const userId = filter.userId.$eq;
        const initialLength = vectors.length;
        const newVectors = vectors.filter(v => 
          !v.metadata || v.metadata.userId !== userId);
        const deletedCount = initialLength - newVectors.length;
        vectors.length = 0;
        vectors.push(...newVectors);
        console.log(`[MOCK] Deleted ${deletedCount} vectors for user ${userId}`);
        return { deletedCount };
      }
      // Backward compatibility for profile_id filter
      else if (filter && filter.profile_id && filter.profile_id.$eq) {
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
 * @param {string} userId - User ID associated with document (renamed from profileId)
 * @param {Array<number>} embedding - Vector embedding
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<string>} - ID of stored document
 */
async function storeDocumentWithEmbedding(text, userId, embedding, additionalMetadata = {}) {
  try {
    console.log(`Storing document for user ${userId} in Pinecone...`);
    
    if (!global.pineconeIndex) {
      throw new Error('Pinecone index not initialized');
    }
    
    // Generate a unique ID
    const id = `${userId}_${Date.now()}`;
    
    // Prepare metadata
    const metadata = {
      text,
      userId, // Changed from profile_id to userId
      created_at: new Date().toISOString(),
      ...additionalMetadata // Allow additional metadata
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
 * @param {Object} filter - Optional filter object (e.g., {userId: "123"})
 * @returns {Promise<Array>} - Similar documents
 */
async function searchSimilarDocuments(queryEmbedding, limit = 5, threshold = 0.05, filter = {}) {
  try {
    console.log(`Searching for similar documents in Pinecone (limit: ${limit}, threshold: ${threshold})...`);
    
    // Convert our filter format to Pinecone filter format
    const pineconeFilter = {};
    if (filter.userId) {
      pineconeFilter.userId = { $eq: filter.userId };
    }
    
    // Query Pinecone following documentation
    const results = await global.pineconeIndex.query({
      vector: queryEmbedding,
      topK: limit * 2, // Get more results than needed to filter by threshold
      includeMetadata: true,
      filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined
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
        userId: match.metadata.userId,
        text: match.metadata.text,
        type: match.metadata.type,
        score: match.score,
        metadata: match.metadata
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
 * Delete all documents for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - Number of deleted documents
 */
async function deleteUserDocuments(userId) {
  try {
    console.log(`Deleting all documents for user ${userId} from Pinecone...`);
    
    // Delete by filter following documentation
    const response = await global.pineconeIndex.deleteMany({
      filter: { userId: { $eq: userId } }
    });
    
    const count = response.deletedCount || 0;
    console.log(`Deleted ${count} documents for user ${userId} from Pinecone`);
    return count;
  } catch (error) {
    console.error(`Error deleting documents for user ${userId} from Pinecone:`, error);
    return 0;
  }
}

/**
 * Create a new Pinecone index
 * @param {Object} options - Index creation options
 * @param {string} options.name - The name of the index
 * @param {number} options.dimension - The dimension of vectors to be stored (e.g., 1536 for OpenAI embeddings)
 * @param {string} options.metric - The distance metric to use (e.g., 'cosine', 'euclidean', 'dotproduct')
 * @param {string} [options.serverless] - Serverless cloud configuration (e.g., { cloud: 'aws', region: 'us-west-2' })
 * @returns {Promise<Object>} - Creation response
 */
async function createIndex({
  name,
  dimension,
  metric = 'cosine',
  serverless
}) {
  if (!name) throw new Error('Index name is required');
  if (!dimension) throw new Error('Vector dimension is required');
  
  console.log(`Creating Pinecone index: ${name} with dimension ${dimension} and metric ${metric}`);
  
  const pinecone = getPineconeClient();
  
  const createRequest = {
    name,
    dimension,
    metric
  };
  
  // Add serverless config if provided
  if (serverless) {
    createRequest.serverless = serverless;
  }
  
  try {
    await pinecone.createIndex(createRequest);
    console.log(`Index ${name} created successfully`);
    return { success: true, message: `Index ${name} created successfully` };
  } catch (error) {
    console.error(`Error creating index ${name}:`, error);
    throw error;
  }
}

/**
 * Get index information
 * @param {string} indexName - The name of the index
 * @returns {Promise<Object>} Index information
 */
async function describeIndex(indexName) {
  if (!indexName) throw new Error('Index name is required');
  
  const pinecone = getPineconeClient();
  try {
    const indexDescription = await pinecone.describeIndex(indexName);
    return indexDescription;
  } catch (error) {
    console.error(`Error describing index ${indexName}:`, error);
    throw error;
  }
}

/**
 * Delete an index
 * @param {string} indexName - The name of the index to delete
 * @returns {Promise<Object>} Deletion response
 */
async function deleteIndex(indexName) {
  if (!indexName) throw new Error('Index name is required');
  
  const pinecone = getPineconeClient();
  try {
    await pinecone.deleteIndex(indexName);
    console.log(`Index ${indexName} deleted successfully`);
    return { success: true, message: `Index ${indexName} deleted successfully` };
  } catch (error) {
    console.error(`Error deleting index ${indexName}:`, error);
    throw error;
  }
}

/**
 * Initialize the Pinecone client
 * @returns {Pinecone} The Pinecone client instance
 */
function getPineconeClient() {
  if (pineconeClient) {
    return pineconeClient;
  }

  const apiKey = process.env.PINECONE_API_KEY;
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is required in environment variables');
  }

  console.log('Initializing Pinecone client...');
  
  // Initialize the client with the API key
  pineconeClient = new Pinecone({ apiKey });

  return pineconeClient;
}

module.exports = {
  connectPinecone,
  getPineconeClient,
  storeDocumentWithEmbedding,
  searchSimilarDocuments,
  deleteDocument,
  deleteUserDocuments,
  getIndex,
  listIndexes,
  createIndex,
  describeIndex,
  deleteIndex,
  setupMockPinecone
}; 