
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/favorites';

// Get authentication token
const getConfig = () => {
    const token = localStorage.getItem('token');

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Get all favourite foods
export const getFavorites = async () => {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

// Add food to favourites
export const addToFavorites = async (foodId) => {
    const response = await axios.post(
        API_URL,
        { foodId },
        getConfig()
    );

    return response.data;
};

// Remove food from favourites
export const removeFromFavorites = async (foodId) => {
    const response = await axios.delete(
        API_URL,
        {
            ...getConfig(),
            data: { foodId }
        }
    );

    return response.data;
};
