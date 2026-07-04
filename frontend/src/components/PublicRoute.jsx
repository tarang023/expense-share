import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../services/useAuth";

/**
 * PublicRoute
 *
 * Wraps public-only routes (/login, /register). Redirects away if the user
 * already has a *valid* (non-expired) JWT – so a user with an expired token
 * is correctly allowed back to the login page instead of being bounced to /.
 *
 * Usage in App.jsx:
 *   <Route element={<PublicRoute />}>
 *     <Route path="/login" element={<Login />} />
 *     <Route path="/register" element={<Register />} />
 *   </Route>
 */
function PublicRoute() {
    const token = localStorage.getItem("jwt_token");
    const isAuthenticated = token ? isTokenValid(token) : false;

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoute;
