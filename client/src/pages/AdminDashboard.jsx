
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getSalesOverview,
    getAllOrders
} from '../services/orderService';

import { getAllFood } from '../services/foodService';
import { useAuth } from '../context/AuthContext';

import restaurants from '../data/restaurants';

import '../styles/admin.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [sales, setSales] = useState(null);
    const [foodCount, setFoodCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [salesData, foodData, ordersData] = await Promise.all([
                getSalesOverview(token),
                getAllFood(),
                getAllOrders(token)
            ]);

            const foods = foodData.foods || [];
            const orders = ordersData.orders || [];

            setSales(salesData);
            setFoodCount(foods.length);

            // Sort orders by latest date
            const sortedOrders = [...orders].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            // Display latest 5 orders
            setRecentOrders(sortedOrders.slice(0, 5));

        } catch (error) {
            console.error('Dashboard data error:', error);

            alert(
                error.response?.data?.message ||
                'Failed to load dashboard data'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    // Format order date
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="admin-dashboard">

            {/* Dashboard Header */}
            <div className="admin-header">
                <div>
                    <h1>Foodie Admin Dashboard</h1>
                    <p>Manage your food delivery application</p>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <span className="admin-badge">
                        Administrator
                    </span>

                    <button
                        className="food-add-btn"
                        onClick={fetchDashboardData}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : '↻ Refresh Dashboard'}
                    </button>
                </div>
            </div>

            {/* Dashboard Statistics */}
            <div className="admin-stats">

                <div className="stat-card">
                    <h3>Total Food Items</h3>
                    <h2>{loading ? '...' : foodCount}</h2>
                    <p>Across all restaurants</p>
                </div>

                <div className="stat-card">
                    <h3>Total Restaurants</h3>
                    <h2>{restaurants.length}</h2>
                    <p>Available restaurants</p>
                </div>

                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <h2>
                        {loading ? '...' : sales?.totalOrders ?? 0}
                    </h2>
                    <p>Customer orders</p>
                </div>

                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <h2>
                        {loading
                            ? '...'
                            : `₹${(sales?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
                    </h2>
                    <p>From paid orders</p>
                </div>

                <div className="stat-card">
                    <h3>Pending Orders</h3>
                    <h2>
                        {loading ? '...' : sales?.pendingOrders ?? 0}
                    </h2>
                    <p>Awaiting processing</p>
                </div>

                <div className="stat-card">
                    <h3>Delivered Orders</h3>
                    <h2>
                        {loading ? '...' : sales?.deliveredOrders ?? 0}
                    </h2>
                    <p>Successfully delivered</p>
                </div>

            </div>

            {/* Admin Management Sections */}
            <div className="admin-sections">

                <div className="admin-section-card">
                    <h2>🍔 Food Management</h2>
                    <p>
                        Add, edit and delete food items across
                        all your restaurants.
                    </p>

                    <button onClick={() => navigate('/admin/food')}>
                        Manage Food
                    </button>
                </div>

                <div className="admin-section-card">
                    <h2>📦 Order Management</h2>
                    <p>
                        View customer orders, check payment
                        details and update order status.
                    </p>

                    <button onClick={() => navigate('/admin/orders')}>
                        Manage Orders
                    </button>
                </div>

                <div className="admin-section-card">
                    <h2>📊 Sales Overview</h2>
                    <p>
                        Monitor your Foodie business performance
                        and revenue.
                    </p>

                    <button onClick={() => navigate('/admin/sales')}>
                        View Sales
                    </button>
                </div>

            </div>

            {/* Recent Orders */}
            <div className="admin-recent-orders">

                <div className="admin-header">
                    <div>
                        <h2>Recent Orders</h2>
                        <p>Latest customer orders on Foodie</p>
                    </div>

                    <button
                        className="food-add-btn"
                        onClick={() => navigate('/admin/orders')}
                    >
                        View All Orders
                    </button>
                </div>

                {loading ? (
                    <p>Loading recent orders...</p>
                ) : recentOrders.length === 0 ? (
                    <div className="food-empty">
                        <h3>No orders found</h3>
                        <p>Customer orders will appear here.</p>
                    </div>
                ) : (
                    <div className="admin-orders-list">

                        {recentOrders.map(order => (
                            <div
                                className="admin-order-card"
                                key={order._id}
                            >
                                <div className="admin-order-header">
                                    <div>
                                        <h3>
                                            Order #{order._id.slice(-8).toUpperCase()}
                                        </h3>

                                        <p>{formatDate(order.createdAt)}</p>
                                    </div>

                                    <span className={`order-status status-${order.status?.toLowerCase().replaceAll(' ', '-')}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="admin-order-customer">
                                    <p>
                                        <strong>Customer:</strong>{' '}
                                        {order.user?.name || 'Customer unavailable'}
                                    </p>
                                </div>

                                <div className="admin-order-payment">
                                    <p>
                                        <strong>Total Amount:</strong>{' '}
                                        ₹{order.totalAmount}
                                    </p>

                                    <p>
                                        <strong>Payment Status:</strong>{' '}
                                        {order.paymentStatus}
                                    </p>
                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default AdminDashboard;
