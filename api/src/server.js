/**
 * API Server
 * 
 * Main server entry point for the API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getPineconeClient } = require('./pinecone_client');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Pinecone connection
try {
  console.log('Initializing Pinecone connection...');
  getPineconeClient();
  console.log('Pinecone connection initialized');
} catch (error) {
  console.error('Error initializing Pinecone:', error);
}

// Import routes
const documentsRoutes = require('./routes/documentsRoutes');

// Set up routes
app.use('/api/documents', documentsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'hypebot-backend'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('API Server is running. See /api/documents for endpoints.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Server startup
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
  console.log(`📝 HypeBot API available at http://localhost:${PORT}/api`);
}); 