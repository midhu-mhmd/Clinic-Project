import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Shield, ArrowRight, ArrowLeft, Mail, CheckCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^\+?[\d\s-]{10,}$/,
  };

  // --- 1. VALIDATION LOGIC (Must be defined before handlers) ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!patterns.email.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (!patterns.password.test(formData.password))
      newErrors.password = "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character";
    if (formData.confirm !== formData.password)
      newErrors.confirm = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 2. OTP HELPERS ---
  const verifyOtpDirectly = async (code) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await axios.post("http://localhost:5000/api/users/verify-otp", {
        email: formData.email,
        otp: code,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("authUpdate"));
      navigate("/login");
    } catch (error) {
      setApiError(error.response?.data.message || "Invalid Code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. EVENT HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (val.length === 6) {
      verifyOtpDirectly(val);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setApiError("");

    try {
      await axios.post("http://localhost:5000/api/users/send-otp", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setStep("otp");
    } catch (error) {
      setApiError(error.response?.data.message || "Could not send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setApiError("Please enter the complete 6-digit code");
      return;
    }
    verifyOtpDirectly(otp);
  };

  const handleGoogleSuccess = async (response) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await axios.post("http://localhost:5000/api/users/google", {
        credential: response.credential,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("authUpdate"));
      navigate("/");
    } catch (error) {
      setApiError(error.response?.data.message || "Google registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    const base = "w-full px-0 py-4 bg-transparent border-b text-sm focus:outline-none transition-all duration-500 placeholder:text-[#2D302D]/20";
    return errors[fieldName]
      ? `${base} border-red-400 text-red-900`
      : `${base} border-[#2D302D]/10 focus:border-[#8DAA9D]`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Side Column Content... (Same as before) */}
      <div className="hidden lg:flex w-1/3 bg-[#2D302D] p-16 flex-col justify-between text-[#FAF9F6]">
        <div className="space-y-4">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            <Shield size={20} className="text-[#8DAA9D]" />
          </div>
          <h2 className="text-3xl font-light tracking-tighter uppercase italic font-serif">
            {step === "register" ? "Create \nAccount." : "Verify \nIdentity."}
          </h2>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <header className="mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">
              {step === "register" ? "Join the Network" : "Security Check"}
            </span>
            <h1 className="text-5xl font-light tracking-tighter uppercase text-[#2D302D]">
              {step === "register" ? "Create Account" : "Enter Code"}
            </h1>
          </header>

          {step === "register" ? (
            <form onSubmit={handleSendOtp} className="space-y-10">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Full Name</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} className={getInputClass("name")} placeholder="John Doe" />
                {errors.name && <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Email Address</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} className={getInputClass("email")} placeholder="name@domain.com" />
                {errors.email && <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Password</label>
                  <input type="password" id="password" value={formData.password} onChange={handleChange} className={getInputClass("password")} placeholder="••••••••" />
                  {errors.password && <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Confirm</label>
                  <input type="password" id="confirm" value={formData.confirm} onChange={handleChange} className={getInputClass("confirm")} placeholder="••••••••" />
                  {errors.confirm && <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">{errors.confirm}</p>}
                </div>
              </div>

              {apiError && <div className="p-4 text-[10px] uppercase tracking-widest font-bold bg-red-50 text-red-600 border border-red-100">{apiError}</div>}

              <button type="submit" disabled={isSubmitting} className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">{isSubmitting ? "Sending OTP..." : "Continue"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
              
              <div className="mt-8 flex flex-col items-center gap-6">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setApiError("Google Sign-up Failed")} shape="square" />
                <button type="button" onClick={() => navigate("/login")} className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">
                  Already have an account? <span className="text-[#8DAA9D]">Sign In</span>
                </button>
                <button type="button" onClick={() => navigate("/clinic-registration")} className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">
                  Are you a healthcare provider? <span className="text-[#8DAA9D]">Register Clinic</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-6 bg-[#2D302D]/5 border border-[#2D302D]/10">
                <div className="flex items-center gap-4 mb-2">
                  <Mail className="text-[#8DAA9D]" size={16} />
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Sent to:</span>
                </div>
                <p className="text-xl font-serif italic text-[#2D302D]">{formData.email}</p>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Enter 6-Digit Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  className="w-full text-center text-4xl tracking-[0.5em] py-8 bg-transparent border-b border-[#2D302D]/10 focus:border-[#8DAA9D] focus:outline-none transition-all duration-500 placeholder:text-[#2D302D]/10 font-light"
                />
                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setStep("register")} className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">
                    <ArrowLeft size={12} /> Wrong Email?
                  </button>
                  <button type="button" onClick={handleSendOtp} className="text-[9px] uppercase tracking-widest font-bold text-[#8DAA9D] hover:underline">
                    Resend Code
                  </button>
                </div>
              </div>

              {apiError && <div className="p-4 text-[10px] uppercase tracking-widest font-bold bg-red-50 text-red-600 border border-red-100">{apiError}</div>}

              <button type="submit" disabled={isSubmitting} className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">{isSubmitting ? "Verifying..." : "Confirm & Register"}</span>
                <CheckCircle size={16} className="group-hover:scale-110 transition-transform duration-500" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;