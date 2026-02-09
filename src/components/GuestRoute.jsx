import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {
  // Check for your token (ensure this matches how you store it)
  const token = localStorage.getItem("token")?.replace(/['"]+/g, "");

  // If token exists, redirect to dashboard (or wherever you want)
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Otherwise, allow access to Login/Register
  return <Outlet />;
};

export default GuestRoute;