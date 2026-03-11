import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Link } from "react-router-dom";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";

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
import Profile from "./Pages/profile.jsx";
import MyAppointments from "./Pages/myAppointments.jsx";
import Notifications from "./Pages/Notifications.jsx";
import ConsultationRoom from "./Pages/ConsultationRoom.jsx";
import SupportTickets from "./Pages/SupportTickets.jsx";
import MyConsultations from "./Pages/MyConsultations.jsx";
import AIChatbot from "./Pages/AIChatbot.jsx";

// Dashboard / Admin Components
import TenantDashboard from "./Pages/ClinicDashboard.jsx";
import AdminLayout from "./Pages/adminDashboard/AdminLayout.jsx";
import SuperAdminDashboard from "./Pages/adminDashboard/SuperAdminDashboard.jsx";
import TenantsPage from "./Pages/adminDashboard/TenantsPage.jsx";
import GlobalDirectory from "./Pages/adminDashboard/GlobalDirectory.jsx";
import Subscriptions from "./Pages/adminDashboard/Subscriptions.jsx";
import SystemLogs from "./Pages/adminDashboard/SystemLogs.jsx";
import PatientsPage from "./Pages/adminDashboard/PatientsPage.jsx";
import AdminSettings from "./Pages/adminDashboard/AdminSettings.jsx";
import AdminNotifications from "./Pages/adminDashboard/AdminNotifications.jsx";
import AdminTickets from "./Pages/adminDashboard/AdminTickets.jsx";

const App = () => {
  const location = useLocation();

  // ── Role-based redirect guard ──
  // Detect which role is currently logged in and force-redirect
  // if they try to access pages outside their designated area.
  const clinicToken = localStorage.getItem("authToken");
  const clinicRole = localStorage.getItem("userRole");
  const patientToken = localStorage.getItem("token");

  let activeRole = null;
  if (clinicToken && clinicRole) {
    activeRole = clinicRole;
  } else if (patientToken) {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      activeRole = user?.role || null;
    } catch { /* ignore */ }
  }

  const path = location.pathname;

  // CLINIC_ADMIN: can only access /dashboard/*
  if (activeRole === "CLINIC_ADMIN" && !path.startsWith("/dashboard")) {
    return <Navigate to="/dashboard" replace />;
  }

  // SUPER_ADMIN: can only access /admin/*
  if (activeRole === "SUPER_ADMIN" && !path.startsWith("/admin")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const isClinicSide =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/consultation") ||
    ["/clinic-login", "/clinic-registration", "/plans", "/payment", "/login", "/register"].some(
      (p) => location.pathname.startsWith(p),
    );

  return (
    <>
      <ScrollToTop />
      {!isClinicSide && <Navbar />}
      {!isClinicSide && <div className="pt-20" />}

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
        <Route path="/appointment/:id" element={<ProtectedRoute><AppointmentPage /></ProtectedRoute>} />
        <Route path="/consultation/:roomToken" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
        <Route path="/my-consultations" element={<ProtectedRoute><MyConsultations /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* --- CLINIC AUTH & ONBOARDING --- */}
        <Route path="/clinic-login" element={<ClinicLogin />} />
        <Route path="/clinic-registration" element={<ClinicRegistration />} />
        <Route path="/plans" element={<SaaSPlans />} />
        <Route path="/payment" element={<Payment />} />

        {/* --- TENANT / CLINIC DASHBOARD --- */}
        <Route path="/dashboard/*" element={
          <RoleProtectedRoute allowedRoles={["CLINIC_ADMIN"]} authRedirect="/clinic-login">
            <TenantDashboard />
          </RoleProtectedRoute>
        } />

        {/* --- SUPER ADMIN SYSTEM (NESTED) --- */}
        <Route path="/admin" element={
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]} authRedirect="/login">
            <AdminLayout />
          </RoleProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="global-directory" element={<GlobalDirectory />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="system-logs" element={<SystemLogs />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        <Route
          path="/settings"
          element={<Navigate to="/dashboard/settings" replace />}
        />
        <Route
          path="/patients"
          element={<Navigate to="/dashboard/patients" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isClinicSide && <Footer />}

      {/* Floating AI Assistant Button — patient side only */}
      {!isClinicSide && (
        <Link
          to="/ai-assistant"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#0F766E] text-white shadow-lg flex items-center justify-center hover:bg-[#0F766E]/90 hover:scale-105 transition-all duration-300"
          aria-label="AI Health Assistant"
          title="AI Health Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </Link>
      )}
    </>
  );
};

export default App;
