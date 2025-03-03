const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'profile-backend'
  });
});

// Server startup
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
}); 