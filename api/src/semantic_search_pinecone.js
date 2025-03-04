/**
 * Semantic Search API with Pinecone Integration
 *
 * This module provides vector-based semantic search using OpenAI embeddings
 * and Pinecone vector database.
 */

const { OpenAI } = require('openai');
const pineconeModule = require('./pinecone');
const { v5: uuidv5 } = require('uuid');
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize the OpenAI client for generating embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// UUID namespace for generating deterministic UUIDs from strings
const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

// Function to set up Pinecone
async function setupDatabase() {
  try {
    console.log('Setting up Pinecone...');
    // We'll delegate the actual Pinecone setup to the pinecone module
    const isPineconeReady = await pineconeModule.setupPinecone();
    
    if (!isPineconeReady) {
      console.error('Error: Pinecone setup failed');
      console.log('Please ensure your Pinecone index is correctly configured');
      return false;
    }
    
    console.log('Pinecone setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up Pinecone:', error);
    return false;
  }
}

// Initialize Pinecone on module load
setupDatabase().catch(console.error);

// Function to generate embeddings using OpenAI
async function generateEmbedding(text) {
  try {
    console.log(`Calling OpenAI API to generate embedding for: "${text.substring(0, 30)}..."`);
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      console.error('Invalid response from OpenAI API:', JSON.stringify(response));
      throw new Error('Invalid response from OpenAI API');
    }
    
    console.log(`Successfully received embedding of length ${response.data[0].embedding.length}`);
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding with OpenAI:', error);
    if (error.response) {
      console.error('OpenAI API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
}

/**
 * Creates a vector embedding for a document and stores it in Pinecone
 * @param {string} text - The text content to vectorize
 * @param {string} personId - The ID of the person associated with this text
 * @returns {Promise<string>} - The ID of the created document
 */
async function createVector(text, personId) {
  try {
    console.log(`Generating embedding for text: "${text.substring(0, 50)}..."`);
    const embedding = await generateEmbedding(text);
    console.log(`Successfully generated embedding of length ${embedding.length}`);
    
    // Convert the personId to a proper UUID if it's not already one
    let profileId = personId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(profileId)) {
      // Generate a deterministic UUID from the personId string
      profileId = uuidv5(personId, UUID_NAMESPACE);
      console.log(`Converted profile ID "${personId}" to UUID "${profileId}"`);
    }
    
    // Store document with embedding in Pinecone
    const id = await pineconeModule.storeDocumentWithEmbedding(text, profileId, embedding);
    
    console.log(`Vector created with ID ${id}`);
    return id;
  } catch (error) {
    console.error('Error creating vector:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

/**
 * Query Pinecone for documents similar to the given query text
 */
async function queryVector(req, res) {
  const { query, limit = 5 } = req.query;
  const showDebug = req.query.debug === 'true';
  const threshold = parseFloat(req.query.threshold) || 0.3;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    console.log(`Generating embedding for query: "${query}"`);
    const embedding = await generateEmbedding(query);
    
    if (!embedding) {
      return res.status(500).json({ error: 'Failed to generate embedding for query' });
    }
    
    console.log(`Searching for similar documents with threshold ${threshold}...`);
    const results = await pineconeModule.searchSimilarDocuments(embedding, parseInt(limit), threshold);
    
    console.log(`Found ${results.length} results`);
    
    // Add debug information if requested
    const response = { data: results };
    if (showDebug) {
      response.debug = {
        threshold,
        model: "text-embedding-3-small",
        dimensions: embedding.length,
        query_embedding_sample: embedding.slice(0, 5)
      };
    }
    
    return res.json(response);
  } catch (error) {
    console.error('Error in queryVector:', error);
    return res.status(500).json({ error: 'Failed to query vector database' });
  }
}

/**
 * Deletes a vector from Pinecone by ID
 */
async function deleteVector(req, res) {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  try {
    const deleted = await pineconeModule.deleteDocument(id);
    
    if (!deleted) {
      return res.status(404).json({ error: `Vector with ID ${id} not found` });
    }
    
    return res.json({
      success: true,
      data: { id },
      message: 'Vector deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteVector:', error);
    return res.status(500).json({ error: 'Failed to delete vector' });
  }
}

/**
 * Deletes all vectors for a specific profile
 */
async function deletePersonVectors(req, res) {
  const { profileId } = req.params;
  
  if (!profileId) {
    return res.status(400).json({ error: 'Profile ID parameter is required' });
  }

  try {
    const count = await pineconeModule.deletePersonDocuments(profileId);
    
    return res.json({
      success: true,
      data: { profileId, count },
      message: `${count} vectors deleted for profile ${profileId}`
    });
  } catch (error) {
    console.error('Error in deletePersonVectors:', error);
    return res.status(500).json({ error: 'Failed to delete profile vectors' });
  }
}

/**
 * Health check endpoint
 */
async function healthCheck(req, res) {
  try {
    // Test Pinecone connection
    const isReady = await pineconeModule.setupPinecone();
    
    if (!isReady) {
      throw new Error('Pinecone connection failed');
    }
    
    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'Vector search service is operational',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Service is experiencing issues',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Check vector format (for compatibility with previous API)
 */
async function checkVectorFormat(req, res) {
  try {
    return res.json({
      data: {
        count: -1,  // Unknown count without querying
        format: 'pinecone',
        has_strings: false,
        has_arrays: true,
        has_invalid: false,
        dimensions: 1536
      }
    });
  } catch (error) {
    console.error('Error in checkVectorFormat:', error);
    return res.status(500).json({ error: 'Failed to check vector format' });
  }
}

/**
 * Handles POST request to create a new vector
 */
async function handleCreateVector(req, res) {
  try {
    // Validate request body
    const { text, profileId } = req.body;
    
    if (!text || !profileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text and profileId are required'
      });
    }
    
    // Create the vector
    const docId = await createVector(text, profileId);
    
    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        id: docId,
        text,
        profileId
      },
      message: 'Vector created successfully'
    });
  } catch (error) {
    console.error('Error in handleCreateVector:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create vector',
      details: error.message
    });
  }
}

/**
 * Configure routes for an Express app
 */
function configureRoutes(app) {
  app.post('/api/vectors', handleCreateVector);
  app.get('/api/vectors/search', queryVector);
  app.delete('/api/vectors/:id', deleteVector);
  app.delete('/api/vectors/profile/:profileId', deletePersonVectors);
  app.get('/api/health', healthCheck);
  app.get('/api/vectors/format', checkVectorFormat);
  
  console.log('Vector search routes configured');
  return app;
}

module.exports = {
  // Core vector functions
  createVector,
  queryVector,
  deleteVector,
  deletePersonVectors,
  checkVectorFormat,
  healthCheck,
  
  // Configuration
  configureRoutes,
  
  // Migration helper
  migrateFromSupabase: (supabase) => pineconeModule.migrateFromSupabase(supabase)
}; 