import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * GuestRoute Guard
 * Redirects authenticated users away from "Guest-only" pages (Login/Register)
 */
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token")?.replace(/['"]+/g, '');
  const location = useLocation();

  if (token) {
    // If the user is logged in, redirect them to the dashboard.
    // We use "replace" so they can't go back to the login page with the back button.
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
};

export default GuestRoute;