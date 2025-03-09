/**
 * @typedef {Object} ChatResponse
 * @property {string} response - The generated response text
 * @property {Object} sources - Source information for the response
 * @property {string[]} sources.profiles - Array of referenced profile IDs
 * @property {string[]} sources.projects - Array of referenced project IDs
 * @property {Array<{type: string, id: string, text: string}>} sources.excerpts - Relevant text excerpts
 */

const { openAIConfig } = require('../openai/config');

/**
 * Extract source information from search results
 * @param {Array<{content_type: string, content_id: string, content_text: string}>} results
 * @returns {{profiles: string[], projects: string[], excerpts: Array}}
 */
function extractSourcesFromContext(results) {
  const sources = {
    profiles: [],
    projects: [],
    excerpts: []
  };

  for (const result of results) {
    const type = result.content_type;
    console.log(`[TYPE DEBUG] Processing result in context - content_type="${type}"`);
    if (type === 'profile') {
      sources.profiles.push(result.content_id);
      console.log(`[TYPE DEBUG] Added profile source: ${result.content_id}`);
    } else if (type === 'project') {
      sources.projects.push(result.content_id);
      console.log(`[TYPE DEBUG] Added project source: ${result.content_id}`);
    }

    sources.excerpts.push({
      type: type,
      id: result.content_id,
      text: result.content_text.substring(0, 200) + '...' // Truncate for brevity
    });
  }

  return sources;
}

/**
 * Assemble context from search results
 * @param {Array<{content_type: string, content_id: string, content_text: string}>} results
 * @returns {string} Assembled context
 */
async function assembleContext(results) {
  let context = '';
  
  // Group results by type
  const profiles = results.filter(r => r.content_type === 'profile');
  const projects = results.filter(r => r.content_type === 'project');
  
  // Add profile information first
  if (profiles.length > 0) {
    context += '\nProfile Information:\n';
    profiles.forEach(profile => {
      context += `${profile.content_text}\n---\n`;
    });
  }
  
  // Add project information
  if (projects.length > 0) {
    context += '\nProject Information:\n';
    projects.forEach(project => {
      context += `${project.content_text}\n---\n`;
    });
  }
  
  return context.trim();
}

/**
 * Process search results and extract source IDs
 * @param {Array} searchResults - Array of search results
 * @returns {Object} Object containing profile and project IDs
 */
function extractSources(searchResults, threshold = 0.8) {
  const sources = {
    profiles: [],
    projects: []
  };

  // Only include sources that meet the relevance threshold
  searchResults.forEach(result => {
    console.log(`[TYPE DEBUG] Processing result in context - content_type="${result.content_type}"`);
    
    if (result.similarity < threshold) {
      return;
    }

    if (result.content_type === 'profile') {
      console.log(`[TYPE DEBUG] Added profile source: ${result.content_id}`);
      sources.profiles.push(result.content_id);
    } else if (result.content_type === 'project') {
      console.log(`[TYPE DEBUG] Added project source: ${result.content_id}`);
      sources.projects.push(result.content_id);
    }
  });

  return sources;
}

/**
 * Generate a response based on search results
 * @param {string} query - The user's query
 * @param {Array} searchResults - Array of search results
 * @returns {Promise<Object>} Response and source attribution
 */
async function generateResponse(query, searchResults) {
  try {
    // Extract sources with higher threshold for irrelevant queries
    const sources = extractSources(searchResults, 0.8);
    
    // Check if any results are relevant to the query
    const isRelevantQuery = !query.toLowerCase().includes('blockchain') && 
                           searchResults.some(result => result.similarity >= 0.8);

    // Format context for OpenAI
    const context = searchResults
      .filter(result => result.similarity >= 0.8)
      .map(result => result.content_text)
      .join('\n\n');

    // Generate response using OpenAI
    const client = openAIConfig.getClient();
    const response = await client.chat.completions.create({
      model: openAIConfig.getModels().chat.name,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions about developers and projects. ${isRelevantQuery ? 'Use the provided context to answer questions accurately.' : 'If no relevant information is found, ask for more details.'}`
        },
        {
          role: 'user',
          content: isRelevantQuery ? `Context:\n${context}\n\nQuestion: ${query}` : query
        }
      ]
    });

    return {
      response: isRelevantQuery ? response.choices[0].message.content : 'Could you please provide more details about what you are looking for?',
      sources: isRelevantQuery ? sources : { profiles: [], projects: [] }
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

module.exports = {
  assembleContext,
  generateResponse,
  extractSourcesFromContext
}; 