const express = require('express');
const router = express.Router();
const {
    createVector,
    searchVectors,
    deleteVector,
    deleteProfileVectors,
    getVectorFormat,
    healthCheck
} = require('../controllers/vectorController');

// Health check for vector service specifically
router.get('/health', healthCheck);

// Create a new vector
router.post('/', createVector);

// Search for similar vectors
router.get('/search', searchVectors);

// Get vector format metadata
router.get('/format', getVectorFormat);

// Delete a vector by ID
router.delete('/:id', deleteVector);

// Delete all vectors for a profile
router.delete('/profile/:profileId', deleteProfileVectors);

module.exports = router; 