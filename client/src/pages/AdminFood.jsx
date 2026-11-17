
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getAllFood,
    addFood,
    updateFood,
    deleteFood
} from '../services/foodService';

import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const initialForm = {
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    restaurantId: '',
    isAvailable: true
};

const restaurants = [
    { id: 'pizza-palace', name: 'Pizza Palace' },
    { id: 'burger-house', name: 'Burger House' },
    { id: 'spice-garden', name: 'Spice Garden' },
    { id: 'sweet-treats', name: 'Sweet Treats' },
    { id: 'tasty-corner', name: 'Tasty Corner' }
];

function AdminFood() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');

    const [formData, setFormData] = useState(initialForm);

    // Fetch all food items
    const fetchFoods = async () => {
        try {
            const data = await getAllFood();
            setFoods(data.foods);
        } catch (error) {
            console.error('Failed to fetch food:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Add or update food
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const foodData = {
                ...formData,
                price: Number(formData.price)
            };

            if (editingId) {
                await updateFood(editingId, foodData, token);
                alert('Food updated successfully!');
            } else {
                await addFood(foodData, token);
                alert('Food added successfully!');
            }

            setFormData(initialForm);
            setEditingId(null);
            setShowForm(false);

            await fetchFoods();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                'Operation failed'
            );
        } finally {
            setSaving(false);
        }
    };

    // Load food details for editing
    const handleEdit = (food) => {
        setFormData({
            name: food.name,
            description: food.description,
            price: food.price,
            image: food.image,
            category: food.category,
            restaurantId: food.restaurantId,
            isAvailable: food.isAvailable
        });

        setEditingId(food._id);
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Delete food item
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this food item?'
        );

        if (!confirmDelete) return;

        try {
            await deleteFood(id, token);

            alert('Food deleted successfully!');

            await fetchFoods();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                'Failed to delete food'
            );
        }
    };

    // Cancel form
    const handleCancel = () => {
        setFormData(initialForm);
        setEditingId(null);
        setShowForm(false);
    };

    // Filter food items
    const filteredFoods = foods.filter((food) => {
        const matchesSearch =
            food.name.toLowerCase().includes(search.toLowerCase()) ||
            food.category.toLowerCase().includes(search.toLowerCase());

        const matchesRestaurant =
            selectedRestaurant === 'all' ||
            food.restaurantId === selectedRestaurant;

        return matchesSearch && matchesRestaurant;
    });

    // Get restaurant name
    const getRestaurantName = (restaurantId) => {
        const restaurant = restaurants.find(
            (item) => item.id === restaurantId
        );

        return restaurant ? restaurant.name : restaurantId;
    };

    return (
        <div className="food-management">

            {/* Header */}
            <div className="food-management-header">
                <div>
                    <h1>Food Management</h1>
                    <p>Manage all food items across your restaurants.</p>
                </div>

                <button
                    className="food-add-btn"
                    onClick={() => {
                        if (showForm) {
                            handleCancel();
                        } else {
                            setFormData(initialForm);
                            setEditingId(null);
                            setShowForm(true);
                        }
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Food'}
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

            {/* Food Count */}
            <div className="food-count">
                <h2>Total Food Items: {foods.length}</h2>
                <p>Showing {filteredFoods.length} food items</p>
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <form className="food-form" onSubmit={handleSubmit}>

                    <h2>
                        {editingId ? 'Edit Food Item' : 'Add New Food Item'}
                    </h2>

                    <input
                        name="name"
                        placeholder="Food name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Food description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="price"
                        type="number"
                        placeholder="Price"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="image"
                        type="url"
                        placeholder="Food image URL"
                        value={formData.image}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="restaurantId"
                        value={formData.restaurantId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Restaurant</option>

                        {restaurants.map((restaurant) => (
                            <option
                                key={restaurant.id}
                                value={restaurant.id}
                            >
                                {restaurant.name}
                            </option>
                        ))}
                    </select>

                    <label>
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                        />
                        Available
                    </label>

                    <button type="submit" disabled={saving}>
                        {saving
                            ? 'Saving...'
                            : editingId
                                ? 'Update Food'
                                : 'Add Food'}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>

                </form>
            )}

            {/* Search and Restaurant Filter */}
            <div className="food-toolbar">

                <input
                    className="food-search"
                    type="text"
                    placeholder="Search food by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="food-filter"
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                >
                    <option value="all">All Restaurants</option>

                    {restaurants.map((restaurant) => (
                        <option
                            key={restaurant.id}
                            value={restaurant.id}
                        >
                            {restaurant.name}
                        </option>
                    ))}
                </select>

            </div>

            {/* Food Cards */}
            {loading ? (
                <p>Loading food items...</p>
            ) : filteredFoods.length === 0 ? (
                <div className="food-empty">
                    <h3>No food items found</h3>
                    <p>Try changing your search or restaurant filter.</p>
                </div>
            ) : (
                <div className="food-grid">

                    {filteredFoods.map((food) => (
                        <div className="food-card" key={food._id}>

                            <img
                                className="food-card-image"
                                src={food.image}
                                alt={food.name}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />

                            <div className="food-card-content">

                                <h3>{food.name}</h3>

                                <p className="food-card-description">
                                    {food.description}
                                </p>

                                <p className="food-card-price">
                                    ₹{food.price}
                                </p>

                                <p className="food-card-meta">
                                    Category: {food.category}
                                </p>

                                <p className="food-card-meta">
                                    Restaurant: {getRestaurantName(food.restaurantId)}
                                </p>

                                <span
                                    className={`food-availability ${
                                        food.isAvailable
                                            ? 'food-available'
                                            : 'food-unavailable'
                                    }`}
                                >
                                    {food.isAvailable
                                        ? 'Available'
                                        : 'Unavailable'}
                                </span>

                                <div className="food-card-actions">

                                    <button
                                        className="food-edit-btn"
                                        onClick={() => handleEdit(food)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="food-delete-btn"
                                        onClick={() => handleDelete(food._id)}
                                    >
                                        Delete
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

export default AdminFood;
