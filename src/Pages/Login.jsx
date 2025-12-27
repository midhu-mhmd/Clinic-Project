import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Key, ArrowRight, ShieldCheck, Fingerprint } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Protocol: Authenticate and propagate state
    localStorage.setItem("isLoggedIn", "true");
    window.dispatchEvent(new Event("authUpdate"));
    navigate("/");
  };

  const inputClass = "w-full px-0 py-4 bg-transparent border-b border-[#2D302D]/10 text-sm focus:outline-none focus:border-[#8DAA9D] transition-all duration-500 placeholder:text-[#2D302D]/20";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      
      {/* LEFT COLUMN: BRANDING & SECURITY (Desktop Only) */}
      <div className="hidden lg:flex w-1/3 bg-[#2D302D] p-16 flex-col justify-between text-[#FAF9F6]">
        <div className="space-y-6">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            <Key size={20} className="text-[#8DAA9D]" />
          </div>
          <h2 className="text-4xl font-light tracking-tighter uppercase font-serif italic leading-none">
            Authorized <br /> Entry.
          </h2>
          <p className="text-xs tracking-widest leading-loose opacity-50 uppercase max-w-[200px]">
            Accessing the clinical data layer and AI health architecture.
          </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#2D302D] bg-[#8DAA9D]/20" />
              ))}
           </div>
           <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">12k+ Verified Users</span>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERFACE */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <header className="mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">Portal Access — 02</span>
            <h1 className="text-5xl font-light tracking-tighter uppercase text-[#2D302D]">Welcome Back</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-2 relative">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Account Email</label>
              <input 
                type="email" 
                id="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="name@domain.com" 
                className={inputClass} 
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">Passphrase</label>
                <button 
                   type="button"
                   onClick={() => navigate("/forgot-password")}
                   className="text-[9px] uppercase tracking-widest font-bold text-[#8DAA9D] hover:text-[#2D302D] transition-colors"
                >
                  Reset Key
                </button>
              </div>
              <input 
                type="password" 
                id="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                className={inputClass} 
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 border-[#2D302D]/10 rounded-none checked:bg-[#8DAA9D] focus:ring-0 transition-all"
                />
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity">Persist Session</span>
              </label>
            </div>

            <button type="submit" className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Authenticate</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </form>

          <div className="mt-16 pt-12 border-t border-[#2D302D]/5 space-y-8">
            <button className="w-full py-4 border border-[#2D302D]/10 flex items-center justify-center gap-4 hover:bg-[#2D302D] hover:text-[#FAF9F6] transition-all group">
               <Fingerprint size={16} className="text-[#8DAA9D]" />
               <span className="text-[10px] uppercase tracking-widest font-bold">Continue with Google</span>
            </button>
            
            <div className="flex justify-center">
              <button 
                onClick={() => navigate("/register")} 
                className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity"
              >
                No Credentials? <span className="text-[#8DAA9D]">Initialize Registry</span>
              </button>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 opacity-20">
             <ShieldCheck size={14} />
             <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Secure Socket Layer Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;