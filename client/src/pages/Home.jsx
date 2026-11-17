
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

import { getAllFood } from '../services/foodService';
import { addToCart } from '../services/cartService';
import { useAuth } from '../context/AuthContext';
import restaurants from '../data/restaurants';

const categories = [
    {
        name: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300'
    },
    {
        name: 'Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'
    },
    {
        name: 'Biryani',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500'
    },
    {
        name: 'Desserts',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300'
    }
];

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [cartMessage, setCartMessage] = useState('');
    const [addingFood, setAddingFood] = useState('');

    // Fetch all food items
    useEffect(() => {
        const fetchFoods = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await getAllFood();

                const foodList = Array.isArray(data.foods)
                    ? data.foods
                    : [];

                setFoods(foodList);
            } catch (err) {
                console.error('Food fetching error:', err);

                setError(
                    err.response?.data?.message ||
                    'Unable to load food items. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);

    // Select restaurant
    const handleRestaurantSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setSearchTerm('');
        setSelectedCategory('All');
        setCartMessage('');

        document.getElementById('food-section')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    // Filter food by restaurant, search and category
    const filteredFoods = foods.filter((food) => {
        const foodName = (food.name || '').toLowerCase().trim();
        const foodCategory = (food.category || '').toLowerCase().trim();
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch = foodName.includes(search);
        const selected = selectedCategory.toLowerCase().trim();

        const matchesCategory =
            selected === 'all' ||
            foodCategory === selected ||
            (selected === 'desserts' && foodCategory === 'dessert');

        const matchesRestaurant =
            !selectedRestaurant ||
            food.restaurantId === selectedRestaurant.id;

        return matchesSearch && matchesCategory && matchesRestaurant;
    });

    // Add food to cart
    const handleAddToCart = async (event, foodId) => {
        event.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setAddingFood(foodId);
            setCartMessage('');

            const data = await addToCart(foodId, 1);

            setCartMessage(
                data.message || 'Food added to cart successfully.'
            );
        } catch (err) {
            setCartMessage(
                err.response?.data?.message ||
                'Unable to add food to cart.'
            );
        } finally {
            setAddingFood('');
        }
    };

    // Open food details
    const handleFoodClick = (foodId) => {
        navigate(`/food/${foodId}`);
    };

    // Clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setSelectedRestaurant(null);
    };

    return (
        <div className="home-page">

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <p className="hero-tag">WELCOME TO FOODIE</p>

                    <h1>
                        Delicious Food,
                        <span> Delivered Fast.</span>
                    </h1>

                    <p className="hero-description">
                        Discover delicious meals from your favourite
                        restaurants and enjoy them at your doorstep.
                    </p>

                    <button
                        className="explore-btn"
                        onClick={() => {
                            document.getElementById('restaurant-section')
                                ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Explore Restaurants
                    </button>
                </div>

                <div className="hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
                        alt="Delicious food"
                    />
                </div>
            </section>

            {/* AI Features Section */}
            <section className="ai-features-section">
                <h2>Meet Your Foodie AI</h2>

                <p className="section-description">
                    Discover personalized food recommendations
                    and manage your orders with voice assistance.
                </p>

                <div className="ai-features-container">

                    {/* AI Food Recommendation */}
                    <div className="ai-feature-card">
                        <div className="ai-feature-icon">🤖</div>

                        <h3>AI Food Recommendation</h3>

                        <p>
                            Get personalized food suggestions based on
                            your taste, preferences and budget using Gemini AI.
                        </p>

                        <button
                            onClick={() =>
                                navigate('/ai-assistant?mode=recommendation')
                            }
                        >
                            Explore with AI
                        </button>
                    </div>

                    {/* AI Voice Ordering */}
                    <div className="ai-feature-card">
                        <div className="ai-feature-icon">🎤</div>

                        <h3>AI Voice Ordering</h3>

                        <p>
                            Use voice commands to add food, remove items
                            and check your shopping cart.
                        </p>

                        <button
                            onClick={() =>
                                navigate('/ai-assistant?mode=voice')
                            }
                        >
                            Try Voice Ordering
                        </button>
                    </div>

                </div>
            </section>

            {/* Restaurant Section */}
            <section
                className="categories-section"
                id="restaurant-section"
            >
                <h2>Choose Your Restaurant</h2>

                <p className="section-description">
                    Select a restaurant to explore its delicious menu
                </p>

                <div className="categories-container">
                    {restaurants.map((restaurant) => (
                        <div
                            className="category-card"
                            key={restaurant.id}
                            onClick={() => handleRestaurantSelect(restaurant)}
                        >
                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                            />

                            <h3>{restaurant.name}</h3>
                            <p>{restaurant.description}</p>

                            <button
                                className="filter-btn"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleRestaurantSelect(restaurant);
                                }}
                            >
                                View Menu
                            </button>
                        </div>
                    ))}
                </div>

                {selectedRestaurant && (
                    <button
                        className="filter-btn"
                        onClick={() => setSelectedRestaurant(null)}
                    >
                        View All Restaurants' Food
                    </button>
                )}
            </section>

            {/* Food Categories */}
            <section className="categories-section">
                <h2>Explore Categories</h2>

                <p className="section-description">
                    Choose your favourite food category
                </p>

                <div className="categories-container">
                    {categories.map((category) => (
                        <div
                            className="category-card"
                            key={category.name}
                            onClick={() => {
                                setSelectedRestaurant(null);
                                setSelectedCategory(category.name);

                                document.getElementById('food-section')
                                    ?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <img
                                src={category.image}
                                alt={category.name}
                            />

                            <h3>{category.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Food Section */}
            <section
                className="featured-section"
                id="food-section"
            >
                <div className="featured-heading">
                    <h2>
                        {selectedRestaurant
                            ? `${selectedRestaurant.name} Menu`
                            : selectedCategory !== 'All'
                                ? `${selectedCategory} Items`
                                : 'Popular Dishes'}
                    </h2>

                    <p>
                        {selectedRestaurant
                            ? `Explore delicious food from ${selectedRestaurant.name}`
                            : 'Discover and order your favourite meals'}
                    </p>
                </div>

                {/* Search */}
                <div className="food-search">
                    <input
                        type="text"
                        placeholder="Search food by name..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />

                    <button onClick={handleClearFilters}>
                        Clear
                    </button>
                </div>

                {/* Category Filters */}
                <div className="category-filters">
                    {['All', 'Pizza', 'Burger', 'Biryani', 'Desserts'].map(
                        (category) => (
                            <button
                                key={category}
                                className={`filter-btn ${
                                    selectedCategory === category
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() => {
                                    setSelectedRestaurant(null);
                                    setSelectedCategory(category);
                                }}
                            >
                                {category}
                            </button>
                        )
                    )}
                </div>

                {/* Loading */}
                {loading && <p>Loading food items...</p>}

                {/* Error */}
                {!loading && error && (
                    <p className="error-message">{error}</p>
                )}

                {/* Food Cards */}
                {!loading && !error && (
                    <>
                        <p className="results-count">
                            {filteredFoods.length} food item(s) found
                        </p>

                        {filteredFoods.length === 0 ? (
                            <p className="no-food-message">
                                No matching food items found.
                            </p>
                        ) : (
                            <div className="food-container">
                                {filteredFoods.map((food) => (
                                    <div
                                        className="food-card"
                                        key={food._id}
                                        onClick={() => handleFoodClick(food._id)}
                                    >
                                        <img
                                            src={food.image}
                                            alt={food.name}
                                        />

                                        <div className="food-info">
                                            <h3>{food.name}</h3>
                                            <p>{food.description}</p>

                                            <div className="food-bottom">
                                                <span>₹{food.price}</span>

                                                <button
                                                    disabled={
                                                        addingFood === food._id ||
                                                        food.isAvailable === false
                                                    }
                                                    onClick={(event) =>
                                                        handleAddToCart(
                                                            event,
                                                            food._id
                                                        )
                                                    }
                                                >
                                                    {food.isAvailable === false
                                                        ? 'Unavailable'
                                                        : addingFood === food._id
                                                            ? 'Adding...'
                                                            : 'Add to Cart'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {cartMessage && (
                            <p className="cart-message">
                                {cartMessage}
                            </p>
                        )}
                    </>
                )}
            </section>

        </div>
    );
}

export default Home;
