import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // === THIS IS THE CRITICAL FIX ===
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", formData);

    // 1. Save the login state to browser storage
    localStorage.setItem("isLoggedIn", "true");

    // 2. TRIGGER THE NAVBAR TO UPDATE INSTANTLY
    window.dispatchEvent(new Event("authUpdate"));

    // 3. Navigate to home
    navigate("/");
  };
  // ===============================

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Minimal header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-6 border border-gray-100">
            <span className="text-gray-900 text-lg font-normal">→</span>
          </div>
          <h1 className="text-2xl font-normal text-gray-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-3 text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Sign in to access your AI health companion and appointments.
          </p>
        </div>

        {/* Clean form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
                autoComplete="email"
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-300"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-gray-700 hover:text-gray-900 transition font-normal bg-transparent p-0"
            >
              Forgot password?
            </button>
          </div>

          {/* Login button - Removed onClick, logic is now in handleSubmit */}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-normal text-sm hover:bg-gray-800 active:scale-[0.99] transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-gray-400 font-light">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        {/* Social login */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3.5 rounded-xl hover:border-gray-300 transition text-sm font-normal text-gray-700 mb-8">
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
          Google
        </button>

        {/* Sign up link */}
        <div className="text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <a
              onClick={() => navigate("/register")}
              className="text-gray-700 font-normal hover:text-gray-900 cursor-pointer transition"
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
