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

  // 1. Protection: If user manually types /reset-password without an email state, send them back
  const email = location.state?.email || "";

  // UI & Form States
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300); // 5-minute countdown for OTP validity

  // 2. Security Check & Timer Logic
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

    // Validation
    if (newPassword !== confirmPassword) {
      setError("Credentials do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/reset-password-otp", {
        email,
        otp,
        newPassword,
      });

      setSuccess(true);
      // Redirect to login after a brief success display
      setTimeout(() => navigate("/login"), 3000);
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
      {/* LEFT COLUMN: SYSTEM STATUS SIDEBAR */}
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
            Protocol 02: Cryptographic key verification and credential overwrite
            in progress.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-2 h-2 rounded-full ${
                timer > 0 ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            />
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-50">
              Code expires in: {formatTime(timer)}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERFACE */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <header className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">
              Authentication Recovery — Step 02
            </span>
            <h1 className="text-6xl font-light tracking-tighter uppercase text-[#2D302D]">
              Verify <br /> Identity
            </h1>
            <p className="text-[10px] text-[#2D302D]/40 mt-6 uppercase tracking-widest leading-relaxed">
              We've dispatched a code to <br />
              <span className="text-[#2D302D] font-bold">{email}</span>
            </p>
          </header>

          {success ? (
            <div className="bg-[#8DAA9D]/5 p-8 border border-[#8DAA9D]/20 animate-in fade-in zoom-in duration-700">
              <ShieldCheck className="text-[#8DAA9D] mb-4" size={32} />
              <p className="text-sm text-[#2D302D] font-medium uppercase tracking-tight leading-relaxed">
                Vault access restored. <br />
                Your security credentials have been updated. <br />
                <span className="text-[10px] opacity-50 block mt-4">
                  Redirecting to terminal...
                </span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-8">
              {/* OTP INPUT */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={inputClass}
                  placeholder="000000"
                  required
                />
              </div>

              {/* NEW PASSWORD INPUT */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                  New Access Key
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* CONFIRM PASSWORD INPUT */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                  Confirm Access Key
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-6 pt-4">
                <button
                  type="submit"
                  disabled={loading || timer === 0}
                  className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700 disabled:opacity-30"
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                    {loading ? "Verifying..." : "Update Vault Key"}
                  </span>
                  {loading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 flex items-center gap-3">
                    <ShieldAlert size={14} className="text-red-600" />
                    <p className="text-red-600 text-[9px] uppercase font-bold tracking-widest">
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </form>
          )}

          <div className="mt-16 pt-12 border-t border-[#2D302D]/5">
            <button
              onClick={() => navigate("/forgot-password")}
              className="group flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-all"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Request New Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
