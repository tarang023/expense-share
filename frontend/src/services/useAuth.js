/**
 * useAuth – returns the logged-in user's username decoded directly from the
 * JWT payload stored in localStorage.
 *
 * JWT structure: header.payload.signature  (all base64url encoded)
 * The payload is the middle part. Standard JWT "sub" claim holds the username.
 */
export function useAuth() {
    const token = localStorage.getItem("jwt_token");
    if (!token) return { username: null };

    try {
        // base64url → base64 → decode
        const base64Payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64Payload));
        // Spring Security JWT sets the subject to the username
        return { username: payload.sub ?? payload.username ?? null };
    } catch {
        return { username: null };
    }
}
