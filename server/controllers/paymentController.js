const razorpay = require('../config/razorpay');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const crypto = require('crypto');

// Create Razorpay payment order
const createPaymentOrder = async (req, res) => {
    try {
        // Get customer's cart
        const cart = await Cart.findOne({
            user: req.user.id
        }).populate('items.food');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: 'Your cart is empty'
            });
        }

        // Prepare order items
        const orderItems = [];

        let totalAmount = 0;

        for (const item of cart.items) {
            const food = item.food;

            if (!food || !food.isAvailable) {
                return res.status(400).json({
                    message: 'Some food items are unavailable'
                });
            }

            orderItems.push({
                food: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity
            });

            totalAmount += food.price * item.quantity;
        }

        // Convert rupees into paise
        const amountInPaise = Math.round(totalAmount * 100);

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${Date.now()}`
        });

        // Save order in MongoDB
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalAmount,
            paymentMethod: 'Online',
            paymentStatus: 'Pending',
            razorpayOrderId: razorpayOrder.id
        });

        res.status(201).json({
            message: 'Payment order created successfully',
            keyId: process.env.RAZORPAY_KEY_ID,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: order._id
        });

    } catch (error) {
        console.error("RAZORPAY ERROR:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// Verify Razorpay payment
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        // Check required fields
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !orderId
        ) {
            return res.status(400).json({
                message: 'All payment details are required'
            });
        }

        // Find the order belonging to this customer
        const order = await Order.findOne({
            _id: orderId,
            user: req.user.id,
            razorpayOrderId: razorpay_order_id
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Generate expected signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Compare signatures safely
        const signatureBuffer = Buffer.from(razorpay_signature, 'hex');
        const generatedBuffer = Buffer.from(generatedSignature, 'hex');

        if (
            signatureBuffer.length !== generatedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, generatedBuffer)
        ) {
            return res.status(400).json({
                message: 'Payment verification failed'
            });
        }

        // Update payment status
        order.paymentId = razorpay_payment_id;
        order.paymentStatus = 'Paid';
        await order.save();

        // Clear customer's cart
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $set: { items: [] } }
        );

        res.status(200).json({
            message: 'Payment verified successfully',
            order
        });

    } catch (error) {
        console.error('PAYMENT VERIFICATION ERROR:', error);

        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};