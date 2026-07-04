/**
 * useAuth – decodes the JWT stored in localStorage and exposes the username
 * plus a validity flag based on the token's `exp` claim.
 *
 * JWT structure: header.payload.signature  (all base64url encoded)
 * The payload is the middle segment. Standard claims used:
 *   sub / username – the logged-in user's name
 *   exp            – Unix timestamp (seconds) when the token expires
 *
 * No third-party library is needed; we manually base64url-decode the payload.
 */

/**
 * Decode and return the JWT payload, or null if the token is missing/malformed.
 * Exported so ProtectedRoute / PublicRoute can reuse it without importing the hook.
 */
export function decodeToken(token) {
    if (!token) return null;
    try {
        const base64Payload = token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        return JSON.parse(atob(base64Payload));
    } catch {
        return null;
    }
}

/**
 * Returns true when a token exists AND its `exp` timestamp is in the future.
 * Exported so route guards can call it directly.
 */
export function isTokenValid(token) {
    const payload = decodeToken(token);
    if (!payload) return false;
    if (!payload.exp) return true; // No expiry claim → treat as valid
    return payload.exp * 1000 > Date.now();
}

export function useAuth() {
    const token = localStorage.getItem("jwt_token");
    const payload = decodeToken(token);

    if (!payload || !isTokenValid(token)) {
        return { username: null, isAuthenticated: false };
    }

    return {
        username: payload.sub ?? payload.username ?? null,
        isAuthenticated: true,
    };
}
