const { searchSimilarDocuments } = require('../pinecone');

/**
 * Adapter to transform search results into the format expected by tests
 * @param {Array} results - Raw search results from Pinecone
 * @returns {Array} Formatted results matching test expectations
 */
function formatSearchResults(results) {
  return results.map(result => ({
    content_type: result.metadata.type || 'unknown',
    content_id: result.metadata.id || result.id,
    content_text: result.metadata.text || '',
    similarity: result.score
  }));
}

/**
 * Adapter for semantic search that matches test expectations
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @param {Object} options - Search options including queryEmbedding
 * @returns {Promise<Array>} Formatted search results
 */
async function adaptedSemanticSearch(query, limit = 5, options = {}) {
  const { queryEmbedding, threshold = 0.2, filter = {} } = options;

  const results = await searchSimilarDocuments(
    queryEmbedding,
    limit,
    threshold,
    filter
  );
  
  return formatSearchResults(results);
}

module.exports = {
  adaptedSemanticSearch,
  formatSearchResults
}; 