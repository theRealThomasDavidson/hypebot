/**
 * Pinecone Index Management
 * 
 * This module handles Pinecone index creation, deletion, and other management operations.
 * Following the official documentation at:
 * https://docs.pinecone.io/guides/indexes/understanding-indexes
 * https://docs.pinecone.io/guides/indexes/create-an-index
 */

require('dotenv').config();
const { getPineconeClient } = require('./pinecone_client');

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
 * List all available indexes
 * @returns {Promise<Array>} Array of index information
 */
async function listIndexes() {
  const pinecone = getPineconeClient();
  try {
    const indexes = await pinecone.listIndexes();
    console.log(`Found ${indexes.length} indexes`);
    return indexes;
  } catch (error) {
    console.error('Error listing indexes:', error);
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

module.exports = {
  createIndex,
  listIndexes,
  describeIndex,
  deleteIndex
}; 