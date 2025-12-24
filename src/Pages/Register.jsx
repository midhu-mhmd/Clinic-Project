import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

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

  // State to hold validation errors
  const [errors, setErrors] = useState({});

  // Regex patterns for validation
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Password: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    password:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^\+?[\d\s-]{10,}$/, // Basic phone validation (10+ digits, optional formatting)
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });

    // Optional: Clear error for a specific field when user starts typing again
    if (errors[e.target.id]) {
      setErrors({
        ...errors,
        [e.target.id]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name Validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email Validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!patterns.email.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone Validation (Optional but checked if entered)
    if (formData.phone && !patterns.phone.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!patterns.password.test(formData.password)) {
      newErrors.password =
        "Password must contain 8+ chars, 1 uppercase, 1 number, and 1 special char.";
    }

    // Confirm Password Validation
    if (formData.confirm !== formData.password) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const response = await axios.post(
          "http://localhost:5000/api/users/register",
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }
        );

        console.log("Registration Successful:", response.data);
        navigate("/login");
      } catch (error) {
        console.error("Axios Error:", error);

        // Backend error message (like email already exists)
        if (error.response) {
          setApiError(error.response.data.message || "Registration failed");
        } else {
          // Network / server down
          setApiError("Server is not responding. Please try again later.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Helper to determine input border color
  const getInputClass = (fieldName) => {
    const baseClass =
      "w-full px-4 py-3.5 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white text-sm placeholder:text-gray-400 transition-all duration-200";
    return errors[fieldName]
      ? `${baseClass} border-red-500 focus:border-red-500` // Error state
      : `${baseClass} border-gray-200 focus:border-gray-300`; // Normal state
  };
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/google", {
        credential: credentialResponse.credential,
      });

      console.log("Google auth success:", res.data);
      navigate("/");
    } catch (error) {
      console.error("Google OAuth Error:", error);
      setApiError("Google authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Minimal header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-normal text-gray-900 tracking-tight">
            Create Account
          </h1>
          <p className="mt-3 text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Secure access to AI health guidance and appointment management.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className={getInputClass("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 pl-1">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className={getInputClass("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 pl-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
                className={getInputClass("phone")}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 pl-1">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (8+ chars, 1 Upper, 1 Special)"
                className={getInputClass("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 pl-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <input
                type="password"
                id="confirm"
                value={formData.confirm}
                onChange={handleChange}
                placeholder="Confirm password"
                className={getInputClass("confirm")}
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-500 pl-1">
                  {errors.confirm}
                </p>
              )}
            </div>
          </div>

          {/* Security Note */}
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
          {apiError && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {apiError}
            </div>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting} // Disable button while loading
            className="w-full bg-gray-900 text-white py-4 rounded-xl..."
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider and Social Login (Unchanged) */}
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

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setApiError("Google Login Failed")}
            theme="outline"
            size="large"
            width="350"
          />
        </div>

        {/* Footer Links */}
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
