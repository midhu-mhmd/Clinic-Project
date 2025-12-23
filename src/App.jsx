import React from 'react'
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar.jsx'
import Home from './Pages/Home.jsx'
import Register from './Pages/Register.jsx'
import Login from './Pages/Login.jsx'
import ForgotPassword from './Pages/ForgotPassword.jsx';
import Footer from './components/Footer/Footer.jsx';
import ClinicList from './Pages/ClinicList.jsx';
import DoctorList from './Pages/DoctorList.jsx';
import ClinicProfile from './Pages/ClinicProfile.jsx';
import DoctorProfile from './Pages/DoctorProfile.jsx';

const App = () => {
  return (
     <>
     <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/clinics" element={<ClinicList />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/clinic/:id" element={<ClinicProfile />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
