import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Home from "./Pages/Home.jsx";
import Register from "./Pages/Register.jsx";
import Login from "./Pages/Login.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import ClinicList from "./Pages/ClinicList.jsx";
import DoctorList from "./Pages/DoctorList.jsx";
import ClinicProfile from "./Pages/ClinicProfile.jsx";
import DoctorProfile from "./Pages/DoctorProfile.jsx";
import ClinicRegistration from "./Pages/ClinicRegistration.jsx";
import SaaSPlans from "./Pages/SaaSPlans.jsx";
import Payment from "./Pages/Payment.jsx";
import ClinicLogin from "./Pages/ClinicLogin.jsx";
import Help from "./Pages/Help.jsx";
import TenantDashboard from "./Pages/ClinicDashboard.jsx";
import AppointmentPage from "./Pages/Appointment.jsx";

const App = () => {
  const location = useLocation();

  // Paths that should not have the main public Navbar/Footer
  // We check if it starts with /dashboard or other clinic-specific auth pages
  const noNavPaths = [
    "/dashboard",
    "/clinic-login",
    "/clinic-registration",
    "/plans",
    "/payment",
  ];

  const isClinicSide = noNavPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!isClinicSide && <Navbar />}

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/clinics" element={<ClinicList />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/help" element={<Help />} />
        <Route path="/clinic/:id" element={<ClinicProfile />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/appointment/:id" element={<AppointmentPage />} />

        {/* --- CLINIC AUTH & ONBOARDING --- */}
        <Route path="/clinic-login" element={<ClinicLogin />} />
        <Route path="/clinic-registration" element={<ClinicRegistration />} />
        <Route path="/plans" element={<SaaSPlans />} />
        <Route path="/payment" element={<Payment />} />
        
        {/* --- DASHBOARD SYSTEM --- */}
        {/* By using /dashboard/*, all clinic sub-pages (appointments, settings, etc.) 
            will now live INSIDE the TenantDashboard layout.
        */}
        <Route path="/dashboard/*" element={<TenantDashboard />} />

        {/* Redirect legacy top-level paths to the new dashboard structure 
            to prevent broken links while you transition.
        */}
        <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="/appointments" element={<Navigate to="/dashboard/appointments" replace />} />
        <Route path="/patients" element={<Navigate to="/dashboard/patients" replace />} />
      </Routes>

      {!isClinicSide && <Footer />}
    </>
  );
};

export default App;