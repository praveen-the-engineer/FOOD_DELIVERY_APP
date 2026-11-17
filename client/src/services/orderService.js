import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/orders`;

// Customer: Get personal order history
export const getMyOrders = async () => {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_URL}/my-orders`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

// Admin: Get all customer orders
export const getAllOrders = async (token) => {
    const response = await axios.get(`${API_URL}/all`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, status, token) => {
    const response = await axios.put(
        `${API_URL}/${orderId}/status`,
        { status },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Admin: Get Sales Overview
export const getSalesOverview = async (token) => {
    const response = await axios.get(
        `${API_URL}/sales-overview`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};