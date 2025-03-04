/**
 * Pinecone Data Operations
 * 
 * This module handles data operations (upsert, query, delete) with Pinecone.
 * Following the official documentation at:
 * https://docs.pinecone.io/guides/data/upsert-data
 * https://docs.pinecone.io/guides/data/query-data
 * https://docs.pinecone.io/guides/data/delete-data
 */

require('dotenv').config();
const { getIndex } = require('./pinecone_client');
const { v4: uuidv4 } = require('uuid');

/**
 * Upsert vectors to Pinecone index
 * @param {Array} vectors - Array of vector objects with id, values, and metadata
 * @param {string} [indexName] - Optional index name (defaults to PINECONE_INDEX env var)
 * @returns {Promise<Object>} Upsert response
 */
async function upsertVectors(vectors, indexName) {
  if (!vectors || !Array.isArray(vectors) || vectors.length === 0) {
    throw new Error('Vectors array is required and must not be empty');
  }

  const index = getIndex(indexName);
  
  try {
    console.log(`Upserting ${vectors.length} vectors to index`);
    const response = await index.upsert(vectors);
    console.log(`Successfully upserted ${response.upsertedCount} vectors`);
    return response;
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw error;
  }
}

/**
 * Upsert a document with its embedding to Pinecone
 * 
 * @param {Object} document - The document object
 * @param {string} document.text - The text content of the document
 * @param {string} document.userId - The user ID associated with the document
 * @param {Array<number>} document.embedding - The embedding vector
 * @param {Object} document.metadata - Additional metadata
 * @param {string} indexName - The name of the Pinecone index
 * @returns {Promise<Object>} The result of the upsert operation
 */
async function upsertDocument(document, indexName) {
  if (!document || !document.embedding) {
    throw new Error('Document with embedding is required');
  }

  const index = getIndex(indexName);
  
  // Generate ID if not provided
  const id = document.id || `doc-${uuidv4()}`;
  
  // Prepare the upsert request
  const upsertRequest = {
    id,
    values: document.embedding,
    metadata: {
      text: document.text,
      userId: document.userId,
      ...document.metadata
    }
  };

  // Upsert the vector
  await index.upsert([upsertRequest]);
  
  return { id, status: 'success' };
}

/**
 * Query similar documents from Pinecone
 * 
 * @param {Object} queryParams - Query parameters
 * @param {Array<number>} queryParams.vector - The query vector
 * @param {number} queryParams.topK - Number of results to return
 * @param {Object} queryParams.filter - Filter criteria for the query
 * @param {string} indexName - The name of the Pinecone index
 * @returns {Promise<Object>} Query results
 */
async function querySimilar(queryParams, indexName) {
  if (!queryParams || !queryParams.vector) {
    throw new Error('Query vector is required');
  }

  const index = getIndex(indexName);
  
  const queryRequest = {
    vector: queryParams.vector,
    topK: queryParams.topK || 5,
    includeMetadata: true
  };
  
  // Add filter if provided
  if (queryParams.filter) {
    queryRequest.filter = queryParams.filter;
  }
  
  // Execute query
  const results = await index.query(queryRequest);
  return results;
}

/**
 * Delete vectors from Pinecone
 * 
 * @param {Array<string>} ids - Array of vector IDs to delete
 * @param {string} indexName - The name of the Pinecone index
 * @returns {Promise<Object>} Deletion results
 */
async function deleteVectors(ids, indexName) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error('Array of vector IDs is required');
  }

  const index = getIndex(indexName);
  
  // Delete vectors
  await index.deleteMany(ids);
  
  return { 
    deleted: ids.length,
    status: 'success'
  };
}

/**
 * Delete vectors by filter
 * @param {Object} filter - Metadata filter object
 * @param {string} [indexName] - Optional index name
 * @returns {Promise<Object>} Deletion response
 */
async function deleteVectorsByFilter(filter, indexName) {
  if (!filter || Object.keys(filter).length === 0) {
    throw new Error('Valid filter object is required');
  }

  const index = getIndex(indexName);
  
  try {
    console.log(`Deleting vectors by filter: ${JSON.stringify(filter)}`);
    await index.deleteMany({ filter });
    return {
      success: true,
      message: 'Vectors matching filter deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting vectors by filter:', error);
    throw error;
  }
}

module.exports = {
  upsertVectors,
  upsertDocument,
  querySimilar,
  deleteVectors,
  deleteVectorsByFilter
}; 