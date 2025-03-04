const express = require('express');
const router = express.Router({ mergeParams: true }); // This allows accessing params from parent router
const { getProjectsByProfileId } = require('../controllers/projectController');

// Get all projects for a specific profile
router.get('/', getProjectsByProfileId);

module.exports = router; 