/**
 * Pinecone Client Module
 * 
 * This module provides functionality to interact with the Pinecone vector database.
 * It handles client initialization and provides access to indexes.
 */

require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

// Global client instance for reuse
let pineconeClient = null;

/**
 * Initialize and return a Pinecone client
 * @returns {Pinecone} The pinecone client
 */
function getPineconeClient() {
  // Return existing client if available
  if (pineconeClient) {
    return pineconeClient;
  }

  // Check required environment variables
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is required in environment variables');
  }

  console.log('Initializing Pinecone client...');
  
  // Initialize client with the correct SDK v5.x.x configuration
  pineconeClient = new Pinecone({
    apiKey,
  });
  
  return pineconeClient;
}

/**
 * Get a Pinecone index by name
 * @param {string} indexName The name of the index to get
 * @returns {PineconeIndex} The pinecone index object
 */
function getIndex(indexName = process.env.PINECONE_INDEX) {
  if (!indexName) {
    throw new Error('Index name is required either as parameter or PINECONE_INDEX environment variable');
  }
  
  const client = getPineconeClient();
  return client.index(indexName);
}

/**
 * List all available indexes
 * @returns {Promise<Array>} Array of index descriptions
 */
async function listIndexes() {
  try {
    const client = getPineconeClient();
    const response = await client.listIndexes();
    return response;
  } catch (error) {
    console.error('Error listing Pinecone indexes:', error);
    // For serverless/starter Pinecone instances that might not support listIndexes
    if (error.response?.status === 404) {
      console.warn('This Pinecone account may not support listing indexes. Using environment-configured index.');
      return [{ name: process.env.PINECONE_INDEX || 'default' }];
    }
    throw error;
  }
}

module.exports = {
  getPineconeClient,
  getIndex,
  listIndexes
}; 