import api from "../../config/axios";

// ─── Stats & Activity ──────────────────────────────────────────────────────────
export const getSystemStats = () => api.get("/admin/stats").then((r) => r.data);
export const getRecentActivity = (params = {}) =>
    api.get("/admin/activity", { params }).then((r) => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────
export const getAllUsers = (params = {}) =>
    api.get("/admin/users", { params }).then((r) => r.data);

export const getUserById = (id) =>
    api.get(`/admin/users/${id}`).then((r) => r.data);

export const toggleUserStatus = (id) =>
    api.patch(`/admin/users/${id}/status`).then((r) => r.data);

export const changeUserRole = (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data);

export const updateUserStorage = (id, storageLimit) =>
    api.patch(`/admin/users/${id}/storage`, { storageLimit }).then((r) => r.data);

export const deleteUser = (id) =>
    api.delete(`/admin/users/${id}`).then((r) => r.data);

// ─── Files ────────────────────────────────────────────────────────────────────
export const getAllFiles = (params = {}) =>
    api.get("/admin/files", { params }).then((r) => r.data);

export const adminDeleteFile = (id) =>
    api.delete(`/admin/files/${id}`).then((r) => r.data);
