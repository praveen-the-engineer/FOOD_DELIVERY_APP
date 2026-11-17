const express = require('express');

const router = express.Router();

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
} = require('../controllers/cartController');

const authMiddleware = require('../middleware/authMiddleware');

// Add food to cart
router.post('/', authMiddleware, addToCart);

// Get user's cart
router.get('/', authMiddleware, getCart);

// Update cart item quantity
router.put('/', authMiddleware, updateCart);

// Remove food from cart
router.delete('/', authMiddleware, removeFromCart);

module.exports = router;