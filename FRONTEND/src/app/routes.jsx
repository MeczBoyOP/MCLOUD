import { Routes, Route } from "react-router-dom";
import ExplorerPage from "../features/folders/pages/ExplorerPage";
import NotFound from "../pages/NotFound";
import PublicLayout from "../components/layout/PublicLayout";

import AuthLayout from "../components/layout/AuthLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import OtpVerification from "../features/auth/OtpVerification";
import UserDashboard from "../user/pages/UserDashboard";
import MyFiles from "../user/pages/MyFiles";
import Starred from "../user/pages/Starred";
import Trash from "../user/pages/Trash";
import { ProtectedRoute, PublicRoute } from "../components/common/ProtectedRoutes";

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

            {/* ================= DASHBOARD ROUTES ================= */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/user/dashboard" element={<UserDashboard />} />
                    <Route path="/user/files"     element={<MyFiles />} />
                    <Route path="/user/starred"   element={<Starred />} />
                    <Route path="/user/trash"     element={<Trash />} />
                </Route>
            </Route>

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
};

export default AppRoutes;