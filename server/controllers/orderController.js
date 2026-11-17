
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Place a new order
const placeOrder = async (req, res) => {
    try {
        const { paymentMethod } = req.body;

        if (!['Online', 'Cash on Delivery'].includes(paymentMethod)) {
            return res.status(400).json({
                message: 'Invalid payment method'
            });
        }

        const cart = await Cart.findOne({
            user: req.user.id
        }).populate('items.food');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: 'Your cart is empty'
            });
        }

        const orderItems = [];

        for (const item of cart.items) {
            const food = item.food;

            if (!food || !food.isAvailable) {
                return res.status(400).json({
                    message: 'One or more food items are unavailable'
                });
            }

            orderItems.push({
                food: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity
            });
        }

        const totalAmount = orderItems.reduce(
            (total, item) =>
                total + item.price * item.quantity,
            0
        );

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalAmount,
            paymentMethod,
            paymentStatus: 'Pending'
        });

        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Customer: Get own orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        })
            .populate('items.food', 'name image')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Admin: Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.food', 'name image')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'All orders fetched successfully',
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Admin: Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { orderId } = req.params;

        const validStatuses = [
            'Pending',
            'Confirmed',
            'Preparing',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid order status'
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            {
                new: true,
                runValidators: true
            }
        )
            .populate('user', 'name email')
            .populate('items.food', 'name image');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Admin: Get Sales Overview
const getSalesOverview = async (req, res) => {
    try {
        const orders = await Order.find();

        const totalOrders = orders.length;

        const totalRevenue = orders
            .filter(order => order.paymentStatus === 'Paid')
            .reduce(
                (total, order) => total + order.totalAmount,
                0
            );

        const pendingOrders = orders.filter(
            order => order.status === 'Pending'
        ).length;

        const deliveredOrders = orders.filter(
            order => order.status === 'Delivered'
        ).length;

        res.status(200).json({
            message: 'Sales overview fetched successfully',
            totalOrders,
            totalRevenue,
            pendingOrders,
            deliveredOrders
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    placeOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getSalesOverview
};
