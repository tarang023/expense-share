import axios from "axios";

const API_URL = "http://localhost:8000/api";

// --- EXISTING ---
export const getSettlements = async (groupId) => {
    try {
        const response = await axios.get(`${API_URL}/settle/${groupId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching settlements", error);
        return [];
    }
};
 

export const registerUser = async (userData) => {
    // userData = { name: "Alice", email: "alice@test.com" }
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
};

export const createGroup = async (groupName) => {
    const response = await axios.post(`${API_URL}/groups`, { name: groupName });
    return response.data;
};

export const getAllGroups = async () => {
    const response = await axios.get(`${API_URL}/groups`);
    return response.data;
};

export const addMemberToGroup = async (groupId, userId) => {
    const response = await axios.post(`${API_URL}/groups/${groupId}/add/${userId}`);
    return response.data;
};

export const loginUser = async (userData) => {
 
    const response = await fetch('http://localhost:8000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    return response.json();
};

 
export const sendOtp = async (data) => {
     
    console.log("new Sending OTP to:", data); 

    const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), 
    });
    
    if (!response.ok) {
        throw new Error("Failed to send OTP");
    }
    return await response.json();
};
 
export const registerUserWithOtp = async (userData) => {
    // userData includes: { name, username, email, password, otp }
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
};


