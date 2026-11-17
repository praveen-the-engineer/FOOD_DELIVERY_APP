import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/cart`;

// Get authentication token
const getAuthConfig = () => {
    const token = localStorage.getItem('token');

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Add food to cart
export const addToCart = async (foodId, quantity = 1) => {
    const response = await axios.post(
        API_URL,
        { foodId, quantity },
        getAuthConfig()
    );

    return response.data;
};

// Get user's cart
export const getCart = async () => {
    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// Update food quantity
export const updateCart = async (foodId, quantity) => {
    const response = await axios.put(
        API_URL,
        { foodId, quantity },
        getAuthConfig()
    );

    return response.data;
};

// Remove food from cart
export const removeFromCart = async (foodId) => {
    const response = await axios.delete(
        API_URL,
        {
            ...getAuthConfig(),
            data: { foodId }
        }
    );

    return response.data;
};