import api from '../../../config/axios';

export const getFolders = async ({ parentId, search }) => {
    const params = new URLSearchParams();
    if (parentId !== undefined && parentId !== null) params.append('parentId', parentId);
    if (search) params.append('search', search);

    const response = await api.get(`/folders?${params.toString()}`);
    return response.data;
};

export const getFolderById = async (id) => {
    const response = await api.get(`/folders/${id}`);
    return response.data;
};

export const createFolder = async (folderData) => {
    const response = await api.post('/folders', folderData);
    return response.data;
};

export const renameFolder = async ({ id, name }) => {
    const response = await api.patch(`/folders/${id}`, { name });
    return response.data;
};

export const moveFolder = async ({ id, targetFolderId }) => {
    const response = await api.patch(`/folders/${id}/move`, { targetFolderId });
    return response.data;
};

export const toggleFolderStar = async (id) => {
    const response = await api.patch(`/folders/${id}/star`);
    return response.data;
};

export const deleteFolder = async (id) => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
};

export const permanentDeleteFolder = async (id) => {
    const response = await api.delete(`/folders/${id}/permanent`);
    return response.data;
};

export const restoreFolder = async (id) => {
    const response = await api.post(`/folders/${id}/restore`);
    return response.data;
};

export const getStarredFolders = async () => {
    const response = await api.get('/folders/starred');
    return response.data;
};

export const getTrashFolders = async () => {
    const response = await api.get('/folders/trash');
    return response.data;
};

export const getFolderBreadcrumb = async (id) => {
    const response = await api.get(`/folders/${id}/breadcrumb`);
    return response.data;
};
