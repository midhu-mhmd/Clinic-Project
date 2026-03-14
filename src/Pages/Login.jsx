import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Lock, AlertCircle } from "lucide-react";
import { API_URL } from "../utils/apiConfig.js";

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

  // --- HELPER: Verify Role and Handle Session ---
  const handleAuthSuccess = (data) => {
    const userRole = data.user?.role; // Get the role from response

    /**
     * UPDATED LOGIC:
     * 1. Allow "patient"
     * 2. Allow "super-admin" (Platform Owner)
     * 3. Block "admin" or "clinic-admin" (Tenant Admins)
     */
    if (userRole !== "PATIENT" && userRole !== "SUPER_ADMIN") {
      setApiError("Access Denied: Clinic/Tenant Admins must use the Partner Dashboard.");
      localStorage.clear();
      return;
    }

    // 2. Establish Session
    localStorage.setItem("token", data.token);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(data.user));

    // 3. Global update
    window.dispatchEvent(new Event("authUpdate"));

    // 4. Conditional Redirect (Optional: Send Super Admin to a different page if needed)
    if (userRole === "SUPER_ADMIN") {
      navigate("/admin/dashboard"); // Or just "/" if they share the view
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError("");

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const res = await axios.post(`${API_URL}/users/login`, payload);

      if (res.data.token) {
        handleAuthSuccess(res.data);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Authentication failed";
      setApiError(message);
      localStorage.clear();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setApiError("");
    try {
      const res = await axios.post(`${API_URL}/users/google`, {
        credential: response.credential,
      });

      handleAuthSuccess(res.data);
    } catch (error) {
      setApiError(error.response?.data?.message || "Google Sign-In failed.");
    }
  };

  const inputClass = "w-full px-0 py-4 bg-transparent border-b border-[#1E293B]/10 text-sm focus:outline-none focus:border-[#0F766E] transition-all duration-500 placeholder:text-[#1E293B]/20";

  return (
    <div className="min-h-screen bg-[#F0FDFA] flex">
      {/* Sidebar Section */}
      <div className="hidden lg:flex lg:w-1/3 bg-[#1E293B] p-12 xl:p-16 flex-col justify-between text-[#F0FDFA]">
        <div className="space-y-6">
          <div className="w-12 h-12 border border-[#F0FDFA]/20 flex items-center justify-center">
            <Lock size={20} className="text-[#0F766E]" />
          </div>
          <h2 className="text-4xl font-light tracking-tighter uppercase font-serif italic leading-none">
            Patient <br /> Portal.
          </h2>
          <p className="text-[10px] uppercase tracking-widest leading-loose opacity-60">
            Secure access for Patients & Platform Staff. <br />
            Clinic partners must use the <br />
            <span className="text-[#0F766E] cursor-pointer hover:underline" onClick={() => navigate("/clinic-login")}>
              Partner Dashboard
            </span>.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-16 lg:p-24 bg-white lg:bg-transparent rounded-t-3xl lg:rounded-none mt-16 lg:mt-0 shadow-[-10px_-10px_30px_rgba(0,0,0,0.02)] lg:shadow-none z-10 w-full relative">
        <div className="max-w-md w-full">
          <header className="mb-10 md:mb-16 text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#0F766E] mb-3 md:mb-4 block">Patient Login</span>
            <h1 className="text-4xl md:text-5xl font-light tracking-tighter uppercase text-[#1E293B]">Sign In</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Email Address</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="name@domain.com" className={inputClass} required />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Password</label>
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-[9px] uppercase tracking-widest font-bold text-[#0F766E] hover:underline">Forgot?</button>
              </div>
              <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass} required />
            </div>

            {/* Error Message Display */}
            {apiError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border-l-2 border-red-500 animate-in fade-in slide-in-from-left-2 duration-300">
                <AlertCircle size={14} className="text-red-600" />
                <p className="text-red-600 text-[10px] uppercase font-bold tracking-tight">{apiError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="group w-full bg-[#1E293B] text-[#F0FDFA] py-6 flex items-center justify-between px-8 hover:bg-[#0F766E] transition-all duration-700 disabled:opacity-50">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                {isSubmitting ? "Authenticating..." : "Sign In"}
              </span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </form>

          <div className="mt-10 md:mt-12 pt-10 md:pt-12 border-t border-[#1E293B]/5 flex flex-col items-center gap-6">
            <div className="w-full flex justify-center [&>div]:w-full sm:[&>div]:w-[350px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setApiError("Google Sign-In Failed")}
                theme="outline"
                shape="square"
                width="100%"
              />
            </div>
            <button onClick={() => navigate("/register")} className="text-[10px] uppercase tracking-widest font-bold opacity-60 hover:opacity-100 mt-2">
              New patient? <span className="text-[#0F766E]">Join the platform</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Top Header (replaces sidebar) */}
      <div className="lg:hidden absolute top-0 left-0 w-full p-6 flex items-center gap-3">
         <div className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center">
            <Lock size={16} className="text-[#0F766E]" />
         </div>
         <span className="text-xs uppercase tracking-widest font-bold text-[#1E293B]">Patient Portal</span>
      </div>
    </div>
  );
};

export default Login;