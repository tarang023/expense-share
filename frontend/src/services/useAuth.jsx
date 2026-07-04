/**
 * AuthContext – Single source of truth for authentication state.
 *
 * WHY a Context instead of a plain hook:
 *   Without Context, every component that calls useAuth() creates its OWN
 *   independent state + its own /me network request. Three components using
 *   useAuth = three separate /me calls that can resolve to different values,
 *   causing the "incognito" stale-state bug.
 *   With Context, ONE /me call is made on app startup, and the result is
 *   shared with every subscriber instantly.
 *
 * CROSS-TAB SYNC via BroadcastChannel:
 *   When Tab 2 logs in or logs out, it broadcasts an event.
 *   Tab 1 receives it and re-fetches /me to update its UI immediately.
 *   No polling, no localStorage, no manual refresh needed.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getMe } from "./api";

// ── 1. Create the context ─────────────────────────────────────────────────────

const AuthContext = createContext(null);

// Channel name must be identical in every tab of the same app
const AUTH_CHANNEL = "fairshare_auth";

// ── 2. The Provider component ─────────────────────────────────────────────────

export function AuthProvider({ children }) {
    const [username, setUsername] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // BroadcastChannel ref — created once, closed on unmount
    const channelRef = useRef(null);

    // ── Core: fetch /me and update state ────────────────────────────────────
    const refreshAuth = useCallback(() => {
        setIsLoading(true);
        return getMe()
            .then((data) => {
                setUsername(data.username);
                setIsAuthenticated(true);
            })
            .catch(() => {
                setUsername(null);
                setIsAuthenticated(false);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // ── Called by Login page after a successful login ────────────────────────
    // Updates local state AND notifies all other tabs.
    const notifyLogin = useCallback((loggedInUsername) => {
        setUsername(loggedInUsername);
        setIsAuthenticated(true);
        channelRef.current?.postMessage({ type: "LOGIN", username: loggedInUsername });
    }, []);

    // ── Called by Logout button ──────────────────────────────────────────────
    // Clears local state AND notifies all other tabs.
    const notifyLogout = useCallback(() => {
        setUsername(null);
        setIsAuthenticated(false);
        channelRef.current?.postMessage({ type: "LOGOUT" });
    }, []);

    // ── On mount: initial auth check + set up cross-tab listener ────────────
    useEffect(() => {
        // Initial session check — runs ONCE when the app first loads
        refreshAuth();

        // Set up BroadcastChannel for cross-tab sync
        // BroadcastChannel fires only in OTHER tabs (not the sender), which is
        // exactly what we want: Tab 1 listens for Tab 2's login/logout events.
        if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel(AUTH_CHANNEL);
            channelRef.current = channel;

            channel.onmessage = (event) => {
                const { type, username: newUsername } = event.data;

                if (type === "LOGIN") {
                    // Another tab logged in — update state without an extra /me call
                    // since the sender already resolved the username.
                    setUsername(newUsername);
                    setIsAuthenticated(true);
                } else if (type === "LOGOUT") {
                    // Another tab logged out — clear state immediately
                    setUsername(null);
                    setIsAuthenticated(false);
                } else if (type === "REFRESH") {
                    // Generic refresh signal — re-fetch /me to get current state
                    refreshAuth();
                }
            };

            return () => {
                channel.close();
                channelRef.current = null;
            };
        }
    }, [refreshAuth]);

    const value = {
        username,
        isAuthenticated,
        isLoading,
        refreshAuth,  // Expose so components can trigger a manual re-check
        notifyLogin,  // Call after successful login
        notifyLogout, // Call after successful logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ── 3. The consumer hook ──────────────────────────────────────────────────────

/**
 * useAuth() — consume auth state from the nearest <AuthProvider>.
 * Throws a helpful error if used outside of the provider tree.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth() must be used inside <AuthProvider>. Wrap your app in <AuthProvider>.");
    }
    return ctx;
}
