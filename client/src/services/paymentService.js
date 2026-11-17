import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/payment`;

// Create Razorpay order
export const createPaymentOrder = async (token) => {
    const response = await axios.post(
        `${API_URL}/create-order`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Verify Razorpay payment
export const verifyPayment = async (paymentData, token) => {
    const response = await axios.post(
        `${API_URL}/verify-payment`,
        paymentData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};