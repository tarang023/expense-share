import axios from "axios";

const API_URL = "http://localhost:8000/api";

 
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
            `${API_URL}/groups/getAll`,
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

export const addMemberToGroup = async (groupId, usernameToAdd) => {

     const token = localStorage.getItem("jwt_token");
     console.log("Adding member with token:", token);
    console.log("Using token:", token);
   try {
    console.log("Adding member to group:", groupId, usernameToAdd);
        const response = await axios.post(
            `${API_URL}/groups/${groupId}/add-member`, // The URL
            { username: usernameToAdd },               // The Body (matches your Java Map/DTO)
            {
                headers: {
                    Authorization: `Bearer ${token}`,  // The Header
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data; // Returns the updated Group object
    } catch (error) {
        // Helper to get the clean error message from backend
        throw error.response ? error.response.data : new Error("Network Error");
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




export const getGroupDetails = async (groupId) => {
    // 1. Retrieve the token (using the key 'jwt_token' as requested)
    const token = localStorage.getItem("jwt_token");

    const response = await fetch(`${API_URL}/groups/${groupId}/dashboard`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    // 2. Handle errors manually (Fetch doesn't throw on 400/500 errors automatically)
    if (!response.ok) {
        throw new Error("Failed to fetch group details");
    }

    // 3. Parse and return the JSON data
    return await response.json();
};