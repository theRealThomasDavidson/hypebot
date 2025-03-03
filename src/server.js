const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
const apiRouter = express.Router();

// Test endpoint to verify server is running
apiRouter.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend API is running correctly',
    timestamp: new Date().toISOString()
  });
});

// Sample profiles endpoint (will be implemented later)
apiRouter.get('/profiles', (req, res) => {
  res.json({
    success: true,
    message: 'This endpoint will return profiles in the future',
    data: []
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Static files (if needed later)
app.use(express.static(path.join(__dirname, '../public')));

// Server startup
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
}); 