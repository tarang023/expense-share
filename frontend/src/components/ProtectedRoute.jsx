import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute
 *
 * Wraps private routes. If "jwt_token" is absent from localStorage the user is
 * redirected to /login. The `replace` prop replaces the current history entry so
 * the browser back-button does not loop back to a protected page.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<Dashboard />} />
 *     ...
 *   </Route>
 */
function ProtectedRoute() {
  const isAuthenticated = Boolean(localStorage.getItem("jwt_token"));

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
