class EmbeddingCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get embedding from cache
   * @param {string} key - The key to look up
   * @returns {Promise<any>} The cached value or undefined if not found
   */
  async get(key) {
    return this.cache.get(key);
  }

  /**
   * Set embedding in cache
   * @param {string} key - The key to store under
   * @param {any} embedding - The value to cache
   * @returns {Promise<void>}
   */
  async set(key, embedding) {
    this.cache.set(key, embedding);
  }

  /**
   * Check if key exists in cache
   * @param {string} key - The key to check
   * @returns {Promise<boolean>} Whether the key exists
   */
  async has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete entry from cache
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} Whether the key was deleted
   */
  async delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear cache
   * @returns {Promise<void>}
   */
  async clear() {
    this.cache.clear();
  }
}

// Export singleton instance
const embeddingCache = new EmbeddingCache();

module.exports = {
  embeddingCache
}; 