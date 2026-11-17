
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import { getAllFood } from '../services/foodService';
import { addToCart } from '../services/cartService';
import {
    getFavorites,
    addToFavorites,
    removeFromFavorites
} from '../services/favoriteService';

import { useAuth } from '../context/AuthContext';

import './FoodDetails.css';

function FoodDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [food, setFood] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Fetch food details and recommendations
    useEffect(() => {
        const fetchFood = async () => {
            setLoading(true);
            setError('');
            setFood(null);
            setRecommendations([]);

            try {
                const data = await getAllFood();

                const selectedFood = data.foods?.find(
                    item => item._id === id
                );

                if (!selectedFood) {
                    setError('Food item not found.');
                    return;
                }

                setFood(selectedFood);

                // Fetch content-based recommendations
                try {
                    const response = await axios.get(
                        `http://localhost:5000/api/recommendations/${id}`
                    );

                    setRecommendations(
                        response.data.recommendations || []
                    );

                } catch (recommendationError) {
                    console.error(
                        'Recommendation Error:',
                        recommendationError
                    );
                }

                // Check whether food is already a favourite
                if (user) {
                    try {
                        const favoriteData = await getFavorites();

                        const alreadyFavorite =
                            favoriteData.favorites?.some(
                                item => item._id === id
                            );

                        setIsFavorite(!!alreadyFavorite);

                    } catch (favoriteError) {
                        console.error(
                            'Favourite Fetch Error:',
                            favoriteError
                        );
                    }
                } else {
                    setIsFavorite(false);
                }

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    'Unable to load food details.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFood();
    }, [id, user]);

    // Add selected food to cart
    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setAdding(true);
            setMessage('');

            const data = await addToCart(food._id, 1);

            setMessage(data.message);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Unable to add food to cart.'
            );
        } finally {
            setAdding(false);
        }
    };

    // Add or remove food from favourites
    const handleToggleFavorite = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setFavoriteLoading(true);
            setMessage('');

            if (isFavorite) {
                const data = await removeFromFavorites(food._id);

                setIsFavorite(false);
                setMessage(data.message);

            } else {
                const data = await addToFavorites(food._id);

                setIsFavorite(true);
                setMessage(data.message);
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Unable to update favourites.'
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) {
        return <p>Loading food details...</p>;
    }

    if (error || !food) {
        return <p>{error || 'Food item not found.'}</p>;
    }

    return (
        <section className="food-details-page">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            {/* Selected Food Details */}
            <div className="food-details-container">

                <img
                    className="food-details-image"
                    src={food.image}
                    alt={food.name}
                />

                <div className="food-details-info">

                    <h2>{food.name}</h2>

                    <p className="food-category">
                        Category: {food.category}
                    </p>

                    <p className="food-description">
                        {food.description}
                    </p>

                    <h3 className="food-price">
                        ₹{food.price}
                    </h3>

                    <button
                        className="details-cart-btn"
                        onClick={handleAddToCart}
                        disabled={
                            adding || food.isAvailable === false
                        }
                    >
                        {food.isAvailable === false
                            ? 'Currently Unavailable'
                            : adding
                                ? 'Adding...'
                                : 'Add to Cart'}
                    </button>

                    <button
                        className="details-favorite-btn"
                        onClick={handleToggleFavorite}
                        disabled={
                            favoriteLoading ||
                            food.isAvailable === false
                        }
                    >
                        {favoriteLoading
                            ? 'Updating...'
                            : isFavorite
                                ? '❤️ Remove from Favourites'
                                : '♡ Add to Favourites'}
                    </button>

                    {message && <p>{message}</p>}

                </div>
            </div>

            {/* Content-Based Food Recommendations */}
            {recommendations.length > 0 && (
                <div className="similar-food-section">

                    <h2>You May Also Like</h2>

                    <p>
                        Food recommendations based on your selected item.
                    </p>

                    <div className="similar-food-grid">

                        {recommendations.map(item => (
                            <div
                                className="similar-food-card"
                                key={item._id}
                            >

                                <img
                                    src={item.image}
                                    alt={item.name}
                                />

                                <div className="similar-food-info">

                                    <h3>{item.name}</h3>

                                    <p>{item.category}</p>

                                    <strong>₹{item.price}</strong>

                                    <Link
                                        to={`/food/${item._id}`}
                                        className="similar-food-link"
                                    >
                                        View Details
                                    </Link>

                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            )}

        </section>
    );
}

export default FoodDetails;
