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
            `${API_URL}/groups/createGroup`, 
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
    // Axios automatically stringifies the body and sets Content-Type to application/json
    const response = await axios.post('http://localhost:8000/api/auth/login', userData);

    console.log("Login response status:", response);

    // Axios throws an error automatically for non-2xx responses, 
    // so manual !response.ok checks are removed to rely on Axios's native error handling.

    const data = response.data;
    console.log("Login response received:", data);
    console.log("Response status:", data.token);
    console.log("reson", response.token); // Note: response.token is likely undefined in both Fetch and Axios (it is usually in data)
    console.log("status", response.statusText); // 'ok' is not a property in Axios response, used statusText or status instead
    
    const token = data.token;
    localStorage.setItem("jwt_token", token);

    return data;
};

 
export const sendOtp = async (data) => {
    console.log("new Sending OTP to:", data);

    const response = await axios.post(`${API_URL}/auth/send-otp`, data);
    
    // Axios throws automatically if the request fails
    return response.data;
};


export const registerUserWithOtp = async (userData) => {
    // userData includes: { name, username, email, password, otp }
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    // Axios throws automatically if the request fails
    return response.data;
};



export const getGroupDetails = async (groupId) => {
    const token = localStorage.getItem("jwt_token");

    try {
        const response = await axios.get(`${API_URL}/groups/${groupId}/dashboard`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching group details:", error);
        throw error;
    }
};

 
export const inviteUserToGroup = async (groupId, username) => {
    const token = localStorage.getItem("jwt_token");

    try {
        // Payload structure: { email: "friend@example.com" }
        const response = await axios.post(`${API_URL}/groups/${groupId}/invite`, 
            { username }, 
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error inviting member:", error);
        throw error;
    }
};


 

export const addGroupExpense = async (groupId, expenseData) => {
    const token = localStorage.getItem("jwt_token");

    console.log(expenseData)
     try {
        // 2. Send Request
        // Axios automatically stringifies the object to JSON
        const response = await axios.post(
            `${API_URL}/groups/${groupId}/expenses`, // URL
            expenseData,                           // Data (Payload)
            {                                        // Config (Headers)
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
};