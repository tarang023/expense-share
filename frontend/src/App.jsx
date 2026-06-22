import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GroupManager from "./pages/GroupManager";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import InvitationsPanel from "./components/InvitationsPanel";
import { useAuth } from "./services/useAuth";

/** Navbar shown only to authenticated users */
function AppNav() {
  const { username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/groups")}
          className="text-xl font-bold tracking-tight hover:opacity-80 transition"
        >
          💸 FairShare
        </button>

        <div className="flex items-center gap-4">
          {/* Invitations bell */}
          <InvitationsPanel />

          {/* Username pill */}
          {username && (
            <span className="text-sm bg-white/10 px-3 py-1 rounded-full font-medium">
              👤 {username}
            </span>
          )}

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

/** Public navbar (no user info, no bell) */
function PublicNav() {
  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <span className="text-xl font-bold tracking-tight">💸 FairShare</span>
      </div>
    </nav>
  );
}

/** Wrapper that picks the right nav based on auth state */
function NavBar() {
  const location = useLocation();
  const isPublicPage = ["/login", "/register"].includes(location.pathname);
  return isPublicPage ? <PublicNav /> : <AppNav />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <NavBar />

        <main>
          <Routes>
            {/* ── Private routes – require a valid JWT ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/groups" element={<GroupManager />} />
              <Route path="/dashboard/:groupId" element={<Dashboard />} />
              {/* Any unknown URL → redirect to home (still guarded by ProtectedRoute) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* ── Public routes – redirect away if already logged in ── */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;