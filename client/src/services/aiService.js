import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/ai`;

// Send customer message to Gemini AI
export const chatWithAI = async (message, restaurantId = null) => {
    const response = await axios.post(`${API_URL}/chat`, {
        message,
        restaurantId
    });

    return response.data;
};