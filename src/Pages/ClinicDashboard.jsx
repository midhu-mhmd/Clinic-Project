import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut, 
  Clock, Bell, Stethoscope, Search, Loader2
} from "lucide-react";

import Appointments from "./clinicSide/clinicAppointments.jsx";
import Patients from "./clinicSide/clinicPatients.jsx";
import ClinicSettings from "./clinicSide/clinicSettings.jsx";
import Doctors from "./clinicSide/clinicDoctors.jsx";

const TenantDashboard = () => {
  const [tenantData, setTenantData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/clinic-login"); return; }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [profileRes, statsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tenants/profile", config),
          axios.get("http://localhost:5000/api/tenants/stats", config) 
        ]);

        setTenantData(profileRes.data.data);
        const s = statsRes.data.data;
        setDashboardStats([
          { label: "Total Patients", value: s.totalPatients || 0, change: "+5%", icon: <Users size={20} /> },
          { label: "Daily Appointments", value: s.todayAppointments || 0, change: "Today", icon: <Calendar size={20} /> },
          { label: "Medical Faculty", value: s.totalDoctors || 0, change: "Active", icon: <Stethoscope size={20} /> },
          { label: "Avg. Wait Time", value: `${s.waitTime || 15} min`, change: "-2%", icon: <Clock size={20} /> },
        ]);
      } catch (err) {
        if (err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/clinic-login", { replace: true });
  };

  const menuItems = [
    { id: "Overview", icon: <LayoutDashboard size={18} />, label: "Overview", path: "/dashboard" },
    { id: "Appointments", icon: <Calendar size={18} />, label: "Appointments", path: "/dashboard/appointments" },
    { id: "Patients", icon: <Users size={18} />, label: "Patients", path: "/dashboard/patients" },
    { id: "Doctors", icon: <Stethoscope size={18} />, label: "Doctors", path: "/dashboard/doctors-management" },
    { id: "Settings", icon: <Settings size={18} />, label: "Settings", path: "/dashboard/settings" },
  ];

  const isTabActive = (itemPath) => {
    if (itemPath === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(itemPath);
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" size={30} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#1a1a1a] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-8 shrink-0">
        <div>
          <div className="mb-12">
            <h1 className="text-xl font-serif italic tracking-tighter">Sovereign</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400">Clinical Suite</p>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest transition-all ${
                  isTabActive(item.path) ? "bg-black text-white shadow-lg" : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-12 bg-white shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input type="text" placeholder="SEARCH PATIENTS OR RECORDS..." className="w-full bg-transparent pl-8 text-[10px] tracking-widest uppercase focus:outline-none" />
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border-l pl-8 border-gray-100">
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-tight">{tenantData?.name || "Clinic Admin"}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">{tenantData?.subscription?.plan || "Free"} Plan</p>
              </div>
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-serif italic uppercase">
                {tenantData?.name?.charAt(0) || "S"}
              </div>
            </div>
          </div>
        </header>

        {/* ✅ THE FIX: Content Container with Routes */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<OverviewContent stats={dashboardStats} tenant={tenantData} />} />
            <Route path="appointments/*" element={<Appointments />} />
            <Route path="patients/*" element={<Patients />} />
            <Route path="doctors-management/*" element={<Doctors />} />
            {/* IMPORTANT: "settings/*" allows the ClinicSettings component 
               to handle its own sub-routes like /branding, /security, etc. 
            */}
            <Route path="settings/*" element={<ClinicSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// OverviewContent... (remains same)
const OverviewContent = ({ stats, tenant }) => (
  <div className="p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
    <header className="mb-12">
      <h2 className="text-3xl font-light tracking-tighter">
        Welcome back, <span className="italic font-serif">{tenant?.name ? tenant.name.split(' ')[0] : "Administrator"}.</span>
      </h2>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-50 text-gray-400">{stat.icon}</div>
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</h3>
          <p className="text-2xl font-semibold tracking-tighter">{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export default TenantDashboard;