/**
 * Documents Routes
 * 
 * API routes for document operations with Pinecone
 */

const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documentsController');

/**
 * @route   POST /api/documents
 * @desc    Store a document with its embedding
 * @access  Public
 */
router.post('/', documentsController.createDocument);

/**
 * @route   GET /api/documents/search
 * @desc    Search for documents semantically
 * @access  Public
 */
router.get('/search', documentsController.searchDocuments);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document by ID
 * @access  Public
 */
router.delete('/:id', documentsController.deleteDocument);

/**
 * @route   DELETE /api/documents/user/:userId
 * @desc    Delete all documents for a user
 * @access  Public
 */
router.delete('/user/:userId', documentsController.deleteUserDocuments);

module.exports = router; 