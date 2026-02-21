import { useState } from "react";
 
import { sendOtp, registerUserWithOtp } from "../services/api"; 
import { useNavigate } from "react-router-dom";

const Register = () => {
    
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: ""
    });
    
    
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); 
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
        
            await sendOtp({ email: formData.email });
            setStep(2); 
        } catch (error) {
            alert("Failed to send OTP. Please check the email provided.");
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            
            await registerUserWithOtp({ ...formData, otp });
            setStep(3); 
        } catch (error) {
            alert("Invalid OTP or Registration failed!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {step === 2 ? "Verify Email" : "Create Account"}
                </h2>
                
                {}
                {step === 1 && (
                    <>
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label className="block text-gray-600 mb-1 text-sm font-medium">Full Name</label>
                                <input 
                                    name="name" type="text" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Buckky"
                                    value={formData.name} onChange={handleChange} required 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 text-sm font-medium">Username</label>
                                <input 
                                    name="username" type="text" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="buckky_dev"
                                    value={formData.username} onChange={handleChange} required 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 text-sm font-medium">Email Address</label>
                                <input 
                                    name="email" type="email" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="buckky@nit.edu"
                                    value={formData.email} onChange={handleChange} required 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 text-sm font-medium">Password</label>
                                <input 
                                    name="password" type="password" 
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••••"
                                    value={formData.password} onChange={handleChange} required minLength={6} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-blue-400"
                            >
                                {isLoading ? "Sending..." : "Continue →"}
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <button type="button" onClick={() => navigate("/login")} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                                    Login here
                                </button>
                            </p>
                        </div>
                    </>
                )}

                {}
                {step === 2 && (
                    <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                        <div className="text-center mb-4 text-gray-600 text-sm">
                            We sent a code to <strong>{formData.email}</strong>
                        </div>

                        <div>
                            <label className="block text-gray-600 mb-1 text-sm font-medium">Enter OTP</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required maxLength={6}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-green-400"
                        >
                            {isLoading ? "Verifying..." : "Verify & Register"}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => setStep(1)} 
                            className="w-full text-gray-500 text-sm mt-2 hover:text-gray-700 underline"
                        >
                            ← Back to details
                        </button>
                    </form>
                )}

                {}
                {step === 3 && (
                    <div className="text-center">
                        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
                            <p className="font-bold text-xl">Success!</p>
                            <p>Account created for <span className="font-bold">{formData.username}</span></p>
                        </div>
                        <button 
                            onClick={() => navigate("/login")}
                            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
                        >
                            Go to Login &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;