
import { useEffect, useState } from 'react';
import {
    getCart,
    updateCart,
    removeFromCart
} from '../services/cartService';

import './Cart.css';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch cart items
    const fetchCart = async () => {
        try {
            const data = await getCart();

            setCart(data.cart?.items || []);
            setTotalPrice(data.totalPrice || 0);
            setError('');
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Unable to load your cart.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Update food quantity
    const handleUpdateQuantity = async (foodId, quantity) => {
        try {
            await updateCart(foodId, quantity);
            await fetchCart();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Unable to update quantity.'
            );
        }
    };

    // Remove food from cart
    const handleRemoveItem = async (foodId) => {
        try {
            await removeFromCart(foodId);
            await fetchCart();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Unable to remove food item.'
            );
        }
    };

    if (loading) {
        return <p>Loading your cart...</p>;
    }

    return (
        <section className="cart-page">
            <h2>My Cart</h2>

            {error && <p className="cart-error">{error}</p>}

            {cart.length === 0 ? (
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate('/')}
                    >
                        Explore Food
                    </button>
                </div>
            ) : (
                <>
                    <div className="cart-container">
                        {cart.map((item) => (
                            <div
                                className="cart-item"
                                key={item.food._id}
                            >
                                <img
                                    src={item.food.image}
                                    alt={item.food.name}
                                />

                                <div className="cart-item-info">
                                    <h3>{item.food.name}</h3>

                                    <p>
                                        Price: ₹{item.food.price}
                                    </p>

                                    <p>
                                        Subtotal: ₹
                                        {item.food.price * item.quantity}
                                    </p>

                                    <div className="quantity-controls">
                                        <button
                                            onClick={() =>
                                                handleUpdateQuantity(
                                                    item.food._id,
                                                    item.quantity - 1
                                                )
                                            }
                                            disabled={item.quantity <= 1}
                                        >
                                            −
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            onClick={() =>
                                                handleUpdateQuantity(
                                                    item.food._id,
                                                    item.quantity + 1
                                                )
                                            }
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        className="remove-btn"
                                        onClick={() =>
                                            handleRemoveItem(item.food._id)
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        <p className="cart-total">
                            Total: ₹{totalPrice}
                        </p>

                        <button
                            className="proceed-checkout-btn"
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Payment
                            <span>→</span>
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

export default Cart;
