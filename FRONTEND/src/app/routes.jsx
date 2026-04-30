import { Routes, Route, Navigate } from "react-router-dom";
import ExplorerPage from "../features/folders/pages/ExplorerPage";
import NotFound from "../pages/NotFound";
import PublicLayout from "../components/layout/PublicLayout";

import AuthLayout from "../components/layout/AuthLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import AdminLayout from "../components/layout/AdminLayout";

import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import OtpVerification from "../features/auth/OtpVerification";

import UserDashboard from "../user/pages/UserDashboard";
import MyFiles from "../user/pages/MyFiles";
import Starred from "../user/pages/Starred";
import Trash from "../user/pages/Trash";

import AdminDashboard from "../admin/pages/AdminDashboard";
import UserManagement from "../admin/components/UserManagement";
import UserDetail from "../admin/pages/UserDetail";
import AdminFiles from "../admin/pages/AdminFiles";
import AdminActivity from "../admin/pages/AdminActivity";

import { ProtectedRoute, PublicRoute } from "../components/common/ProtectedRoutes";
import { AdminRoute } from "../components/common/AdminRoute";

const AppRoutes = () => {
    return (
        <Routes>

            {/* ================= PUBLIC ROUTES ================= */}
            <Route element={<PublicLayout />}>
                <Route index element={<ExplorerPage />} />
            </Route>

            {/* ================= AUTH ROUTES ================= */}
            <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Signup />} />
                    <Route path="/otp" element={<OtpVerification />} />
                </Route>
            </Route>

            {/* ================= USER DASHBOARD ROUTES ================= */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/user/dashboard" element={<UserDashboard />} />
                    <Route path="/user/files"     element={<MyFiles />} />
                    <Route path="/user/starred"   element={<Starred />} />
                    <Route path="/user/trash"     element={<Trash />} />
                </Route>
            </Route>

            {/* ================= ADMIN ROUTES ================= */}
            <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard"    element={<AdminDashboard />} />
                    <Route path="/admin/users"        element={<UserManagement />} />
                    <Route path="/admin/users/:id"    element={<UserDetail />} />
                    <Route path="/admin/files"        element={<AdminFiles />} />
                    <Route path="/admin/activity"     element={<AdminActivity />} />
                </Route>
            </Route>

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
};

export default AppRoutes;