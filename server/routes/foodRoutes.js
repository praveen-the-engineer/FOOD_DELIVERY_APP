const express = require('express');

const router = express.Router();

const {
    addFood,
    getAllFood,
    updateFood,
    deleteFood
} = require('../controllers/foodController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Add food item (Admin only)
router.post('/', authMiddleware, adminMiddleware, addFood);

// Get all food items (Public)
router.get('/', getAllFood);

// Update food item (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateFood);

// Delete food item (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteFood);

module.exports = router;