import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/useAuth";

/**
 * PublicRoute
 *
 * Wraps public-only routes (/login, /register).
 * If the user already has a valid session (cookie present + /me returns 200),
 * redirect them away from the login page to the app.
 *
 * Shows nothing while the /me check is in-flight (isLoading) to prevent
 * a flicker where the login page shows briefly for an already-logged-in user.
 */
function PublicRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Waiting for /me response — render nothing to avoid UI flicker
        return null;
    }

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoute;
