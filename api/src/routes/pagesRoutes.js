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
 * @route   GET /pages/
 * @desc    View the challenger list page
 * @access  Public
 */
router.get('/', pagesController.challengers_list);

/**
 * @route   GET /pages/challenger_profile/:challenger_id
 * @desc    View a challenger's profile page
 * @access  Public
 */
router.get('/challenger/:challenger_id', pagesController.challenger_profile);

module.exports = router;
