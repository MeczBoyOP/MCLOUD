import api from '../../../config/axios';

export const uploadFile = async (formData) => {
    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getFiles = async ({ folderId, search, sort, page, limit }) => {
    const params = new URLSearchParams();
    if (folderId !== undefined && folderId !== null) params.append('folderId', folderId);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/files?${params.toString()}`);
    return response.data;
};

export const getFileById = async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
};

export const downloadFileUrl = (id) => {
    // We can't easily do a straight axios get for downloading without handling blobs,
    // Alternatively, if the token is in cookies, we could just window.open(url)
    // But since token is in localStorage, we fetch blob and trigger download
    return api.get(`/files/${id}/download`, { responseType: 'blob' });
};

export const toggleFileStar = async (id) => {
    const response = await api.patch(`/files/${id}/star`);
    return response.data;
};

export const moveFile = async ({ id, targetFolderId }) => {
    const response = await api.patch(`/files/${id}/move`, { targetFolderId });
    return response.data;
};

export const deleteFile = async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
};

export const permanentDeleteFile = async (id) => {
    const response = await api.delete(`/files/${id}/permanent`);
    return response.data;
};

export const restoreFile = async (id) => {
    const response = await api.post(`/files/${id}/restore`);
    return response.data;
};

export const getStarredFiles = async () => {
    const response = await api.get('/files/starred');
    return response.data;
};

export const getTrashFiles = async () => {
    const response = await api.get('/files/trash');
    return response.data;
};

export const searchFiles = async (query) => {
    const response = await api.get(`/files/search?q=${encodeURIComponent(query)}`);
    return response.data;
};
