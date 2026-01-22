import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api"; 

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Sending email and password to backend
            const user = await loginUser(formData);
            
            // Store user data/token
            localStorage.setItem("user", JSON.stringify(user));
            
            navigate("/groups");
        } catch (error) {
            console.error(error);
            alert("Login failed! Invalid email or password.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-medium">Username</label>
                        <input 
                            name="username"
                            type="text" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="buckky"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-medium">Password</label>
                        <input 
                            name="password"
                            type="password" 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button 
                            type="button"
                            onClick={() => navigate("/register")} 
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition"
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;