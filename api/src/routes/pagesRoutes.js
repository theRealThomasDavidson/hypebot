const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

/**
 * @route   GET /pages/
 * @desc    View the student list page
 * @access  Public
 */
router.get('/', pagesController.students_list);

/**
 * @route   GET /pages/student_profile/:student_id
 * @desc    View a student's profile page
 * @access  Public
 */
router.get('/challenger/:student_id', pagesController.student_profile);

module.exports = router;
