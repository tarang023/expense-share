import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getMe } from "./api";

const AuthContext = createContext(null);

const AUTH_CHANNEL = "fairshare_auth";

export function AuthProvider({ children }) {
    const [username, setUsername] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const channelRef = useRef(null);

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

    const notifyLogin = useCallback((loggedInUsername) => {
        setUsername(loggedInUsername);
        setIsAuthenticated(true);
        channelRef.current?.postMessage({ type: "LOGIN", username: loggedInUsername });
    }, []);

    const notifyLogout = useCallback(() => {
        setUsername(null);
        setIsAuthenticated(false);
        channelRef.current?.postMessage({ type: "LOGOUT" });
    }, []);

    useEffect(() => {
        refreshAuth();

        if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel(AUTH_CHANNEL);
            channelRef.current = channel;

            channel.onmessage = (event) => {
                const { type, username: newUsername } = event.data;

                if (type === "LOGIN") {
                    setUsername(newUsername);
                    setIsAuthenticated(true);
                } else if (type === "LOGOUT") {
                    setUsername(null);
                    setIsAuthenticated(false);
                } else if (type === "REFRESH") {
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
        refreshAuth,
        notifyLogin,
        notifyLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth() must be used inside <AuthProvider>. Wrap your app in <AuthProvider>.");
    }
    return ctx;
}
