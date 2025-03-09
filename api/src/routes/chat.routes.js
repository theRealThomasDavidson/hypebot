const express = require('express');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// Chat endpoints
router.post('/query', chatController.handleQuery);
router.get('/conversations/:id', chatController.getConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

module.exports = router; 