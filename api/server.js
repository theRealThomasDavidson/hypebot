const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Sample profiles data
const sampleProfiles = require('../src/data/profiles');

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

// Get all profiles
apiRouter.get('/profiles', (req, res) => {
  // Simulate delay for testing loading states (remove in production)
  setTimeout(() => {
    res.json({
      success: true,
      data: sampleProfiles
    });
  }, 500);
});

// Get a specific profile by ID
apiRouter.get('/profiles/:id', (req, res) => {
  const profile = sampleProfiles.find(p => p.id === parseInt(req.params.id));
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  res.json({
    success: true,
    data: profile
  });
});

// Search profiles
apiRouter.get('/profiles/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.json({
      success: true,
      data: sampleProfiles
    });
  }
  
  const searchTerm = query.toLowerCase();
  const results = sampleProfiles.filter(profile => {
    return (
      profile.name.toLowerCase().includes(searchTerm) ||
      profile.title.toLowerCase().includes(searchTerm) ||
      profile.bio.toLowerCase().includes(searchTerm) ||
      (profile.keywords && profile.keywords.toLowerCase().includes(searchTerm))
    );
  });
  
  res.json({
    success: true,
    data: results
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
}); 