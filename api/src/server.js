/**
 * API Server
 * 
 * Main server entry point for the API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectPinecone } = require('./lib/pinecone');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Pinecone connection - wrapped in async IIFE
(async () => {
  try {
    console.log('Initializing Pinecone connection...');
    const connection = await connectPinecone();
    console.log('Pinecone connection initialized successfully');
    
    // Import routes
    const documentsRoutes = require('./routes/documentsRoutes');
    const profileRoutes = require('./routes/profileRoutes');
    
    // Set up routes
    app.use('/api/documents', documentsRoutes);
    app.use('/api/profiles', profileRoutes);
    // Health check route
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', message: 'Server is running' });
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      });
    });
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('CRITICAL ERROR: Failed to initialize Pinecone connection:', error.message);
    console.error('Application cannot start without Pinecone. Exiting...');
    process.exit(1); // Exit with error code
  }
})(); 