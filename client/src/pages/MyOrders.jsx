
import { useEffect, useState } from 'react';
import { getMyOrders } from '../services/orderService';
import './MyOrders.css';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                setOrders(data.orders || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    'Unable to load your orders.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <p className="orders-loading">Loading your orders...</p>;
    }

    return (
        <section className="orders-page">
            <div className="orders-header">
                <h2>My Orders</h2>
                <p>Track and manage your food orders</p>
            </div>

            {error && <p className="orders-error">{error}</p>}

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <h3>No orders yet!</h3>
                    <p>Your delicious meals will appear here.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div className="order-card" key={order._id}>
                            <div className="order-top">
                                <div>
                                    <h3>Order Details</h3>
                                    <p className="order-id">
                                        ID: {order._id}
                                    </p>
                                    <p className="order-date">
                                        Ordered on: {new Date(
                                            order.createdAt
                                        ).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <span className={`order-status ${order.status.toLowerCase().replaceAll(' ', '-')}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <div className="order-item" key={index}>
                                        <div className="food-image">
                                            {item.food?.image ? (
                                                <img
                                                    src={item.food.image}
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <span>🍽️</span>
                                            )}
                                        </div>

                                        <div className="food-info">
                                            <h4>{item.name}</h4>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: ₹{item.price}</p>
                                        </div>

                                        <p className="item-total">
                                            ₹{item.price * item.quantity}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="order-bottom">
                                <div>
                                    <p>Payment Status</p>
                                    <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>

                                <div className="order-total">
                                    <p>Total Amount</p>
                                    <h3>₹{order.totalAmount}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default MyOrders;
