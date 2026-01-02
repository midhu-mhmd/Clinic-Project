import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Shield, Lock, ArrowRight, User, Mail, Phone } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});

  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^\+?[\d\s-]{10,}$/,
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!patterns.email.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (!patterns.password.test(formData.password))
      newErrors.password =
        "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character";
    if (formData.confirm !== formData.password)
      newErrors.confirm = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/users/register", formData);
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("authUpdate"));
      navigate("/");
    } catch (error) {
      setApiError(
        error.response?.data.message || "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await axios.post("http://localhost:5000/api/users/google", {
        credential: response.credential,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("authUpdate"));
      navigate("/");
    } catch (error) {
      setApiError(error.response?.data.message || "Google registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    const base =
      "w-full px-0 py-4 bg-transparent border-b text-sm focus:outline-none transition-all duration-500 placeholder:text-[#2D302D]/20";
    return errors[fieldName]
      ? `${base} border-red-400 text-red-900`
      : `${base} border-[#2D302D]/10 focus:border-[#8DAA9D]`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Visual Side Column */}
      <div className="hidden lg:flex w-1/3 bg-[#2D302D] p-16 flex-col justify-between text-[#FAF9F6]">
        <div className="space-y-4">
          <div className="w-12 h-12 border border-[#FAF9F6]/20 flex items-center justify-center">
            <Shield size={20} className="text-[#8DAA9D]" />
          </div>
          <h2 className="text-3xl font-light tracking-tighter uppercase italic font-serif">
            Create <br /> Account.
          </h2>
        </div>
        <div className="space-y-8 opacity-40">
          <div className="text-[9px] uppercase tracking-[0.4em] font-bold">
            Encrypted Connection
          </div>
          <div className="text-[9px] uppercase tracking-[0.4em] font-bold">
            Secure Data Storage
          </div>
          <div className="text-[9px] uppercase tracking-[0.4em] font-bold">
            Verified Medical Network
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="max-w-md w-full">
          <header className="mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D] mb-4 block">
              Join the Network
            </span>
            <h1 className="text-5xl font-light tracking-tighter uppercase text-[#2D302D]">
              Create Account
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={getInputClass("name")}
              />
              {errors.name && (
                <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@domain.com"
                className={getInputClass("email")}
              />
              {errors.email && (
                <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={getInputClass("password")}
                />
                {errors.password && (
                  <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm"
                  value={formData.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={getInputClass("confirm")}
                />
                {errors.confirm && (
                  <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">
                    {errors.confirm}
                  </p>
                )}
              </div>
            </div>

            {apiError && (
              <div className="p-4 text-[10px] uppercase tracking-widest font-bold bg-red-50 text-red-600 border border-red-100">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full bg-[#2D302D] text-[#FAF9F6] py-6 flex items-center justify-between px-8 hover:bg-[#8DAA9D] transition-all duration-700"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
                {isSubmitting ? "Creating Account..." : "Register Now"}
              </span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-2 transition-transform duration-500"
              />
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-[#2D302D]/5 flex flex-col items-center gap-8">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setApiError("Google Sign-up Failed")}
              theme="outline"
              shape="square"
              width="300"
            />

            <button
              onClick={() => navigate("/login")}
              className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity"
            >
              Already have an account?{" "}
              <span className="text-[#8DAA9D]">Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
