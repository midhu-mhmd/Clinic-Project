import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"; // Optional: lucide-react for icons

const ClinicLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFromPayment = location.state?.registered;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError(""); 
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.password) {
      setError("Credentials required for vault access.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Invalid electronic mail format.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/tenants/login", formData);

      // Note: Backend returns data inside 'data' object based on our previous controller fix
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("isLoggedIn", "true");

      window.dispatchEvent(new Event("authUpdate"));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication sequence failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "peer w-full bg-transparent border-b border-gray-200 py-4 text-sm focus:outline-none focus:border-black transition-all duration-500 placeholder-transparent font-light";
  const labelStyle =
    "absolute left-0 top-4 text-gray-400 text-[10px] tracking-[0.2em] uppercase transition-all duration-500 pointer-events-none peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 font-sans antialiased text-[#1a1a1a]">
      <div className="w-full max-w-250 grid md:grid-cols-2 gap-20 items-center">
        
        {/* Left Side: Branding */}
        <div className="hidden md:block">
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-8">System Access</h2>
          <h1 className="text-[5vw] leading-[1.1] font-light tracking-tighter mb-8">
            Return to <br />
            <span className="italic font-serif text-gray-400">workspace.</span>
          </h1>
          <div className="h-px w-12 bg-black mb-8 opacity-20"></div>
          <p className="text-gray-400 text-[11px] uppercase tracking-widest leading-relaxed max-w-xs">
            Enter administrative credentials to synchronize clinic data and AI protocols.
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-sm mx-auto md:mx-0">
          {isFromPayment && (
            <div className="mb-10 p-4 bg-black text-white border-l-4 border-gray-400 animate-in fade-in slide-in-from-top-4 duration-700">
              <p className="text-[9px] tracking-[0.2em] uppercase font-bold">
                Account Sequence Activated
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 animate-in fade-in duration-300">
              <p className="text-[9px] tracking-widest uppercase font-bold text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="relative group">
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                className={inputStyle}
                required
              />
              <label htmlFor="email" className={labelStyle}>Work Email</label>
            </div>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                className={inputStyle}
                required
              />
              <label htmlFor="password" className={labelStyle}>Access Key</label>
              
              {/* Password Toggle */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-4 text-gray-300 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => navigate("/forgot-password", { state: { view: "clinic" } })}
                className="text-[9px] tracking-widest text-gray-400 uppercase cursor-pointer hover:text-black transition-colors focus:outline-none"
              >
                Reset Access Key?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-black text-white py-6 text-[10px] tracking-[0.4em] uppercase transition-all flex justify-between px-10 items-center group ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#2d2d2d]"
              }`}
            >
              <span>{loading ? "Authenticating" : "Initiate Session"}</span>
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={18} />
              )}
            </button>
          </form>

          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
            <p className="text-[10px] tracking-widest text-gray-400 uppercase">New Organization?</p>
            <button
              type="button"
              onClick={() => navigate("/clinic-registration")}
              className="text-[10px] tracking-widest text-black font-bold uppercase border-b border-black pb-0.5 hover:opacity-50 transition-all"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicLogin;