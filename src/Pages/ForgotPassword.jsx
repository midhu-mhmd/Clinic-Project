import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, RefreshCw, ChevronRight, 
  Building2, User, Stethoscope 
} from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 'choice', 'user', or 'clinic'
  const [view, setView] = useState(location.state?.role || "choice");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Clear messages when switching between Patient/Clinic views
  useEffect(() => {
    setMessage({ text: "", type: "" });
  }, [view]);

  // Handle Logic
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    // Maps to your fixed backend routes
    const endpoint = view === "clinic" 
      ? "http://localhost:5000/api/tenants/forgot-password" 
      : "http://localhost:5000/api/users/forgot-password";

    try {
      const response = await axios.post(endpoint, { email: email.toLowerCase().trim() });
      
      setMessage({ 
        text: response.data.message || "Security code dispatched successfully.", 
        type: "success" 
      });

      // Navigate to reset screen after short delay
      setTimeout(() => {
        // We pass the email and role to the reset page so it knows which API to call
        navigate("/reset-password/:token", { state: { email, role: view } });
      }, 2000);

    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Recovery failed. Please check your connection.", 
        type: "error" 
      });
    } finally { 
      setLoading(false); 
    }
  };

  // --- STYLES BASED ON VIEW ---
  const isClinic = view === "clinic";
  const themeColor = isClinic ? "text-[#8DAA9D]" : "text-[#7B9ACC]";
  const bgColor = isClinic ? "bg-[#2D302D]" : "bg-[#1A1C1E]"; 
  const accentBorder = isClinic ? "border-[#8DAA9D]" : "border-[#7B9ACC]";

  // --- VIEW 1: THE CHOICE SCREEN ---
  if (view === "choice") {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-8">
        <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-4">Identity Verification</h2>
        <h1 className="text-4xl font-light tracking-tighter uppercase mb-12">
          Select your <span className="italic font-serif">portal.</span>
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Patient Card */}
          <button 
            onClick={() => setView("user")} 
            className="group p-12 bg-white border border-gray-100 hover:border-blue-200 transition-all text-left space-y-6 shadow-sm hover:shadow-md"
          >
            <User size={32} className="text-blue-400" />
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Patient Portal</h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">Recover access to your personal health records and appointments.</p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">Enter →</div>
          </button>

          {/* Clinic Card */}
          <button 
            onClick={() => setView("clinic")} 
            className="group p-12 bg-[#2D302D] text-white transition-all text-left space-y-6 hover:bg-[#363a36]"
          >
            <Building2 size={32} className="text-[#8DAA9D]" />
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Clinic Admin</h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">System recovery for healthcare providers and staff members.</p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8DAA9D] flex items-center gap-2">Access Terminal →</div>
          </button>
        </div>
        <button 
          onClick={() => navigate("/login")} 
          className="mt-12 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black font-bold"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  // --- VIEW 2: THE DYNAMIC FORM (PATIENT OR CLINIC) ---
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex animate-in fade-in duration-700">
      {/* SIDEBAR: Changes based on view */}
      <div className={`hidden lg:flex w-1/3 ${bgColor} p-16 flex-col justify-between text-[#FAF9F6] transition-colors duration-1000`}>
        <div className="space-y-6">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            {isClinic ? <Stethoscope size={20} className={themeColor} /> : <User size={20} className={themeColor} />}
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-light tracking-tighter uppercase font-serif italic leading-none">
              {isClinic ? "Clinical" : "Patient"} <br /> Recovery.
            </h2>
            <div className={`h-px w-12 mt-4 ${isClinic ? 'bg-[#8DAA9D]' : 'bg-[#7B9ACC]'}`} />
          </div>
          <p className="text-[10px] tracking-[0.2em] leading-loose opacity-50 uppercase max-w-[220px]">
            {isClinic 
              ? "Admin Access Protocol 0.2: Encrypted Key Dispatch Authorized." 
              : "Patient Safety Protocol 0.1: Verified Identity Confirmation Required."}
          </p>
        </div>
        <div className="text-[9px] uppercase tracking-widest font-bold opacity-30">
          Terminal ID: {isClinic ? "CLINIC-ADM-01" : "PATIENT-USR-99"}
        </div>
      </div>

      {/* FORM AREA */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <button 
            onClick={() => setView("choice")} 
            className="mb-12 text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
          >
            <ArrowLeft size={12} /> Change Portal
          </button>

          <header className="mb-12">
            <span className={`text-[10px] uppercase tracking-[0.5em] font-bold mb-4 block ${themeColor}`}>
              Recovery Phase 01
            </span>
            <h1 className="text-6xl font-light tracking-tighter uppercase text-[#2D302D]">
              {isClinic ? "Admin" : "Secure"} <br /> Reset
            </h1>
          </header>

          <form onSubmit={handleRequestOTP} className="space-y-12">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                {isClinic ? "Professional Work Email" : "Personal Email Address"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-4 bg-transparent border-b border-[#2D302D]/10 text-sm focus:outline-none focus:border-black transition-all placeholder:text-gray-300"
                placeholder="Enter registered email..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${isClinic ? 'bg-[#2D302D]' : 'bg-black'} text-white py-6 flex items-center justify-between px-8 hover:opacity-90 transition-all disabled:opacity-50`}
            >
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                {loading ? "Processing..." : "Dispatch Code"}
              </span>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            </button>

            {message.text && (
              <div className={`p-4 text-[10px] uppercase tracking-widest font-bold border animate-in slide-in-from-top-2 duration-300 ${
                message.type === "success" 
                  ? "bg-green-50 border-green-100 text-green-600" 
                  : "bg-red-50 border-red-100 text-red-600"
              }`}>
                {message.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;