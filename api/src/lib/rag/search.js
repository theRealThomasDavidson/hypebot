/**
 * @typedef {Object} SearchResult
 * @property {string} content_type - Type of content ('profile' or 'project')
 * @property {string} content_id - UUID of the content
 * @property {string} content_text - Text content that was matched
 * @property {number} similarity - Similarity score (0-1)
 */

const { generateQueryEmbedding } = require('../openai/embeddings');
const { adaptedSemanticSearch } = require('../pinecone/adapter');

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 1000; // Maximum number of cached queries

function getCacheKey(query, limit, options) {
  return `${query}:${limit}:${JSON.stringify(options)}`;
}

function clearOldCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Perform semantic search over profiles and projects
 * @param {string} query - The search query
 * @param {number} [limit=5] - Maximum number of results to return
 * @param {Object} [options={}] - Optional search options
 * @returns {Promise<SearchResult[]>} Array of search results
 */
async function semanticSearch(query, limit = 5, options = {}) {
  try {
    console.log(`Performing semantic search for query: "${query}"`);
    const startTime = Date.now();

    // Check cache first
    const cacheKey = getCacheKey(query, limit, options);
    const cached = cache.get(cacheKey);
    if (cached && (startTime - cached.timestamp) < CACHE_TTL) {
      console.log('Cache hit! Returning cached results');
      return cached.results;
    }

    // Clear old cache entries periodically
    if (cache.size > MAX_CACHE_SIZE) {
      clearOldCache();
    }

    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Use the adapter to get results in the expected format
    const results = await adaptedSemanticSearch(query, limit, {
      ...options,
      queryEmbedding
    });

    // Cache the results
    cache.set(cacheKey, {
      results,
      timestamp: startTime
    });

    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`⚠️ Semantic search exceeded 1s SLA (took ${duration}ms)`);
    }

    return results;
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw error;
  }
}

module.exports = {
  semanticSearch
}; 