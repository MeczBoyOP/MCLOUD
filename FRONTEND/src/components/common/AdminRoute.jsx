import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminRoute — only lets through authenticated users with role === "admin"
 * Regular users are bounced to /user/dashboard
 * Unauthenticated users are bounced to /login
 */
export const AdminRoute = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/user/dashboard" replace />;
    }

    return <Outlet />;
};
