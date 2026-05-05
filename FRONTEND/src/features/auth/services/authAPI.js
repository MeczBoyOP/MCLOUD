import api from '../../../config/axios';

export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const verifyEmail = async (data) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
};

export const resendOTP = async (data) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
};
