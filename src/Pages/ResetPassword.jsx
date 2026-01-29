import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Lock,
  CheckCircle2,
} from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Capture context from ForgotPassword.jsx
  // IMPORTANT: 'view' determines the backend endpoint AND the redirect page
  const email = location.state?.email || "";
  const view = location.state?.view || "user"; 

  // UI & Form States
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Credentials do not match.");
      return;
    }

    setLoading(true);

    // 2. LOGIC SEPARATION
    // If view is clinic, we use the tenant API and go to clinic-login
    // If view is user, we use the user API and go to patient login
    const isClinicFlow = view === "clinic";
    console.log("DEBUG PAYLOAD:", { email, otp, newPassword });
    const endpoint = isClinicFlow 
      ? "http://localhost:5000/api/tenants/reset-password" 
      : "http://localhost:5000/api/users/reset-password-otp";

    const redirectPath = isClinicFlow ? "/login" : "/clinic-login";

    try {
      await axios.post(endpoint, {
        email,
        otp,
        newPassword,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate(redirectPath);
      }, 3000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired recovery code."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-0 py-4 bg-transparent border-b border-[#2D302D]/10 text-sm focus:outline-none focus:border-[#8DAA9D] transition-all duration-500 placeholder:text-[#2D302D]/20";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">

      <div className="hidden lg:flex w-1/3 bg-[#2D302D] p-16 flex-col justify-between text-[#FAF9F6]">
        <div className="space-y-6">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            {success ? (
              <CheckCircle2 size={20} className="text-[#8DAA9D]" />
            ) : (
              <ShieldCheck size={20} className="text-[#8DAA9D] animate-pulse" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-light tracking-tighter uppercase font-serif italic leading-none">
              Restoration <br /> Sequence.
            </h2>
            <div className="h-px w-12 bg-[#8DAA9D] mt-4" />
          </div>
          <p className="text-[10px] tracking-[0.2em] leading-loose opacity-50 uppercase max-w-55">
            System Identity: {view === "clinic" ? "Clinic Administrator" : "Patient Portal"} <br />
            Credential overwrite in progress.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${timer > 0 ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-50">
              Code expires in: {formatTime(timer)}
            </span>
          </div>
        </div>
      </div>

      {/* FORM INTERFACE */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <header className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">
              {view === "clinic" ? "Clinic" : "Patient"} Authentication — Step 02
            </span>
            <h1 className="text-6xl font-light tracking-tighter uppercase text-[#2D302D]">
              Verify <br /> Identity
            </h1>
          </header>

          {success ? (
            <div className="bg-[#8DAA9D]/5 p-8 border border-[#8DAA9D]/20 animate-in fade-in zoom-in duration-700">
              <ShieldCheck className="text-[#8DAA9D] mb-4" size={32} />
              <p className="text-sm text-[#2D302D] font-medium uppercase tracking-tight leading-relaxed">
                Update Successful. <br />
                Redirecting to <b>{view === "clinic" ? "Clinic Login" : "Patient Login"}</b>...
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Verification Code</label>
                <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} className={inputClass} placeholder="000000" required />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">New Access Key</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Confirm Access Key</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
              </div>

              <div className="space-y-6 pt-4">
                <button type="submit" disabled={loading || timer === 0} className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700 disabled:opacity-30">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                    {loading ? "Verifying..." : "Confirm Update"}
                  </span>
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 flex items-center gap-3">
                    <ShieldAlert size={14} className="text-red-600" />
                    <p className="text-red-600 text-[9px] uppercase font-bold tracking-widest">{error}</p>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;