import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './services/useAuth.jsx'

// AuthProvider wraps the entire app so every component shares ONE auth state.
// A single /me call on startup — no per-component fetches, no stale state.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
