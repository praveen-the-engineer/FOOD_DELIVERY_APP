
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

// Send customer message to Gemini AI
export const chatWithAI = async (message, restaurantId = null) => {
    const response = await axios.post(`${API_URL}/chat`, {
        message,
        restaurantId
    });

    return response.data;
};
