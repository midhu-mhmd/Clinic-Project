import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);
    // Add password reset logic here
    setSubmitted(true);

    // Reset after 5 seconds for demo purposes
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Minimal header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-6 border border-gray-100">
            {submitted ? (
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-normal text-gray-900 tracking-tight">
            {submitted ? "Check Your Email" : "Reset Password"}
          </h1>

          <p className="mt-3 text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            {submitted
              ? `We've sent reset instructions to ${email}`
              : "Enter your email and we'll send you reset instructions."}
          </p>
        </div>

        {!submitted ? (
          <>
            {/* Reset form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 text-sm placeholder:text-gray-400 transition-all duration-200"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Security note */}
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
                <span>
                  The reset link will expire in 24 hours for security.
                </span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-normal text-sm hover:bg-gray-800 active:scale-[0.99] transition-all duration-200"
              >
                Send Reset Instructions
              </button>
            </form>

            {/* Back to login link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 text-sm text-gray-700 font-normal hover:text-gray-900 transition bg-transparent p-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="space-y-6">
            {/* Success message */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Reset email sent
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-normal text-sm hover:bg-gray-800 active:scale-[0.99] transition-all duration-200"
              >
                Resend Email
              </button>

              <a
                href="#"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3.5 rounded-xl hover:border-gray-300 transition text-sm font-normal text-gray-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Return to Login
              </a>
            </div>

            {/* Help text */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Still having trouble?{" "}
                <a
                  href="#"
                  className="text-gray-700 font-normal hover:text-gray-900 transition"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="text-center mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 space-x-3">
            <a href="#" className="hover:text-gray-600 transition">
              Terms
            </a>
            <span>·</span>
            <a href="#" className="hover:text-gray-600 transition">
              Privacy
            </a>
            <span>·</span>
            <a href="#" className="hover:text-gray-600 transition">
              Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
