
const User = require('../models/User');
const Food = require('../models/Food');
const mongoose = require('mongoose');

// Add food to favourites
const addToFavorites = async (req, res) => {
    try {
        const { foodId } = req.body;

        if (!foodId || !mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({
                message: 'Valid Food ID is required'
            });
        }

        const food = await Food.findById(foodId);

        if (!food || !food.isAvailable) {
            return res.status(404).json({
                message: 'Food item not found or unavailable'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Prevent duplicate favourites
        if (user.favorites.some(id => id.toString() === foodId)) {
            return res.status(200).json({
                message: 'Food is already in favourites',
                favorites: await User.findById(req.user.id)
                    .populate('favorites')
                    .then(user => user.favorites)
            });
        }

        user.favorites.push(foodId);
        await user.save();

        const updatedUser = await User.findById(req.user.id)
            .populate('favorites');

        res.status(200).json({
            message: 'Food added to favourites successfully',
            favorites: updatedUser.favorites
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to add food to favourites',
            error: error.message
        });
    }
};

// Get user's favourite foods
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('favorites');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'Favourites fetched successfully',
            favorites: user.favorites || []
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch favourites',
            error: error.message
        });
    }
};

// Remove food from favourites
const removeFromFavorites = async (req, res) => {
    try {
        const { foodId } = req.body;

        if (!foodId || !mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({
                message: 'Valid Food ID is required'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isFavorite = user.favorites.some(
            id => id.toString() === foodId
        );

        if (!isFavorite) {
            return res.status(404).json({
                message: 'Food item not found in favourites'
            });
        }

        user.favorites = user.favorites.filter(
            id => id.toString() !== foodId
        );

        await user.save();

        const updatedUser = await User.findById(req.user.id)
            .populate('favorites');

        res.status(200).json({
            message: 'Food removed from favourites successfully',
            favorites: updatedUser.favorites
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to remove food from favourites',
            error: error.message
        });
    }
};

module.exports = {
    addToFavorites,
    getFavorites,
    removeFromFavorites
};
