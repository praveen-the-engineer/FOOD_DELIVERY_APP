
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getAllOrders,
    updateOrderStatus
} from '../services/orderService';

import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const orderStatuses = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
];

function AdminOrders() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // Fetch all orders
    const fetchOrders = async () => {
        try {
            const data = await getAllOrders(token);
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            alert(
                error.response?.data?.message ||
                'Failed to load orders'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    // Update order status
    const handleStatusChange = async (orderId, status) => {
        try {
            setUpdatingId(orderId);

            await updateOrderStatus(orderId, status, token);

            alert('Order status updated successfully!');

            await fetchOrders();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                'Failed to update order status'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Format order date
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="food-management">

            {/* Header */}
            <div className="food-management-header">
                <div>
                    <h1>Order Management</h1>
                    <p>View and manage customer orders.</p>
                </div>

                <button
                    className="food-add-btn"
                    onClick={fetchOrders}
                >
                    Refresh Orders
                </button>
            </div>

            {/* Back to Dashboard */}
            <button
                type="button"
                className="food-add-btn"
                onClick={() => navigate('/admin')}
                style={{ marginBottom: '25px' }}
            >
                ← Back to Dashboard
            </button>

            {/* Order Count */}
            <div className="food-count">
                <h2>Total Orders: {orders.length}</h2>
            </div>

            {/* Orders */}
            {loading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <div className="food-empty">
                    <h3>No orders found</h3>
                    <p>Customer orders will appear here.</p>
                </div>
            ) : (
                <div className="admin-orders-list">

                    {orders.map((order) => (
                        <div
                            className="admin-order-card"
                            key={order._id}
                        >

                            <div className="admin-order-header">
                                <div>
                                    <h3>
                                        Order #{order._id.slice(-8).toUpperCase()}
                                    </h3>

                                    <p>
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>

                                <span className={`order-status status-${order.status
                                    ?.toLowerCase()
                                    .replaceAll(' ', '-')}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="admin-order-customer">
                                <h4>Customer Details</h4>

                                <p>
                                    <strong>Name:</strong>{' '}
                                    {order.user?.name || 'Customer unavailable'}
                                </p>

                                <p>
                                    <strong>Email:</strong>{' '}
                                    {order.user?.email || 'Not available'}
                                </p>
                            </div>

                            <div className="admin-order-items">
                                <h4>Ordered Items</h4>

                                {order.items.map((item, index) => (
                                    <div
                                        className="admin-order-item"
                                        key={item._id || index}
                                    >
                                        <div>
                                            <strong>
                                                {item.name || item.food?.name || 'Food item'}
                                            </strong>

                                            <p>
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>

                                        <span>
                                            ₹{item.price * item.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="admin-order-payment">
                                <p>
                                    <strong>Total Amount:</strong>{' '}
                                    <span>₹{order.totalAmount}</span>
                                </p>

                                <p>
                                    <strong>Payment Method:</strong>{' '}
                                    {order.paymentMethod}
                                </p>

                                <p>
                                    <strong>Payment Status:</strong>{' '}
                                    {order.paymentStatus}
                                </p>
                            </div>

                            <div className="admin-order-update">
                                <label>
                                    Update Order Status
                                </label>

                                <select
                                    value={order.status}
                                    onChange={(e) =>
                                        handleStatusChange(
                                            order._id,
                                            e.target.value
                                        )
                                    }
                                    disabled={updatingId === order._id}
                                >
                                    {orderStatuses.map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                {updatingId === order._id && (
                                    <p>Updating status...</p>
                                )}
                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default AdminOrders;
