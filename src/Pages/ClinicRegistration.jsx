import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ClinicRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic: Post to /api/register (Owner + Tenant payload)
    setTimeout(() => {
      setLoading(false);
      navigate("/plans"); // Move to Step 2
    }, 1500);
  };

  const inputGroupStyle = "relative group mb-10";
  const inputStyle = "peer w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors duration-500 placeholder-transparent";
  const labelStyle = "absolute left-0 top-3 text-gray-400 text-[10px] tracking-[0.2em] uppercase transition-all duration-500 pointer-events-none peer-focus:-top-4 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4";

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans antialiased text-[#1a1a1a]">
      
      {/* Editorial Sidebar (Persistent) */}
      <div className="md:w-5/12 bg-[#F9F9F9] p-12 md:p-24 flex flex-col justify-between border-r border-gray-100">
        <div>
          <h2 className="text-[10px] tracking-[0.5em] text-gray-400 uppercase mb-12">Step 01 / Registration</h2>
          <h1 className="text-[5vw] md:text-[4vw] leading-[1.1] font-light tracking-tighter mb-8">
            The future of <br />
            <span className="italic font-serif text-gray-400">clinical management.</span>
          </h1>
          <p className="text-gray-500 font-light text-sm leading-relaxed max-w-xs">
            Register your administrative profile and clinic entity in one seamless motion.
          </p>
        </div>
        
        <div className="hidden md:block">
          <p className="text-[10px] tracking-widest text-gray-300 uppercase">© 2025 HealthBook SaaS</p>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="md:w-7/12 p-12 md:p-24 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit}>
            
            {/* Part A: Tenant Owner (The Person) */}
            <section className="mb-20">
              <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold mb-12 border-b border-gray-100 pb-4">
                01. Personal Identity
              </h3>
              
              <div className={inputGroupStyle}>
                <input type="text" id="ownerName" placeholder=" " required className={inputStyle} />
                <label htmlFor="ownerName" className={labelStyle}>Full Name</label>
              </div>

              <div className={inputGroupStyle}>
                <input type="email" id="email" placeholder=" " required className={inputStyle} />
                <label htmlFor="email" className={labelStyle}>Professional Email</label>
              </div>

              <div className={inputGroupStyle}>
                <input type="password" id="password" placeholder=" " required className={inputStyle} />
                <label htmlFor="password" className={labelStyle}>Create Password</label>
              </div>
            </section>

            {/* Part B: Tenant Registration (The Clinic) */}
            <section className="mb-20">
              <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold mb-12 border-b border-gray-100 pb-4">
                02. Clinic Entity
              </h3>
              
              <div className={inputGroupStyle}>
                <input type="text" id="clinicName" placeholder=" " required className={inputStyle} />
                <label htmlFor="clinicName" className={labelStyle}>Clinic Name</label>
              </div>

              <div className={inputGroupStyle}>
                <div className="flex">
                  <input type="text" id="subdomain" placeholder=" " required className={inputStyle} />
                  <span className="border-b border-gray-200 py-3 text-gray-400 text-xs">.healthbook.pro</span>
                </div>
                <label htmlFor="subdomain" className={labelStyle}>Workspace URL</label>
              </div>

              <div className={inputGroupStyle}>
                <input type="text" id="location" placeholder=" " required className={inputStyle} />
                <label htmlFor="location" className={labelStyle}>Physical Address</label>
              </div>
            </section>

            {/* Final Action */}
            <div className="pt-8">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-6 text-[10px] tracking-[0.4em] uppercase hover:bg-gray-800 transition-all flex justify-between px-10 items-center group"
              >
                <span>{loading ? "Processing..." : "Continue to Plans"}</span>
                <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
              </button>
              
              <p className="mt-12 text-center text-gray-400 text-[10px] tracking-widest uppercase cursor-pointer hover:text-black transition-colors" onClick={() => navigate("/login")}>
                Already registered? Sign In
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ClinicRegistration;