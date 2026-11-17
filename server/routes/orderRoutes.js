
const express = require('express');
const router = express.Router();

const {
    placeOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getSalesOverview
} = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Admin: Sales Overview
router.get(
    '/sales-overview',
    authMiddleware,
    adminMiddleware,
    getSalesOverview
);

// Admin: Update order status
router.put(
    '/:orderId/status',
    authMiddleware,
    adminMiddleware,
    updateOrderStatus
);

// Customer: Place a new order
router.post('/', authMiddleware, placeOrder);

// Customer: Get personal order history
router.get('/my-orders', authMiddleware, getMyOrders);

// Admin: Get all customer orders
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);

module.exports = router;
