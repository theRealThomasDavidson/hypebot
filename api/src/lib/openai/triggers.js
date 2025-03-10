const { generateProfileEmbedding, generateProjectEmbedding } = require('./embeddings');

/**
 * @typedef {Object} QueueItem
 * @property {'profile' | 'project'} type
 * @property {string} id
 * @property {import('./types').Profile | import('./types').Project} data
 * @property {number} priority
 * @property {number} retries
 */

class EmbeddingUpdateQueue {
  static instance = null;

  constructor() {
    /** @type {QueueItem[]} */
    this.queue = [];
    /** @type {boolean} */
    this.isProcessing = false;
    /** @type {number} */
    this.maxRetries = 3;
    /** @type {number} */
    this.maxConcurrent = 5;
    /** @type {number} */
    this.processingCount = 0;

    // Start processing loop
    this.startProcessing();
  }

  /**
   * Get singleton instance
   * @returns {EmbeddingUpdateQueue}
   */
  static getInstance() {
    if (!EmbeddingUpdateQueue.instance) {
      EmbeddingUpdateQueue.instance = new EmbeddingUpdateQueue();
    }
    return EmbeddingUpdateQueue.instance;
  }

  /**
   * Add profile to update queue
   * @param {import('./types').Profile} profile - The profile to update
   * @param {number} [priority=1] - Priority of the update
   */
  queueProfileUpdate(profile, priority = 1) {
    this.queue.push({
      type: 'profile',
      id: profile.id,
      data: profile,
      priority,
      retries: 0
    });
    this.sortQueue();
  }

  /**
   * Add project to update queue
   * @param {import('./types').Project} project - The project to update
   * @param {number} [priority=1] - Priority of the update
   */
  queueProjectUpdate(project, priority = 1) {
    this.queue.push({
      type: 'project',
      id: project.id,
      data: project,
      priority,
      retries: 0
    });
    this.sortQueue();
  }

  /**
   * Sort queue by priority
   * @private
   */
  sortQueue() {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process queue items
   * @private
   * @param {QueueItem} item - The queue item to process
   */
  async processQueueItem(item) {
    try {
      if (item.type === 'profile') {
        await generateProfileEmbedding(item.data);
      } else {
        await generateProjectEmbedding(item.data);
      }
      console.log(`Successfully processed ${item.type} ${item.id}`);
    } catch (error) {
      console.error(`Error processing ${item.type} ${item.id}:`, error);
      
      if (item.retries < this.maxRetries) {
        item.retries++;
        item.priority -= 0.1; // Lower priority slightly
        this.queue.push(item);
        this.sortQueue();
      } else {
        console.error(`Max retries exceeded for ${item.type} ${item.id}`);
      }
    }
  }

  /**
   * Start processing loop
   * @private
   */
  async startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (true) {
      if (this.queue.length === 0 || this.processingCount >= this.maxConcurrent) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const item = this.queue.shift();
      if (!item) continue;

      this.processingCount++;
      this.processQueueItem(item)
        .finally(() => {
          this.processingCount--;
        });
    }
  }

  /**
   * Get queue statistics
   * @returns {Object.<string, number>}
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      processingCount: this.processingCount,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// Export singleton instance
const embeddingQueue = EmbeddingUpdateQueue.getInstance();

/**
 * Hook for profile updates
 * @param {import('./types').Profile} profile - The profile that was updated
 */
function onProfileUpdate(profile) {
  console.log(`Profile update detected for ${profile.id}`);
  embeddingQueue.queueProfileUpdate(profile);
}

/**
 * Hook for project updates
 * @param {import('./types').Project} project - The project that was updated
 */
function onProjectUpdate(project) {
  console.log(`Project update detected for ${project.id}`);
  embeddingQueue.queueProjectUpdate(project);
}

/**
 * Bulk update profiles
 * @param {import('./types').Profile[]} profiles - The profiles to update
 */
async function bulkUpdateProfiles(profiles) {
  console.log(`Queueing bulk update for ${profiles.length} profiles`);
  profiles.forEach((profile, index) => {
    // Stagger priorities to maintain order
    const priority = 1 - (index / profiles.length);
    embeddingQueue.queueProfileUpdate(profile, priority);
  });
}

/**
 * Bulk update projects
 * @param {import('./types').Project[]} projects - The projects to update
 */
async function bulkUpdateProjects(projects) {
  console.log(`Queueing bulk update for ${projects.length} projects`);
  projects.forEach((project, index) => {
    // Stagger priorities to maintain order
    const priority = 1 - (index / projects.length);
    embeddingQueue.queueProjectUpdate(project, priority);
  });
}

module.exports = {
  embeddingQueue,
  onProfileUpdate,
  onProjectUpdate,
  bulkUpdateProfiles,
  bulkUpdateProjects
}; 