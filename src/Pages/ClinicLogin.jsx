import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ClinicLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Detect if user just finished payment
  const isFromPayment = location.state?.registered;

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Simulate Auth
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      // 2. Alert the Navbar
      window.dispatchEvent(new Event("authUpdate"));
      // 3. Enter Dashboard
      navigate("/dashboard");
    }, 1500);
  };

  const inputStyle =
    "peer w-full bg-transparent border-b border-gray-200 py-4 text-sm focus:outline-none focus:border-black transition-all duration-500 placeholder-transparent font-light";
  const labelStyle =
    "absolute left-0 top-4 text-gray-400 text-[10px] tracking-[0.2em] uppercase transition-all duration-500 pointer-events-none peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 font-sans antialiased text-[#1a1a1a]">
      <div className="w-full max-w-250 grid md:grid-cols-2 gap-20 items-center">
        {/* Left Side: Editorial Branding */}
        <div className="hidden md:block">
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-8">
            Access Portal
          </h2>
          <h1 className="text-[5vw] leading-[1.1] font-light tracking-tighter mb-8">
            Welcome back to <br />
            <span className="italic font-serif text-gray-400">
              your workspace.
            </span>
          </h1>
          <div className="h-px w-12 bg-black mb-8 opacity-20"></div>
          <p className="text-gray-400 text-sm font-light max-w-70 leading-relaxed">
            Enter your credentials to manage your clinic and AI patient
            interactions.
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-sm mx-auto md:mx-0">
          {isFromPayment && (
            <div className="mb-10 p-4 bg-gray-50 border-l-2 border-black animate-pulse">
              <p className="text-[10px] tracking-widest uppercase font-bold text-black">
                Success: Account & Plan Activated.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="relative group">
              <input
                type="email"
                id="email"
                placeholder=" "
                required
                className={inputStyle}
              />
              <label htmlFor="email" className={labelStyle}>
                Work Email
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                id="password"
                placeholder=" "
                required
                className={inputStyle}
              />
              <label htmlFor="password" className={labelStyle}>
                Password
              </label>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] tracking-widest text-gray-400 uppercase cursor-pointer hover:text-black transition-colors">
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-6 text-[10px] tracking-[0.4em] uppercase hover:bg-gray-800 transition-all flex justify-between px-10 items-center group"
            >
              <span>{loading ? "Authorizing..." : "Sign In"}</span>
              <span className="group-hover:translate-x-2 transition-transform duration-500 font-light text-xl">
                →
              </span>
            </button>
          </form>

          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
            <p className="text-[10px] tracking-widest text-gray-400 uppercase">
              New Organization?
            </p>
            <button
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
