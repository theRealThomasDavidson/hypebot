const express = require('express');
const router = express.Router();

// Explicitly require the controller
const pagesController = require('../controllers/pagesController');

// Verify that required functions exist
if (!pagesController.challengers_list || !pagesController.challenger_profile) {
    console.error('ERROR: pagesController functions are not defined properly:', 
                  Object.keys(pagesController));
}

/**
 * @route   GET /pages/function
 * @desc    View the function explorer page
 * @access  Public
 */
router.get('/function', pagesController.function_explorer);

/**
 * @route   GET /pages/polyfill
 * @desc    Serve the polyfills.js file
 * @access  Public
 */
router.get('/polyfill', pagesController.servePolyfills);

/**
 * @route   GET /pages/challenger_profile/:challenger_id
 * @desc    View a challenger's profile page
 * @access  Public
 */
router.get('/challenger/:challenger_id', pagesController.challenger_profile);

/**
 * @route   GET /pages/
 * @desc    View the challenger list page
 * @access  Public
 */
router.get('/:id', pagesController.challengers_list);
router.get('/', pagesController.challengers_list);
module.exports = router;
