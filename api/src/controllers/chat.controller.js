const { semanticSearch } = require('../lib/rag/search');
const { generateResponse } = require('../lib/rag/context');
const { supabase } = require('../lib/supabase');

/**
 * Save a message to the conversation history
 * @param {string} conversationId - UUID of the conversation
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 * @param {Object} metadata - Additional metadata
 */
async function saveConversationMessage(conversationId, role, content, metadata = {}) {
  const { error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      referenced_profiles: metadata.profiles || [],
      referenced_projects: metadata.projects || []
    });

  if (error) {
    console.error('Error saving conversation message:', error);
    throw error;
  }
}

/**
 * Get conversation history
 * @param {string} conversationId - UUID of the conversation
 * @returns {Promise<Array>} Conversation messages
 */
async function getConversationHistory(conversationId) {
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }

  return data;
}

/**
 * Delete conversation history
 * @param {string} conversationId - UUID of the conversation
 */
async function deleteConversationHistory(conversationId) {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Handle API errors
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
function handleError(res, error) {
  console.error('Chat controller error:', error);
  res.status(500).json({
    success: false,
    message: 'An error occurred processing your request',
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message
    }
  });
}

class ChatController {
  /**
   * Handle chat query
   */
  async handleQuery(req, res) {
    const { query, conversation_id, max_results = 5 } = req.body;
    
    try {
      // Validate input
      if (!query?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Query is required'
        });
      }

      // Create new conversation if needed
      let conversationId = conversation_id;
      if (!conversationId) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (error) throw error;
        conversationId = data.id;
      }

      // 1. Generate embedding and search
      const searchResults = await semanticSearch(query, max_results);
      
      // 2. Generate response with context
      const response = await generateResponse(query, searchResults);
      
      // 3. Save conversation messages
      await saveConversationMessage(conversationId, 'user', query);
      await saveConversationMessage(conversationId, 'assistant', response.response, {
        profiles: response.sources.profiles,
        projects: response.sources.projects
      });
      
      // 4. Return response
      res.json({
        success: true,
        data: {
          response: response.response,
          conversation_id: conversationId,
          referenced_profiles: response.sources.profiles,
          referenced_projects: response.sources.projects,
          sources: response.sources.excerpts
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(req, res) {
    const { id } = req.params;
    
    try {
      const conversation = await getConversationHistory(id);
      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(req, res) {
    const { id } = req.params;
    
    try {
      await deleteConversationHistory(id);
      res.json({
        success: true,
        data: { id }
      });
    } catch (error) {
      handleError(res, error);
    }
  }
}

module.exports = new ChatController(); 