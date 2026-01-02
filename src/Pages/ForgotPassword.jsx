import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Local UI States
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // 1. Call Backend to trigger OTP email
      const response = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        {
          email,
        }
      );

      setMessage({
        text: "Security code dispatched successfully.",
        type: "success",
      });

      // 2. Industry Standard: Delay navigation slightly so user sees the success message
      setTimeout(() => {
        // We pass the 'email' in the state object so ResetPassword.jsx can use it
        navigate("/reset-password/:token", { state: { email } });
      }, 1500);
    } catch (err) {
      // Handling errors gracefully
      const errorMsg =
        err.response?.data?.message || "Internal system error. Try again.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Shared Design Constants
  const inputClass =
    "w-full px-0 py-4 bg-transparent border-b border-[#2D302D]/10 text-sm focus:outline-none focus:border-[#8DAA9D] transition-all duration-500 placeholder:text-[#2D302D]/20";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* LEFT COLUMN: SYSTEM STATUS SIDEBAR */}
      <div className="hidden lg:flex w-1/3 bg-[#2D302D] p-16 flex-col justify-between text-[#FAF9F6]">
        <div className="space-y-6">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            <ShieldAlert size={20} className="text-[#8DAA9D]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-light tracking-tighter uppercase font-serif italic leading-none">
              Identity <br /> Verification.
            </h2>
            <div className="h-px w-12 bg-[#8DAA9D] mt-4" />
          </div>
          <p className="text-[10px] tracking-[0.2em] leading-loose opacity-50 uppercase max-w-55">
            Protocol 01: Requesting temporary cryptographic access key via
            registered endpoint.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 opacity-30">
            <div className="w-2 h-2 rounded-full bg-[#8DAA9D] animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-bold">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERFACE */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <header className="mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">
              Authentication Recovery — Step 01
            </span>
            <h1 className="text-6xl font-light tracking-tighter uppercase text-[#2D302D]">
              Lost <br /> Access?
            </h1>
          </header>

          <form onSubmit={handleRequestOTP} className="space-y-12">
            <div className="space-y-2 relative">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="email@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-6">
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700 disabled:opacity-50"
              >
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                  {loading ? "Initializing..." : "Request Security Code"}
                </span>
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-2 transition-transform duration-500"
                  />
                )}
              </button>

              {/* MESSAGE FEEDBACK */}
              {message.text && (
                <div
                  className={`p-4 text-[10px] uppercase tracking-widest font-bold border animate-in fade-in slide-in-from-top-2 duration-500 ${
                    message.type === "success"
                      ? "bg-green-50 border-green-100 text-green-600"
                      : "bg-red-50 border-red-100 text-red-600"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          </form>

          {/* FOOTER NAVIGATION */}
          <div className="mt-20 pt-12 border-t border-[#2D302D]/5 flex justify-between items-center">
            <button
              onClick={() => navigate("/login")}
              className="group flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-all"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Login
            </button>
            <span className="text-[9px] font-bold opacity-20 uppercase tracking-tighter underline">
              Secure Terminal 2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
