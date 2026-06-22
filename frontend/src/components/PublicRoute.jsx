import { Navigate, Outlet } from "react-router-dom";

/**
 * PublicRoute
 *
 * Wraps public-only routes (/login, /register). If the user is already
 * authenticated they are redirected to the dashboard instead of being shown
 * the auth pages again.
 *
 * Usage in App.jsx:
 *   <Route element={<PublicRoute />}>
 *     <Route path="/login" element={<Login />} />
 *     <Route path="/register" element={<Register />} />
 *   </Route>
 */
function PublicRoute() {
  const isAuthenticated = Boolean(localStorage.getItem("jwt_token"));

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoute;
