import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GroupManager from "./pages/GroupManager";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import InvitationsPanel from "./components/InvitationsPanel";
import { useAuth } from "./services/useAuth";
import { logoutUser } from "./services/api";

function AppNav() {
  const { username, notifyLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    notifyLogout();
    logoutUser();
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
          <InvitationsPanel />

          {username && (
            <span className="text-sm bg-white/10 px-3 py-1 rounded-full font-medium">
              👤 {username}
            </span>
          )}

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

function PublicNav() {
  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <span className="text-xl font-bold tracking-tight">💸 FairShare</span>
      </div>
    </nav>
  );
}

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
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/groups" replace />} />
              <Route path="/groups" element={<GroupManager />} />
              <Route path="/dashboard/:groupId" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/groups" replace />} />
            </Route>

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