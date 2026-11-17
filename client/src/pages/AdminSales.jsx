
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSalesOverview } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

function AdminSales() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [sales, setSales] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSales = async () => {
        try {
            const data = await getSalesOverview(token);
            setSales(data);
        } catch (error) {
            console.error('Failed to fetch sales:', error);
            alert(
                error.response?.data?.message ||
                'Failed to load sales overview'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSales();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="food-management">
                <p>Loading sales overview...</p>

                <button
                    className="food-add-btn"
                    onClick={() => navigate('/admin')}
                >
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    if (!sales) {
        return (
            <div className="food-management">
                <h2>Unable to load sales overview</h2>

                <button onClick={fetchSales}>
                    Try Again
                </button>

                <button
                    className="food-add-btn"
                    onClick={() => navigate('/admin')}
                    style={{ marginTop: '15px' }}
                >
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="food-management">

            {/* Header */}
            <div className="food-management-header">
                <div>
                    <h1>Sales Overview</h1>
                    <p>Monitor your Foodie business performance.</p>
                </div>

                <button
                    className="food-add-btn"
                    onClick={fetchSales}
                >
                    Refresh Sales
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

            {/* Sales Statistics */}
            <div className="admin-stats">

                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <h2>
                        ₹{sales.totalRevenue.toLocaleString('en-IN')}
                    </h2>
                    <p>From paid orders</p>
                </div>

                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <h2>{sales.totalOrders}</h2>
                    <p>All customer orders</p>
                </div>

                <div className="stat-card">
                    <h3>Pending Orders</h3>
                    <h2>{sales.pendingOrders}</h2>
                    <p>Awaiting processing</p>
                </div>

                <div className="stat-card">
                    <h3>Delivered Orders</h3>
                    <h2>{sales.deliveredOrders}</h2>
                    <p>Successfully delivered</p>
                </div>

            </div>

        </div>
    );
}

export default AdminSales;
