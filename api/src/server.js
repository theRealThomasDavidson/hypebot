/**
 * API Server
 * 
 * Main server entry point for the API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const { connectPinecone } = require('./lib/pinecone');
const { indexAllProfiles } = require('./controllers/profileController');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const profileProjectsRoutes = require('./routes/profileProjectsRoutes');
const pagesRoutes = require('./routes/pagesRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached (25MB)'
}));

// Import routes
const documentsRoutes = require('./routes/documentsRoutes');
const chatRoutes = require('./routes/chat.routes');
const transcribeController = require('./controllers/transcribe.controller');

// Set up routes
app.use('/api/documents', documentsRoutes);
app.use('/api/chat', chatRoutes);
app.post('/api/transcribe', transcribeController.transcribe);  // Direct transcribe route
app.use('/api/profiles', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profiles/:profileId/projects', profileProjectsRoutes);
app.use('/pages/', pagesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'hypebot-backend'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('Initializing Pinecone connection...');
    const connection = await connectPinecone();
    console.log('✅ Pinecone connection initialized successfully');
    
    // Index all profiles in Pinecone
    try {
      console.log('Indexing all profiles in Pinecone...');
      await indexAllProfiles();
      console.log('✅ All profiles indexed successfully');
    } catch (error) {
      console.error('Warning: Failed to index profiles:', error.message);
      console.error('Server will continue starting up, but search functionality may be limited');
    }
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
      console.log(`📝 HypeBot API available at http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('CRITICAL ERROR: Failed to initialize Pinecone connection:', error.message);
    console.error('Application cannot start without Pinecone. Exiting...');
    process.exit(1);
  }
}

startServer(); 