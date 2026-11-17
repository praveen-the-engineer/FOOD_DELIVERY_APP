
const express = require('express');

const router = express.Router();

const {
    chatWithAI,
    handleVoiceCartCommand
} = require('../controllers/aiController');

const authMiddleware = require('../middleware/authMiddleware');

// Existing AI food recommendation chat
router.post('/chat', chatWithAI);

// Authenticated AI voice cart commands
router.post(
    '/voice-command',
    authMiddleware,
    handleVoiceCartCommand
);

module.exports = router;
