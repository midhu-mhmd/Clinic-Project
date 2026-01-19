import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
import ClinicDashboard from "./Pages/ClinicDashboard.jsx";
import Appointments from "./Pages/clinicSide/clinicAppointments.jsx";
import Patients from "./Pages/clinicSide/clinicPatients.jsx";
import ClinicSettings from "./Pages/clinicSide/clinicSettings.jsx";
import Doctors from "./Pages/clinicSide/clinicDoctors.jsx";
import AppointmentPage from "./Pages/Appointment.jsx";

const App = () => {
  const location = useLocation();

  // Define paths where Navbar and Footer should NOT be shown
  // We include dashboard, appointments, patients, settings, etc.
  const clinicSidePaths = [
    "/dashboard",
    "/appointments",
    "/patients",
    "/settings",
    "/doctors-management",
    "/clinic-login",
    "/clinic-registration",
    "/plans",
    "/payment",
  ];

  // Check if the current path is a clinic-side path
  const isClinicSide = clinicSidePaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {/* Only show Navbar if NOT on clinic-side */}
      {!isClinicSide && <Navbar />}

      <Routes>
        {/* Public routes */}
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

        {/* Clinic Side - No Navbar/Footer routes */}
        <Route path="/clinic-login" element={<ClinicLogin />} />
        <Route path="/clinic-registration" element={<ClinicRegistration />} />
        <Route path="/plans" element={<SaaSPlans />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<ClinicDashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/settings" element={<ClinicSettings />} />
        <Route path="/doctors-management" element={<Doctors />} />
      </Routes>

      {/* Only show Footer if NOT on clinic-side */}
      {!isClinicSide && <Footer />}
    </>
  );
};

export default App;
