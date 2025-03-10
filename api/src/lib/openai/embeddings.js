const { openAIConfig, OPENAI_MODELS } = require('./config');

/**
 * Generate embedding for a profile
 */
async function generateProfileEmbedding(profile) {
  const text = [
    profile.name,
    profile.title || profile.blurb,
    profile.bio,
    profile.skills.join(', ')
  ].filter(Boolean).join('\n');

  const embedding = await generateEmbedding(text);
  return embedding;
}

/**
 * Generate embedding for a project
 */
async function generateProjectEmbedding(project) {
  const text = [
    project.title,
    project.blurb,
    project.description,
    project.skills.join(', ')
  ].filter(Boolean).join('\n');

  const embedding = await generateEmbedding(text);
  return embedding;
}

/**
 * Generate embedding for a query string
 */
async function generateQueryEmbedding(query) {
  return generateEmbedding(query);
}

/**
 * Generate embedding using OpenAI API
 */
async function generateEmbedding(text) {
  const client = openAIConfig.getClient();
  const model = OPENAI_MODELS.embedding.name;

  try {
    const response = await openAIConfig.withRetry(async () => {
      return await client.embeddings.create({
        model,
        input: text,
        encoding_format: OPENAI_MODELS.embedding.encoding
      });
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Store document with embedding in Pinecone
 */
async function storeDocumentWithEmbedding(text, documentId, embedding, metadata = {}) {
  try {
    if (!global.pineconeIndex) {
      throw new Error('Pinecone index not initialized');
    }

    // Prepare metadata with the text and id included
    const fullMetadata = {
      text,
      id: documentId,
      ...metadata
    };

    // Store in Pinecone using the global index
    await global.pineconeIndex.upsert([{
      id: documentId,
      values: embedding,
      metadata: fullMetadata
    }]);

    return documentId;
  } catch (error) {
    console.error('Failed to store document with embedding:', error);
    throw error;
  }
}

module.exports = {
  generateProfileEmbedding,
  generateProjectEmbedding,
  generateQueryEmbedding,
  generateEmbedding,
  storeDocumentWithEmbedding
}; 