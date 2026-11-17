
const express = require('express');

const router = express.Router();

const {
    addToFavorites,
    getFavorites,
    removeFromFavorites
} = require('../controllers/favoriteController');

const authMiddleware = require('../middleware/authMiddleware');

// Add food to favourites
router.post('/', authMiddleware, addToFavorites);

// Get user's favourite foods
router.get('/', authMiddleware, getFavorites);

// Remove food from favourites
router.delete('/', authMiddleware, removeFromFavorites);

module.exports = router;
