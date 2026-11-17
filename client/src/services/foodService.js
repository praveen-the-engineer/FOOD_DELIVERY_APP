
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/food';

// Get all food items
export const getAllFood = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Add a food item (Admin only)
export const addFood = async (foodData, token) => {
    const response = await axios.post(API_URL, foodData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

// Update a food item (Admin only)
export const updateFood = async (id, foodData, token) => {
    const response = await axios.put(`${API_URL}/${id}`, foodData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

// Delete a food item (Admin only)
export const deleteFood = async (id, token) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};
