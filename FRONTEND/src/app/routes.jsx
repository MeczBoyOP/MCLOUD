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
import UserProfile from "../user/pages/UserProfile";

import AdminDashboard from "../admin/pages/AdminDashboard";
import UserManagement from "../admin/components/UserManagement";
import UserDetail from "../admin/pages/UserDetail";
import AdminFiles from "../admin/pages/AdminFiles";
import AdminActivity from "../admin/pages/AdminActivity";
import AdminProfile from "../admin/pages/AdminProfile";

import Features from "../pages/Features";
import Pricing from "../pages/Pricing";
import Contact from "../pages/Contact";
import SharedFolderView from "../pages/SharedFolderView";
import SharedFileView from "../pages/SharedFileView";

import { ProtectedRoute, PublicRoute } from "../components/common/ProtectedRoutes";
import { AdminRoute } from "../components/common/AdminRoute";

const AppRoutes = () => {
    return (
        <Routes>

            {/* ================= PUBLIC ROUTES ================= */}
            <Route element={<PublicLayout />}>
                <Route index element={<ExplorerPage />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
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
                    <Route path="/user/profile"   element={<UserProfile />} />
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
                    <Route path="/admin/profile"      element={<AdminProfile />} />
                </Route>
            </Route>

            {/* ================= PUBLIC SHARE ================= */}
            <Route path="/share/folder/:token" element={<SharedFolderView />} />
            <Route path="/share/file/:token" element={<SharedFileView />} />

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
};

export default AppRoutes;