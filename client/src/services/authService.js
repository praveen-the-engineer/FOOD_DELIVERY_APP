import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

// Register user
export const registerUser = async (userData) => {
    const response = await axios.post(
        `${API_URL}/register`,
        userData
    );

    return response.data;
};

// Login user
export const loginUser = async (userData) => {
    const response = await axios.post(
        `${API_URL}/login`,
        userData
    );

    return response.data;
};

// Get logged-in user's profile
export const getProfile = async (token) => {
    const response = await axios.get(
        `${API_URL}/profile`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};