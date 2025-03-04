/**
 * API Server
 * 
 * Main server entry point for the API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectPinecone } = require('./lib/pinecone');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const documentsRoutes = require('./routes/documentsRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Set up routes
app.use('/api/documents', documentsRoutes);
app.use('/api/profiles', profileRoutes);

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

// Initialize server
async function startServer() {
  try {
    console.log('Initializing Pinecone connection...');
    const connection = await connectPinecone();
    console.log('✅ Pinecone connection initialized successfully');

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