import axios from "axios";

const API_URL = "http://localhost:8000/api";

// --- EXISTING ---
export const getSettlements = async (groupId) => {
    try {
       
        const token = localStorage.getItem("jwt_token"); 

        const response = await axios.get(`${API_URL}/settle/${groupId}`, {
          
            headers: {
                "Authorization": `Bearer ${token}` 
            }
        });
        
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
    try {
        const token = localStorage.getItem("jwt_token");
        
        // axios.post(URL, BODY, CONFIG)
        const response = await axios.post(
            `${API_URL}/groups`, 
            { name: groupName }, // This is the Body
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating group", error);
        throw error;
    }
};

export const getAllGroups = async () => {
    try {
        const token = localStorage.getItem("jwt_token");

        // axios.get(URL, CONFIG)
        const response = await axios.get(
            `${API_URL}/groups`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching groups", error);
        throw error;
    }
};

export const addMemberToGroup = async (groupId, userId) => {
    try {
        const token = localStorage.getItem("jwt_token");

        // axios.post(URL, BODY, CONFIG)
        // ⚠️ IMPORTANT: pass null/{} as the 2nd argument because this POST has no body data
        const response = await axios.post(
            `${API_URL}/groups/${groupId}/add/${userId}`, 
            {}, // Empty body
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding member", error);
        throw error;
    }
};

export const loginUser = async (userData) => {
 
    const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    console.log("Login response status:", response);

    if (!response.ok) {
        throw new Error('Login failed');
    }

    //save cookie to localstorate
    const data = await response.json();
    console.log("Login response received:", data);
    console.log("Response status:", data.token);
    console.log("reson",response.token);
    console.log("status",response.ok);
    const token = data.token;
    localStorage.setItem("jwt_token", token);
 
    return data;
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



