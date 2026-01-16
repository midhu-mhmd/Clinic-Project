import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import axios from "axios";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, ShieldCheck } from "lucide-react";

const FloatingInput = ({ label, type = "text", name, value, onChange, id, required = true, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative group mb-8">
      <input
        type={isPassword && showPassword ? "text" : type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className={`peer w-full bg-transparent border-b py-3 text-sm focus:outline-none transition-colors placeholder-transparent text-[#1a1a1a] ${
          error ? "border-red-400" : "border-gray-200 focus:border-black"
        }`}
      />
      <label
        htmlFor={id}
        className="absolute left-0 top-3 text-gray-400 text-[10px] tracking-[0.2em] uppercase transition-all 
                   peer-focus:-top-4 peer-focus:text-black peer-focus:text-[9px]
                   peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[9px]"
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-3 text-gray-400 hover:text-black"
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
      {error && <p className="text-[9px] font-bold text-red-500 mt-1 uppercase tracking-wider">{error}</p>}
    </div>
  );
};

const ClinicRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); 
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    clinicName: "",
    registrationId: "",
    location: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (apiError) setApiError("");
    if (successMsg) setSuccessMsg("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    const payload = {
      owner: {
        name: formData.ownerName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      },
      clinic: {
        name: formData.clinicName,
        registrationId: formData.registrationId,
        address: formData.location,
        image: "https://images.unsplash.com/photo-1629909613654-2871b886daa4",
      },
    };

    try {
      await axios.post("http://localhost:5000/api/tenants/clinic-register", payload);
      setStep("otp");
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 6 || loading) return;

    setLoading(true);
    setApiError("");
    try {
      const res = await axios.post("http://localhost:5000/api/tenants/verify-otp", {
        email: formData.email.trim().toLowerCase(), 
        otp: otp.trim(),
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isLoggedIn", "true");
        navigate("/plans", { replace: true });
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Verification failed.");
      setOtp(""); 
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setApiError("");
    setSuccessMsg("");
    try {
      await axios.post("http://localhost:5000/api/tenants/resend-otp", { 
        email: formData.email 
      });
      setSuccessMsg("A new code has been sent to your email.");
    } catch (err) {
      setApiError("Failed to resend code. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (val.length === 6) {
      handleVerifyOtp();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-[#1a1a1a]">
      {/* Left Panel */}
      <div className="md:w-5/12 bg-[#F9F9F9] p-12 md:p-20 border-r border-gray-100 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gray-200 rounded-full blur-3xl opacity-20"></div>
        <div>
          <h2 className="text-[10px] tracking-[0.4em] text-gray-400 uppercase mb-12 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-gray-300"></span> Step {step === "details" ? "01" : "02"}
          </h2>
          <h1 className="text-4xl md:text-5xl leading-[1.1] font-light mb-8 italic font-serif">
            {step === "details" ? "Start your workspace." : "Confirm your identity."}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            {step === "details" 
              ? "Setup your facility profile and administrator account to begin." 
              : "We've sent a 6-digit verification code to your registered email address."}
          </p>
          {/* Subtle Login Link for Left Panel */}
          {step === "details" && (
            <div className="mt-12">
              <Link to="/clinic-login" className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:opacity-60 transition-all">
                Existing Account? Login
              </Link>
            </div>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400">© 2026 MEDICARE SYSTEMS</p>
      </div>

      {/* Right Panel */}
      <div className="md:w-7/12 p-8 md:p-24 flex items-center justify-center overflow-y-auto">
        <div className="max-w-md w-full">
          {apiError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3">
              <AlertCircle size={14} /> {apiError}
            </div>
          )}
          
          {successMsg && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3">
              <CheckCircle2 size={14} /> {successMsg}
            </div>
          )}

          {step === "details" ? (
            <form onSubmit={handleRegister} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="mb-12">
                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-300 mb-8 flex items-center gap-3">
                  <ShieldCheck size={14} /> Administrator
                </h3>
                <FloatingInput label="Full Name" name="ownerName" id="ownerName" value={formData.ownerName} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-x-8">
                  <FloatingInput label="Email Address" name="email" id="email" type="email" value={formData.email} onChange={handleChange} />
                  <FloatingInput label="Phone" name="phone" id="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <FloatingInput label="Security Password" name="password" id="password" type="password" value={formData.password} onChange={handleChange} />
              </section>

              <section className="mb-12">
                <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-300 mb-8 flex items-center gap-3">
                  <CheckCircle2 size={14} /> Facility Details
                </h3>
                <FloatingInput label="Clinic Name" name="clinicName" id="clinicName" value={formData.clinicName} onChange={handleChange} />
                <FloatingInput label="Registration ID" name="registrationId" id="registrationId" value={formData.registrationId} onChange={handleChange} />
                <FloatingInput label="Full Address" name="location" id="location" value={formData.location} onChange={handleChange} />
              </section>

              <button type="submit" disabled={loading} className="group w-full bg-[#1a1a1a] text-white h-16 text-[10px] tracking-[0.4em] uppercase flex justify-between items-center px-10 hover:bg-emerald-900 transition-all">
                <span>{loading ? "Initializing..." : "Register & Verify"}</span>
                {loading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : <ArrowRight size={16} />}
              </button>

              {/* Mobile Login Option */}
              <div className="mt-8 text-center md:hidden">
                <Link to="/clinic-login" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black">
                   Already registered? <span className="font-bold text-black ml-1">Login here</span>
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="animate-in fade-in slide-in-from-right-4 duration-700">
               <div className="p-8 bg-gray-50 border border-gray-100 mb-12">
                <div className="flex items-center gap-4 mb-2">
                  <Mail className="text-emerald-600" size={16} />
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Code sent to:</span>
                </div>
                <p className="text-xl font-serif italic text-black">{formData.email}</p>
              </div>

              <div className="space-y-4 mb-12">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">6-Digit Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  className="w-full text-center text-5xl tracking-[0.4em] py-6 bg-transparent border-b border-gray-200 focus:border-black focus:outline-none transition-all font-light"
                />
                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => setStep("details")} className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">
                    <ArrowLeft size={12} /> Edit Details
                  </button>
                  <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={loading}
                    className="text-[9px] uppercase tracking-widest font-bold text-emerald-700 hover:underline disabled:opacity-30"
                  >
                    {loading ? "Sending..." : "Resend Code"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="group w-full bg-[#1a1a1a] text-white h-16 text-[10px] tracking-[0.4em] uppercase flex justify-between items-center px-10 hover:bg-black transition-all">
                <span>{loading ? "Verifying..." : "Complete Setup"}</span>
                {loading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : <CheckCircle2 size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicRegistration;