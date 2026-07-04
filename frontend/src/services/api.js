import axios from "axios";


const API_URL = import.meta.env.VITE_SPRING_BOOT_URL;
console.log(API_URL); // Log the API URL to verify it's being read correctly

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Remove every auth-related key from localStorage and redirect to /login.
 * Exported so the logout button can call it directly without duplicating logic.
 */
export function clearAuthAndRedirect() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
}

// ── Shared Axios instance ─────────────────────────────────────────────────────

const apiClient = axios.create({ baseURL: API_URL });

/**
 * Request interceptor – automatically attaches the JWT Bearer token to every
 * outgoing request so individual API functions don't have to do it manually.
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwt_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor – if the backend returns 401 Unauthorized or
 * 403 Forbidden the session is considered invalid.  We wipe localStorage and
 * hard-redirect to /login so no stale data can be seen.
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            clearAuthAndRedirect();
        }
        return Promise.reject(error);
    }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginUser = async (userData) => {
    // Login does not need the auth header – use plain axios to avoid the
    // interceptor attaching a potentially stale/invalid token.
    const response = await axios.post(`${API_URL}/auth/login`, userData);
    const data = response.data;
    const token = data.token;
    localStorage.setItem("jwt_token", token);
    return data;
};

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
};

export const sendOtp = async (data) => {
    const response = await axios.post(`${API_URL}/auth/send-otp`, data);
    return response.data;
};

export const registerUserWithOtp = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
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