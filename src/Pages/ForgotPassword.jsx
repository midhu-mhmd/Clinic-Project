import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, ArrowLeft, Mail, ShieldAlert, RefreshCw, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Protocol: Initiate Recovery Sequence
    setSubmitted(true);
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => setIsResending(false), 2000);
  };

  const inputClass = "w-full px-0 py-4 bg-transparent border-b border-[#2D302D]/10 text-sm focus:outline-none focus:border-[#8DAA9D] transition-all duration-500 placeholder:text-[#2D302D]/20";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      
      {/* LEFT COLUMN: SYSTEM STATUS (Desktop Only) */}
      <div className="hidden lg:flex w-1/3 bg-[#2D302D] p-16 flex-col justify-between text-[#FAF9F6]">
        <div className="space-y-6">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            {submitted ? (
              <CheckCircle2 size={20} className="text-[#8DAA9D] animate-pulse" />
            ) : (
              <ShieldAlert size={20} className="text-[#8DAA9D]" />
            )}
          </div>
          <h2 className="text-4xl font-light tracking-tighter uppercase font-serif italic leading-none">
            Recovery <br /> Sequence.
          </h2>
          <p className="text-xs tracking-widest leading-loose opacity-50 uppercase max-w-[220px]">
            Verifying identity endpoint to restore clinical access keys.
          </p>
        </div>

        <div className="space-y-4">
           <div className="h-[1px] w-full bg-[#FAF9F6]/10" />
           <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
              <span>Security Tier 01</span>
              <span>Encrypted</span>
           </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERFACE */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          {!submitted ? (
            <>
              <header className="mb-16">
                <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">Recovery — 03</span>
                <h1 className="text-5xl font-light tracking-tighter uppercase text-[#2D302D]">Reset Access</h1>
                <p className="mt-6 text-[#2D302D]/50 text-sm leading-relaxed max-w-sm">
                  Identify your registered communication endpoint to receive a secure recovery link.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-2 relative">
                  <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Registered Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@domain.com" 
                    className={inputClass} 
                    required
                  />
                </div>

                <div className="flex items-center gap-3 text-[#2D302D]/40 italic">
                  <Key size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Link expires in 24 hours</span>
                </div>

                <button type="submit" className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Send Instructions</span>
                  <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                </button>
              </form>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="mb-12">
                <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">Status: Dispatched</span>
                <h1 className="text-5xl font-light tracking-tighter uppercase text-[#2D302D]">Check Inbox</h1>
                <div className="mt-8 p-6 bg-[#8DAA9D]/10 border-l-2 border-[#8DAA9D]">
                  <p className="text-[#2D302D] text-sm leading-relaxed">
                    A secure protocol link has been routed to: <br />
                    <strong className="font-bold">{email}</strong>
                  </p>
                </div>
              </header>

              <div className="space-y-4">
                <button 
                  onClick={handleResend}
                  className="w-full py-5 border border-[#2D302D]/10 flex items-center justify-center gap-4 hover:bg-[#2D302D] hover:text-[#FAF9F6] transition-all"
                >
                  <RefreshCw size={16} className={isResending ? "animate-spin text-[#8DAA9D]" : "text-[#8DAA9D]"} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    {isResending ? "Re-routing..." : "Resend Protocol"}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-16 pt-12 border-t border-[#2D302D]/5">
            <button 
              onClick={() => navigate("/login")} 
              className="group flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-all"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
 
