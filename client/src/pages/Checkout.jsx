
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../services/cartService';
import {
    createPaymentOrder,
    verifyPayment
} from '../services/paymentService';

import './Checkout.css';

function Checkout() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const data = await getCart();
                setCart(data.cart?.items || []);
                setTotalPrice(data.totalPrice || 0);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    'Unable to load checkout details.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        try {
            setPaying(true);
            setError('');
            setMessage('');

            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error('Unable to load Razorpay checkout.');
            }

            const orderData = await createPaymentOrder(token);

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Foodie',
                description: 'Food Order Payment',
                order_id: orderData.razorpayOrderId,

                prefill: {
                    name: user?.name || '',
                    email: user?.email || ''
                },

                handler: async (response) => {
                    try {
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: orderData.orderId
                        };

                        await verifyPayment(verificationData, token);

                        setMessage(
                            'Payment successful! Your order has been confirmed.'
                        );

                        setCart([]);
                        setTotalPrice(0);
                    } catch (error) {
                        setError(
                            error.response?.data?.message ||
                            'Payment verification failed.'
                        );
                    } finally {
                        setPaying(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setPaying(false);
                    }
                },

                theme: {
                    color: '#ff6b35'
                }
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on('payment.failed', (response) => {
                setError(
                    response.error?.description ||
                    'Payment failed. Please try again.'
                );
                setPaying(false);
            });

            razorpay.open();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Unable to start payment.'
            );
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                <div className="checkout-spinner"></div>
                <p>Loading checkout details...</p>
            </div>
        );
    }

    return (
        <section className="checkout-page">

            <div className="checkout-container">

                <div className="checkout-header">
                    <span className="checkout-tag">FOODIE CHECKOUT</span>
                    <h2>Complete Your Order</h2>
                    <p>Review your order and proceed with secure payment.</p>
                </div>

                {error && (
                    <div className="checkout-alert error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {message && (
                    <div className="checkout-success">
                        <div className="success-icon">✓</div>
                        <h3>Payment Successful!</h3>
                        <p>{message}</p>

                        <button
                            className="checkout-home-btn"
                            onClick={() => navigate('/my-orders')}
                        >
                            View My Orders
                        </button>
                    </div>
                )}

                {!message && (
                    <>
                        {cart.length === 0 ? (
                            <div className="checkout-empty">
                                <div className="empty-cart-icon">🛒</div>
                                <h3>Your cart is empty</h3>
                                <p>Add some delicious food before checkout.</p>

                                <button
                                    onClick={() => navigate('/')}
                                    className="checkout-home-btn"
                                >
                                    Explore Food
                                </button>
                            </div>
                        ) : (
                            <div className="checkout-card">

                                <div className="checkout-card-header">
                                    <h3>Order Summary</h3>
                                    <span>{cart.length} item(s)</span>
                                </div>

                                <div className="checkout-items">
                                    {cart.map((item) => (
                                        <div
                                            className="checkout-item"
                                            key={item.food._id}
                                        >
                                            <div className="checkout-item-info">
                                                <h4>{item.food.name}</h4>
                                                <p>
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>

                                            <strong>
                                                ₹{item.food.price * item.quantity}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="checkout-total">
                                    <span>Total Amount</span>
                                    <strong>₹{totalPrice}</strong>
                                </div>

                                <div className="checkout-payment-info">
                                    <span>🔒</span>
                                    <p>
                                        Secure payment powered by Razorpay
                                    </p>
                                </div>

                                <button
                                    className="proceed-payment-btn"
                                    onClick={handlePayment}
                                    disabled={paying || !token}
                                >
                                    {paying
                                        ? 'Processing Payment...'
                                        : `Proceed to Payment • ₹${totalPrice}`}
                                </button>

                                <button
                                    className="checkout-back-btn"
                                    onClick={() => navigate('/cart')}
                                    disabled={paying}
                                >
                                    Back to Cart
                                </button>

                            </div>
                        )}
                    </>
                )}

            </div>

        </section>
    );
}

export default Checkout;
