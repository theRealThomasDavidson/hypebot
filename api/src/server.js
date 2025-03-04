const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const profileRoutes = require('./routes/profileRoutes');

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/profiles', profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'profile-backend'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Server startup
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
  console.log(`📝 Profile API available at http://localhost:${PORT}/api/profiles`);
}); 