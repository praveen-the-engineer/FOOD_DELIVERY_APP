
const Food = require('../models/Food');

// Add a new food item
const addFood = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            image,
            category,
            restaurantId
        } = req.body;

        const food = await Food.create({
            name,
            description,
            price,
            image,
            category,
            restaurantId
        });

        res.status(201).json({
            message: 'Food added successfully',
            food
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to add food',
            error: error.message
        });
    }
};


// Get all food items or filter by restaurant
const getAllFood = async (req, res) => {
    try {
        const filter = {};

        if (req.query.restaurantId) {
            filter.restaurantId = req.query.restaurantId;
        }

        const foods = await Food.find(filter);

        res.status(200).json({
            message: 'Food items fetched successfully',
            foods
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch food items',
            error: error.message
        });
    }
};


// Update a food item
const updateFood = async (req, res) => {
    try {
        const food = await Food.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!food) {
            return res.status(404).json({
                message: 'Food item not found'
            });
        }

        res.status(200).json({
            message: 'Food updated successfully',
            food
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update food',
            error: error.message
        });
    }
};


// Delete a food item
const deleteFood = async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: 'Food item not found'
            });
        }

        res.status(200).json({
            message: 'Food deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete food',
            error: error.message
        });
    }
};


module.exports = {
    addFood,
    getAllFood,
    updateFood,
    deleteFood
};
