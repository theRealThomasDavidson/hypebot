const openAIConfig = require('../lib/openai/config');

/**
 * Handle API errors
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
function handleError(res, error) {
  console.error('Transcription error:', error);
  res.status(500).json({
    success: false,
    message: 'An error occurred processing your request',
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message
    }
  });
}

class TranscribeController {
  /**
   * Handle audio transcription
   */
  async transcribe(req, res) {
    try {
      // Check if file exists
      if (!req.files?.audio) {
        return res.status(400).json({
          success: false,
          message: 'Audio file is required'
        });
      }

      const audioFile = req.files.audio;

      // Check file size (25MB limit)
      const MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes
      if (audioFile.size > MAX_SIZE) {
        return res.status(413).json({
          success: false,
          message: 'Audio file too large (max 25MB)'
        });
      }

      // Get OpenAI client
      const client = openAIConfig.getClient();

      // Send to Whisper API
      const response = await openAIConfig.withRetry(async () => {
        return await client.audio.transcriptions.create({
          file: audioFile,
          model: 'whisper-1',
          response_format: 'json'
        });
      });

      // Return transcribed text
      res.json({
        success: true,
        data: {
          text: response.text
        },
        message: 'Audio transcribed successfully'
      });

    } catch (error) {
      handleError(res, error);
    }
  }
}

module.exports = new TranscribeController(); 