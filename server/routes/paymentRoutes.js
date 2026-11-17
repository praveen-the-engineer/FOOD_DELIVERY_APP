const express = require('express');

const router = express.Router();

const {
    createPaymentOrder,
    verifyPayment
} = require('../controllers/paymentController');

const authMiddleware = require('../middleware/authMiddleware');

// Create Razorpay payment order
router.post('/create-order', authMiddleware, createPaymentOrder);

// Verify Razorpay payment
router.post('/verify-payment', authMiddleware, verifyPayment);

module.exports = router;