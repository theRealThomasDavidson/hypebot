const { openAIConfig } = require('../lib/openai/config');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Handle API errors
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
function handleError(res, error) {
  console.error('Transcription error:', error);
  
  // Handle specific error types
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Audio file too large (max 25MB)',
      error: {
        code: 'LIMIT_FILE_SIZE',
        details: error.message
      }
    });
  }
  
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
    let tempFilePath = null;
    
    try {
      console.log('Received transcription request');
      
      // Check if file exists
      if (!req.files?.audio) {
        console.log('No audio file found in request');
        return res.status(400).json({
          success: false,
          message: 'Audio file is required'
        });
      }

      const audioFile = req.files.audio;
      console.log(`Processing audio file: ${audioFile.name}, size: ${audioFile.size} bytes`);

      // Check file size (25MB limit)
      const MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes
      if (audioFile.size > MAX_SIZE) {
        console.log(`File size ${audioFile.size} exceeds limit of ${MAX_SIZE}`);
        return res.status(413).json({
          success: false,
          message: 'Audio file too large (max 25MB)'
        });
      }

      // Create a temporary file
      const tempDir = os.tmpdir();
      const timestamp = Date.now();
      tempFilePath = path.join(tempDir, `audio-${timestamp}.webm`);
      
      // Write the buffer to a temporary file
      await fs.promises.writeFile(tempFilePath, audioFile.data);
      console.log(`Temporary file created at: ${tempFilePath}`);

      // Get OpenAI client
      const client = openAIConfig.getClient();
      console.log('Sending audio to Whisper API...');

      // Send to Whisper API using the temporary file
      const response = await openAIConfig.withRetry(async () => {
        return await client.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-1',
          response_format: 'json'
        });
      });

      console.log('Successfully transcribed audio');
      
      // Return transcribed text
      res.json({
        success: true,
        data: {
          text: response.text
        },
        message: 'Audio transcribed successfully'
      });

    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      handleError(res, error);
    } finally {
      // Clean up: delete the temporary file if it exists
      if (tempFilePath) {
        try {
          await fs.promises.unlink(tempFilePath);
          console.log('Temporary file cleaned up');
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError);
        }
      }
    }
  }
}

module.exports = new TranscribeController(); 