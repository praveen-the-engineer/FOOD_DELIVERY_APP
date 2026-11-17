
const express = require('express');

const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

// Register API
router.post('/register', registerUser);

// Login API
router.post('/login', loginUser);

// Protected Profile API
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
