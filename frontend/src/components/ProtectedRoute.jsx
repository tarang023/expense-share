import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../services/useAuth";
import { clearAuthAndRedirect } from "../services/api";

/**
 * ProtectedRoute
 *
 * Guards every private route. Performs two checks:
 *  1. Token existence  – if absent, redirect to /login.
 *  2. Token expiry     – decode the JWT's `exp` claim; if expired, wipe
 *                        localStorage and redirect to /login.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<Dashboard />} />
 *     ...
 *   </Route>
 */
function ProtectedRoute() {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!isTokenValid(token)) {
        // Token exists but is expired – clear everything and send to login.
        clearAuthAndRedirect();
        return null; // clearAuthAndRedirect performs a hard redirect; this is a safety fallback.
    }

    return <Outlet />;
}

export default ProtectedRoute;
