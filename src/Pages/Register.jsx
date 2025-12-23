import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Minimal header with subtle branding */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-normal text-gray-900 tracking-tight">
            Create Account
          </h1>
          <p className="mt-3 text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Secure access to AI health guidance and appointment management.
          </p>
        </div>

        {/* Streamlined form with minimal visual noise */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
              />
            </div>

            <div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
              />
            </div>

            <div>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (8+ characters)"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
              />
            </div>

            <div>
              <input
                type="password"
                id="confirm"
                value={formData.confirm}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Simplified security note */}
          <div className="flex items-start gap-2 text-xs text-gray-500 pt-2">
            <div className="mt-0.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span>All data is encrypted and securely stored.</span>
          </div>

          {/* Primary action with subtle hover effect */}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-normal text-sm hover:bg-gray-800 active:scale-[0.99] transition-all duration-200"
          >
            Create Account
          </button>
        </form>

        {/* Minimal divider */}
        <div className="my-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-gray-400 font-light">
              OR
            </span>
          </div>
        </div>

        {/* Social login with minimal styling */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3.5 rounded-xl hover:border-gray-300 transition text-sm font-normal text-gray-700">
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.55-.22-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-7.79z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H.57v2.86C2.37 20.26 6.66 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H.57C-.13 8.93 0 10.93 0 13s.13 4.07.57 5.93l5.27-4.84z"
            />
            <path
              fill="currentColor"
              d="M12 6.75c1.62 0 3.06 1.11 3.56 1.64l2.66-2.66C15.77 3.61 13.5 2.75 12 2.75c-3.34 0-6.67 1.8-8.33 4.93l5.27 4.84C10.71 9.92 11.86 6.75 12 6.75z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Subtle footer links */}
        <div className="text-center mt-10 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-gray-700 font-normal hover:text-gray-900 transition bg-transparent p-0"
            >
              Sign in
            </button>
          </p>
          <p className="mt-4 text-xs text-gray-400 space-x-3">
            <a href="#" className="hover:text-gray-600 transition">
              Terms
            </a>
            <span>·</span>
            <a href="#" className="hover:text-gray-600 transition">
              Privacy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
