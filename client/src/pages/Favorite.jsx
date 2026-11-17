
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    getFavorites,
    removeFromFavorites
} from '../services/favoriteService';

import './Favorite.css';

function Favorite() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removingId, setRemovingId] = useState(null);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getFavorites();
            setFavorites(data.favorites || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to load favourites'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemove = async (foodId) => {
        try {
            setRemovingId(foodId);

            await removeFromFavorites(foodId);

            setFavorites(prev =>
                prev.filter(food => food._id !== foodId)
            );

        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Failed to remove favourite'
            );
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="favorite-message">
                Loading your favourites...
            </div>
        );
    }

    if (error) {
        return (
            <div className="favorite-message">
                <p>{error}</p>
                <button onClick={fetchFavorites}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="favorite-page">
            <div className="favorite-header">
                <h1>Your Favourites ❤️</h1>
                <p>Your favourite meals, all in one place.</p>
            </div>

            {favorites.length === 0 ? (
                <div className="empty-favorites">
                    <h2>No favourites yet!</h2>
                    <p>
                        Explore delicious food and add your
                        favourite meals here.
                    </p>
                    <Link to="/" className="favorite-home-btn">
                        Explore Food
                    </Link>
                </div>
            ) : (
                <div className="favorite-grid">
                    {favorites.map(food => (
                        <div
                            className="favorite-card"
                            key={food._id}
                        >
                            <Link to={`/food/${food._id}`}>
                                <img
                                    src={food.image}
                                    alt={food.name}
                                    className="favorite-image"
                                />
                            </Link>

                            <div className="favorite-details">
                                <h3>{food.name}</h3>

                                <p>{food.description}</p>

                                <div className="favorite-bottom">
                                    <span className="favorite-price">
                                        ₹{food.price}
                                    </span>

                                    <button
                                        className="remove-favorite-btn"
                                        onClick={() =>
                                            handleRemove(food._id)
                                        }
                                        disabled={
                                            removingId === food._id
                                        }
                                    >
                                        {removingId === food._id
                                            ? 'Removing...'
                                            : '❤️ Remove'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favorite;
