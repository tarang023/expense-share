import axios from "axios";

const API_URL = import.meta.env.VITE_SPRING_BOOT_URL;

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url ?? "";

        const isAuthCheck = requestUrl.includes("/auth/me");

        if ((status === 401 || status === 403) && !isAuthCheck) {
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const loginUser = async (userData) => {
    const response = await apiClient.post("/auth/login", userData);
    return response.data;
};

export const logoutUser = async () => {
    await apiClient.post("/auth/logout");
    window.location.href = "/login";
};

export const getMe = async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
};

export const sendOtp = async (data) => {
    const response = await apiClient.post("/auth/send-otp", data);
    return response.data;
};

export const registerUserWithOtp = async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
};

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