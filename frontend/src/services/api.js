import axios from "axios";

const API_URL = import.meta.env.VITE_SPRING_BOOT_URL;

// ── Global Axios instance ─────────────────────────────────────────────────────
// withCredentials: true  →  the browser attaches the HttpOnly "jwt_token" cookie
// on EVERY request automatically. No manual token management needed.

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // ← THE KEY FLAG: sends cookies cross-origin
});

// ── Response interceptor ──────────────────────────────────────────────────────
// Redirect to /login on 401/403, EXCEPT for /auth/me.
// A 401 from /auth/me simply means "no active session" — it is handled by
// useAuth's catch block. Redirecting there would cause an infinite reload loop:
//   getMe() → 401 → interceptor → window.location → reload → getMe() → 401 → ...
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url ?? "";

        // Skip the redirect for /auth/me — useAuth handles its own 401
        const isAuthCheck = requestUrl.includes("/auth/me");

        if ((status === 401 || status === 403) && !isAuthCheck) {
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Login — POSTs credentials, backend sets the HttpOnly "jwt_token" cookie.
 * The cookie is set by the browser automatically; we don't touch localStorage.
 */
export const loginUser = async (userData) => {
    // withCredentials is set globally on apiClient, so the Set-Cookie header
    // in the response will be honoured by the browser automatically.
    const response = await apiClient.post("/auth/login", userData);
    return response.data; // { message: "Login successful" }
};

/**
 * Logout — tells the backend to overwrite the cookie with MaxAge=0,
 * which instructs the browser to delete it immediately.
 */
export const logoutUser = async () => {
    await apiClient.post("/auth/logout");
    window.location.href = "/login";
};

/**
 * Me — asks the server "who am I?".
 * Since the JWT is HttpOnly, JavaScript cannot read it.
 * This is the ONLY correct way to check auth state with cookie-based auth.
 * Returns { username: "..." } on success, throws on 401.
 */
export const getMe = async () => {
    const response = await apiClient.get("/auth/me");
    return response.data; // { username: "..." }
};

export const sendOtp = async (data) => {
    const response = await apiClient.post("/auth/send-otp", data);
    return response.data;
};

export const registerUserWithOtp = async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
};

// ── Groups ────────────────────────────────────────────────────────────────────

export const createGroup = async (groupName) => {
    const response = await apiClient.post("/groups/createGroup", { name: groupName });
    return response.data;
};

export const getAllGroups = async () => {
    const response = await apiClient.get("/groups/getAll");
    return response.data;
};

export const addMemberToGroup = async (groupId, usernameToAdd) => {
    const response = await apiClient.post(
        `/groups/${groupId}/add-member`,
        { username: usernameToAdd },
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
};

export const getGroupDetails = async (groupId) => {
    const response = await apiClient.get(`/groups/${groupId}/dashboard`);
    return response.data;
};

export const inviteUserToGroup = async (groupId, username) => {
    const response = await apiClient.post(`/groups/${groupId}/invite`, { username });
    return response.data;
};

export const addGroupExpense = async (groupId, expenseData) => {
    const response = await apiClient.post(
        `/groups/${groupId}/expenses`,
        expenseData,
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
};

// ── Settlements ───────────────────────────────────────────────────────────────

export const getSettlements = async (groupId) => {
    const response = await apiClient.get(`/settle/${groupId}`);
    return response.data;
};

export const recordSettlement = async (groupId, transaction) => {
    const response = await apiClient.post(`/settle/${groupId}/pay`, transaction, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
};

// ── Invitations ───────────────────────────────────────────────────────────────

export const getPendingInvites = async () => {
    const response = await apiClient.get("/groups/invites");
    return response.data;
};

export const acceptInvite = async (inviteId) => {
    const response = await apiClient.post(`/groups/invites/${inviteId}/accept`, {});
    return response.data;
};

export const rejectInvite = async (inviteId) => {
    const response = await apiClient.post(`/groups/invites/${inviteId}/reject`, {});
    return response.data;
};