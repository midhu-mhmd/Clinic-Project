import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError("");

    try {
      // 1. FIX: Normalize email before sending to prevent 401/404 mismatches
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const res = await axios.post("http://localhost:5000/api/users/login", payload);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isLoggedIn", "true");
        
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        window.dispatchEvent(new Event("authUpdate"));
        navigate("/");
      }
    } catch (error) {
      // 2. FIX: Capture the specific backend "Google Login" or "Invalid Credentials" message
      const message = error.response?.data?.message || "Authentication failed";
      setApiError(message);
      
      // Clear storage on failure to prevent stale sessions
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("isLoggedIn", "false");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setApiError("");
    try {
      const res = await axios.post("http://localhost:5000/api/users/google", {
        credential: response.credential,
      });
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isLoggedIn", "true");
      
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      
      window.dispatchEvent(new Event("authUpdate"));
      navigate("/");
    } catch (error) {
      setApiError(error.response?.data?.message || "Google Sign-In failed.");
    }
  };

  const inputClass = "w-full px-0 py-4 bg-transparent border-b border-[#2D302D]/10 text-sm focus:outline-none focus:border-[#8DAA9D] transition-all duration-500 placeholder:text-[#2D302D]/20";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Sidebar Section */}
      <div className="hidden lg:flex w-1/3 bg-[#2D302D] p-16 flex-col justify-between text-[#FAF9F6]">
        <div className="space-y-6">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            <Lock size={20} className="text-[#8DAA9D]" />
          </div>
          <h2 className="text-4xl font-light tracking-tighter uppercase font-serif italic leading-none">
            Secure <br /> Login.
          </h2>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <header className="mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">Portal Access</span>
            <h1 className="text-5xl font-light tracking-tighter uppercase text-[#2D302D]">Welcome Back</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Email Address</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="name@domain.com" className={inputClass} required />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Password</label>
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-[9px] uppercase tracking-widest font-bold text-[#8DAA9D] hover:underline">Forgot?</button>
              </div>
              <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass} required />
            </div>

            {/* Error Message Display */}
            {apiError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border-l-2 border-red-500">
                <p className="text-red-600 text-[10px] uppercase font-bold tracking-tight">{apiError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700 disabled:opacity-50">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                {isSubmitting ? "Authenticating..." : "Sign In"}
              </span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-[#2D302D]/5 flex flex-col items-center gap-6">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => setApiError("Google Sign-In Failed")} 
              theme="outline" 
              shape="square" 
              width="350" 
            />
            <button onClick={() => navigate("/register")} className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100">
              New user? <span className="text-[#8DAA9D]">Create an Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;