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

export const recordSettlement = async (groupId, transaction) => {
    try {
        const token = localStorage.getItem("jwt_token");
        const response = await axios.post(`${API_URL}/settle/${groupId}/pay`, transaction, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error recording settlement", error);
        throw error;
    }
};

export const registerUser = async (userData) => {
    
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
};

export const createGroup = async (groupName) => {
    try {
        const token = localStorage.getItem("jwt_token");
        
        
        const response = await axios.post(
            `${API_URL}/groups/createGroup`, 
            { name: groupName }, 
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
            `${API_URL}/groups/${groupId}/add-member`, 
            { username: usernameToAdd },               
            {
                headers: {
                    Authorization: `Bearer ${token}`,  
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data; 
    } catch (error) {
        
        throw error.response ? error.response.data : new Error("Network Error");
    }
};

export const loginUser = async (userData) => {
    
    const response = await axios.post('http://localhost:8000/api/auth/login', userData);

    console.log("Login response status:", response);

    
    

    const data = response.data;
    console.log("Login response received:", data);
    console.log("Response status:", data.token);
    console.log("reson", response.token); 
    console.log("status", response.statusText); 
    
    const token = data.token;
    localStorage.setItem("jwt_token", token);

    return data;
};

 
export const sendOtp = async (data) => {
    console.log("new Sending OTP to:", data);

    const response = await axios.post(`${API_URL}/auth/send-otp`, data);
    
    
    return response.data;
};


export const registerUserWithOtp = async (userData) => {
    
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    
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
        
        
        const response = await axios.post(
            `${API_URL}/groups/${groupId}/expenses`, 
            expenseData,                           
            {                                        
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