import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";


import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";

// Public Pages
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
import AppointmentPage from "./Pages/Appointment.jsx";

// Dashboard / Admin Components
import TenantDashboard from "./Pages/ClinicDashboard.jsx";
import AdminLayout from "./Pages/adminDashboard/AdminLayout.jsx";
import SuperAdminDashboard from "./Pages/adminDashboard/SuperAdminDashboard.jsx";
import TenantsPage from "./Pages/adminDashboard/TenantsPage.jsx";
import GlobalDirectory from "./Pages/adminDashboard/GlobalDirectory.jsx";
import Subscriptions from "./Pages/adminDashboard/Subscriptions.jsx";
import SystemLogs from "./Pages/adminDashboard/SystemLogs.jsx";
import PatientsPage from "./Pages/adminDashboard/PatientsPage.jsx";

const App = () => {
  const location = useLocation();

  const isClinicSide =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin") ||
    ["/clinic-login", "/clinic-registration", "/plans", "/payment", "/login", "/register"].some(
      (path) => location.pathname.startsWith(path),
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

        {/* --- TENANT / CLINIC DASHBOARD --- */}
        <Route path="/dashboard/*" element={<TenantDashboard />} />

        {/* --- SUPER ADMIN SYSTEM (NESTED) --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="global-directory" element={<GlobalDirectory />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="system-logs" element={<SystemLogs />} />
          <Route path="patients" element={<PatientsPage />} />
        </Route>

        <Route
          path="/settings"
          element={<Navigate to="/dashboard/settings" replace />}
        />
        <Route
          path="/appointments"
          element={<Navigate to="/dashboard/appointments" replace />}
        />
        <Route
          path="/patients"
          element={<Navigate to="/dashboard/patients" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isClinicSide && <Footer />}
    </>
  );
};

export default App;
