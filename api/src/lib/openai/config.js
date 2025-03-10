const { OpenAI } = require('openai');

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 10000
};

// Default timeout configuration
const DEFAULT_TIMEOUT_CONFIG = {
  timeout: 30000 // 30 seconds
};

// OpenAI model configuration
const OPENAI_MODELS = {
  embedding: {
    name: 'text-embedding-3-small',
    dimensions: 1536,
    encoding: 'float'
  },
  chat: {
    name: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7
  }
};

class OpenAIConfig {
  static instance = null;
  client = null;
  retryConfig = DEFAULT_RETRY_CONFIG;

  constructor() {
    this.validateEnvironment();
  }

  /**
   * Get the singleton instance
   */
  static getInstance() {
    if (!OpenAIConfig.instance) {
      OpenAIConfig.instance = new OpenAIConfig();
    }
    return OpenAIConfig.instance;
  }

  /**
   * Validate environment variables
   */
  validateEnvironment() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
  }

  /**
   * Initialize OpenAI client with retry logic
   */
  initializeClient() {
    if (this.client) return this.client;

    const clientOptions = {
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: this.retryConfig.maxRetries,
      timeout: DEFAULT_TIMEOUT_CONFIG.timeout
    };

    this.client = new OpenAI(clientOptions);
    return this.client;
  }

  /**
   * Get OpenAI client instance
   */
  getClient() {
    try {
      return this.initializeClient();
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      throw error;
    }
  }

  /**
   * Get model configuration
   */
  getModels() {
    return OPENAI_MODELS;
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(config) {
    this.retryConfig = {
      ...this.retryConfig,
      ...config
    };
    
    // Re-initialize client with new config if it exists
    if (this.client) {
      this.client = null;
      this.initializeClient();
    }
  }

  /**
   * Exponential backoff implementation for retries
   */
  async withRetry(operation, customRetries) {
    const maxRetries = customRetries ?? this.retryConfig.maxRetries;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;

        const delay = Math.min(
          this.retryConfig.initialRetryDelay * Math.pow(2, attempt),
          this.retryConfig.maxRetryDelay
        );

        console.warn(
          `OpenAI API call failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`,
          error
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Export singleton instance
const openAIConfig = OpenAIConfig.getInstance();

module.exports = {
  openAIConfig,
  OPENAI_MODELS
}; 