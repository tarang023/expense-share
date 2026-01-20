import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GroupManager from "./pages/GroupManager";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-slate-900 text-white shadow-md">
          <div className="container mx-auto px-6 py-4">
            <span className="text-xl font-bold tracking-tight">💸 FairShare</span>
          </div>
        </nav>


        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/groups" element={<GroupManager />} />
            <Route path="/dashboard/:groupId" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;