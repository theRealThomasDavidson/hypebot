const express = require('express');
const router = express.Router();
const {
    getAllProfiles,
    getProfileById,
    createProfile,
    updateProfile,
    deleteProfile
} = require('../controllers/profileController');

// Get all profiles
router.get('/', getAllProfiles);

// Get profile by ID
router.get('/:id', getProfileById);

// Create new profile
router.post('/', createProfile);

// Update profile
router.put('/:id', updateProfile);

// Delete profile
router.delete('/:id', deleteProfile);

module.exports = router; 