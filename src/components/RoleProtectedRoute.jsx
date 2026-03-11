import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Role-based route guard.
 *
 * @param {string[]} allowedRoles  – Roles permitted to access this route
 * @param {string}   authRedirect  – Where to send unauthenticated users (default "/login")
 * @param {React.ReactNode} children
 */
const RoleProtectedRoute = ({ allowedRoles = [], authRedirect = "/login", children }) => {
  // ── Check for a valid token (either patient or clinic auth flow) ──
  const patientToken = localStorage.getItem("token");
  const clinicToken = localStorage.getItem("authToken");
  const isLoggedIn = !!(patientToken || clinicToken);

  if (!isLoggedIn) {
    return <Navigate to={authRedirect} replace />;
  }

  // ── Resolve the user's role ──
  let role = localStorage.getItem("userRole"); // set by clinic login

  if (!role) {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        role = user?.role;
      }
    } catch {
      // corrupted localStorage — treat as unauthenticated
    }
  }

  // ── Role check ──
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
