import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ClinicOwnerRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Passwords mismatch");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/owner/register", formData);
      navigate("/login");
    } catch (err) {
      alert("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-8 font-sans antialiased text-[#1a1a1a]">
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-20 items-center">
        
        {/* Left Side: Editorial Content */}
        <div className="hidden md:block">
          <h2 className="text-[12px] uppercase tracking-[0.3em] text-gray-400 font-medium mb-8">
            Business Solutions / 01
          </h2>
          <h1 className="text-[56px] leading-[1.1] font-light tracking-tight mb-8">
            Empower your <br />
            <span className="italic font-serif">medical practice.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-[320px] leading-relaxed font-light">
            An sophisticated ecosystem designed for clinic owners who value precision and patient care.
          </p>
        </div>

        {/* Right Side: Minimal Form */}
        <div className="w-full max-w-[400px]">
          <div className="mb-12">
            <h3 className="text-2xl font-normal mb-2">Create Administrative Account</h3>
            <p className="text-gray-400 text-sm">Step 01: Personal Details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
              <input
                type="text"
                id="fullName"
                placeholder=" "
                required
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-black transition-colors duration-300 placeholder-transparent"
              />
              <label htmlFor="fullName" className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                FULL NAME
              </label>
            </div>

            <div className="relative group">
              <input
                type="email"
                id="email"
                placeholder=" "
                required
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-black transition-colors duration-300 placeholder-transparent"
              />
              <label htmlFor="email" className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                WORK EMAIL
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                id="password"
                placeholder=" "
                required
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-black transition-colors duration-300 placeholder-transparent"
              />
              <label htmlFor="password" className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                PASSWORD
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                id="confirmPassword"
                placeholder=" "
                required
                onChange={handleChange}
                className="peer w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-black transition-colors duration-300 placeholder-transparent"
              />
              <label htmlFor="confirmPassword" className="absolute left-0 top-3 text-gray-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                CONFIRM PASSWORD
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 px-8 text-[13px] tracking-widest uppercase hover:bg-[#222] transition-all duration-300 mt-4 flex justify-between items-center group"
            >
              <span>{loading ? "Registering..." : "Create Account"}</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </form>

          <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8">
            <span className="text-gray-400 text-xs">ALREADY REGISTERED?</span>
            <button 
              onClick={() => navigate("/login")}
              className="text-black text-xs font-bold tracking-widest uppercase hover:underline underline-offset-4"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicOwnerRegister;