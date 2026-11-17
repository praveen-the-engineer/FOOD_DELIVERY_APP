const Cart = require('../models/Cart');
const Food = require('../models/Food');

// Add food to cart
const addToCart = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;

        // Check whether food ID is provided
        if (!foodId) {
            return res.status(400).json({
                message: 'Food ID is required'
            });
        }

        // Check whether food exists
        const food = await Food.findById(foodId);

        if (!food || !food.isAvailable) {
            return res.status(404).json({
                message: 'Food item not found or unavailable'
            });
        }

        // Find the user's cart
        let cart = await Cart.findOne({
            user: req.user.id
        });

        // Create a cart if it does not exist
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Check whether food already exists in cart
        const existingItem = cart.items.find(
            item => item.food.toString() === foodId
        );

        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            cart.items.push({
                food: foodId,
                quantity: quantity || 1
            });
        }

        // Save cart
        await cart.save();

        res.status(200).json({
            message: 'Food added to cart successfully',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to add food to cart',
            error: error.message
        });
    }
};

// Get user's cart
const getCart = async (req, res) => {
    try {
        // Find the logged-in user's cart
        const cart = await Cart.findOne({
            user: req.user.id
        }).populate('items.food');

        // If cart does not exist
        if (!cart) {
            return res.status(200).json({
                message: 'Cart is empty',
                cart: {
                    items: [],
                    totalPrice: 0
                }
            });
        }

        // Calculate total price
        const totalPrice = cart.items.reduce(
            (total, item) => {
                return total + (item.food.price * item.quantity);
            },
            0
        );

        res.status(200).json({
            message: 'Cart fetched successfully',
            cart,
            totalPrice
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch cart',
            error: error.message
        });
    }
};

// Update cart item quantity
const updateCart = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;

        // Validate quantity
        if (!foodId || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: 'Please provide a valid food ID and quantity'
            });
        }

        // Find the user's cart
        const cart = await Cart.findOne({
            user: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        // Find the food item in cart
        const cartItem = cart.items.find(
            item => item.food.toString() === foodId
        );

        if (!cartItem) {
            return res.status(404).json({
                message: 'Food item not found in cart'
            });
        }

        // Update quantity
        cartItem.quantity = quantity;

        await cart.save();

        res.status(200).json({
            message: 'Cart quantity updated successfully',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update cart',
            error: error.message
        });
    }
};


// Remove food from cart
const removeFromCart = async (req, res) => {
    try {
        const { foodId } = req.body;

        // Check whether food ID is provided
        if (!foodId) {
            return res.status(400).json({
                message: 'Food ID is required'
            });
        }

        // Find the user's cart
        const cart = await Cart.findOne({
            user: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        // Check whether food exists in cart
        const existingItem = cart.items.find(
            item => item.food.toString() === foodId
        );

        if (!existingItem) {
            return res.status(404).json({
                message: 'Food item not found in cart'
            });
        }

        // Remove food from cart
        cart.items = cart.items.filter(
            item => item.food.toString() !== foodId
        );

        await cart.save();

        res.status(200).json({
            message: 'Food removed from cart successfully',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to remove food from cart',
            error: error.message
        });
    }
};



module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
};