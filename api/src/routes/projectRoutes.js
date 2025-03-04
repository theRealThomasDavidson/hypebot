const express = require('express');
const router = express.Router();
const {
    getAllProjects,
    getProjectById,
    getProjectsByProfileId,
    createProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

// Get all projects
router.get('/', getAllProjects);

// Get project by ID
router.get('/:id', getProjectById);

// Create new project
router.post('/', createProject);

// Update project
router.put('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

module.exports = router; 