import api from '../../../config/axios';

export const getProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put('/auth/me', data);
    return response.data;
};

export const setHidePin = async (pin) => {
    const response = await api.post('/auth/set-pin', { pin });
    return response.data;
};

export const verifyHidePin = async (pin) => {
    const response = await api.post('/auth/verify-pin', { pin });
    return response.data;
};
