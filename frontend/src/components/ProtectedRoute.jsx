import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/useAuth";

/**
 * ProtectedRoute
 *
 * Guards every private route by checking auth state with the server.
 * Since the JWT lives in an HttpOnly cookie (invisible to JS), we call
 * GET /api/auth/me and wait for the response before deciding where to navigate.
 *
 * States:
 *   isLoading = true  → Show a spinner; don't redirect yet (avoids false /login flash)
 *   isAuthenticated   → Render the child route via <Outlet />
 *   not authenticated → Redirect to /login
 */
function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Waiting for the /me response — render nothing (or a spinner)
        // to avoid a premature redirect to /login.
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-500 text-sm animate-pulse">Checking session…</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
