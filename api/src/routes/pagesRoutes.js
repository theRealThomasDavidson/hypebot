const express = require('express');
const router = express.Router();

// Explicitly require the controller
const pagesController = require('../controllers/pagesController');

// Verify that required functions exist
if (!pagesController.challengers_list || !pagesController.challenger_profile || !pagesController.chat || !pagesController.projects) {
    console.error('ERROR: pagesController functions are not defined properly:', 
                  Object.keys(pagesController));
}

// Check if all required functions are defined
const requiredFunctions = [
    'challengers_list',
    'challenger_profile',
    'challenger_projects',
    'chat',
    'projects'
];

requiredFunctions.forEach(func => {
    if (typeof pagesController[func] !== 'function') {
        console.error(`Error: ${func} is not defined in pagesController`);
    }
});

/**
 * @route   GET /pages/
 * @desc    View the challenger list page
 * @access  Public
 */
router.get('/', pagesController.challengers_list);

/**
 * @route   GET /pages/chat
 * @desc    View the chat interface page
 * @access  Public
 */
router.get('/chat', pagesController.chat);

/**
 * @route   GET /pages/challenger_profile/:challenger_id
 * @desc    View a challenger's profile page
 * @access  Public
 */
router.get('/challenger/:challenger_id', pagesController.challenger_profile);

/**
 * @route   GET /pages/challenger/:challenger_id/projects
 * @desc    View a challenger's projects
 * @access  Public
 */
router.get('/challenger/:challenger_id/projects', pagesController.challenger_projects);

/**
 * @route   GET /pages/projects
 * @desc    View all projects
 * @access  Public
 */
router.get('/projects', pagesController.projects);

module.exports = router;
