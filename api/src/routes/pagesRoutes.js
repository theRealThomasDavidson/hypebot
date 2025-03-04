
const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

/**
 * @route   POST /api/documents
 * @desc    Store a document with its embedding
 * @access  Public
 */
router.post('/', documentsController.createDocument);

/**