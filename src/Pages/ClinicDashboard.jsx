import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut, 
  TrendingUp, Clock, Bell, Stethoscope, Search 
} from "lucide-react";

// Import your sub-components
import Appointments from "./clinicSide/clinicAppointments.jsx";
import Patients from "./clinicSide/clinicPatients.jsx";
import ClinicSettings from "./clinicSide/clinicSettings.jsx";
import Doctors from "./clinicSide/clinicDoctors.jsx";

const TenantDashboard = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const navigate = useNavigate(); // 2. Initialize navigate

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    
    // Optional: Clear any other tenant-specific data
    // localStorage.clear(); 

    // Redirect to login page
    navigate("/login", { replace: true });
  };

  // Mock data for the Overview stats
  const stats = [
    { label: "Total Patients", value: "1,284", change: "+12%", icon: <Users size={20} /> },
    { label: "Appointments", value: "42", change: "Today", icon: <Calendar size={20} /> },
    { label: "Revenue", value: "$12,450", change: "+8%", icon: <TrendingUp size={20} /> },
    { label: "Avg. Wait Time", value: "14 min", change: "-2%", icon: <Clock size={20} /> },
  ];

  const menuItems = [
    { id: "Overview", icon: <LayoutDashboard size={18} />, label: "Overview" },
    { id: "Appointments", icon: <Calendar size={18} />, label: "Appointments" },
    { id: "Patients", icon: <Users size={18} />, label: "Patients" },
    { id: "Doctors", icon: <Stethoscope size={18} />, label: "Doctors" },
    { id: "Settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Overview": return <OverviewContent stats={stats} />;
      case "Appointments": return <Appointments />;
      case "Patients": return <Patients />;
      case "Doctors": return <Doctors />;
      case "Settings": return <ClinicSettings />;
      default: return <OverviewContent stats={stats} />;
    }
  };

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
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                  ? "bg-black text-white shadow-lg" 
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 3. Attach handleLogout to onClick */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-12 bg-white sticky top-0 z-10 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH PATIENTS OR RECORDS..." 
              className="w-full bg-transparent pl-8 text-[10px] tracking-widest uppercase focus:outline-none"
            />
          </div>
          {/* ... Header Profile Section ... */}
          <div className="flex items-center gap-8">
            <div className="relative cursor-pointer">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-4 border-l pl-8 border-gray-100">
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-tight">Dr. Alexander</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">Premium Plan</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Dr+Alexander&background=000&color=fff" alt="Profile" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// ... OverviewContent and Placeholder components remain the same ...
const OverviewContent = ({ stats }) => (
  <div className="p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
    <header className="mb-12">
      <h2 className="text-3xl font-light tracking-tighter">Welcome back, <span className="italic font-serif">Doctor.</span></h2>
      <p className="text-gray-400 text-sm mt-2">Here is what's happening in your clinic today.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-50 text-gray-400">{stat.icon}</div>
            <span className={`text-[10px] font-bold px-2 py-1 ${stat.change.includes('+') ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
              {stat.change}
            </span>
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</h3>
          <p className="text-2xl font-semibold tracking-tighter">{stat.value}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em]">Upcoming Appointments</h3>
            <button className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">View All</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs">P{i+1}</div>
                  <div>
                    <p className="text-sm font-semibold">Patient Name {i+1}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Consultation • 10:30 AM</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-100 text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">Check In</button>
              </div>
            ))}
          </div>
      </div>

      <div className="bg-black text-white p-8 flex flex-col justify-between">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 text-gray-400">Subscription Status</h3>
          <div className="mb-6">
            <p className="text-2xl font-light tracking-tighter mb-2">Professional Plan</p>
            <div className="w-full bg-white/10 h-px mb-4"></div>
            <p className="text-[10px] tracking-widest text-gray-400 uppercase">Renewal in 22 days</p>
          </div>
        </div>
        <button className="w-full py-4 border border-white/20 text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all">
          Manage Billing
        </button>
      </div>
    </div>
  </div>
);

export default TenantDashboard;