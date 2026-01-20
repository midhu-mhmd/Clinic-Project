import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut, 
  Clock, Bell, Stethoscope, Search, Loader2, 
  MoreHorizontal, ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';

// --- Sub-Module Imports ---
import Appointments from "./clinicSide/clinicAppointments.jsx";
import Patients from "./clinicSide/clinicPatients.jsx";
import ClinicSettings from "./clinicSide/clinicSettings.jsx";
import Doctors from "./clinicSide/clinicDoctors.jsx";

// --- STATIC CONFIGURATION (Moved outside component for performance) ---

const MENU_ITEMS = [
  { id: "Overview", icon: <LayoutDashboard size={18} />, label: "Overview", path: "/dashboard" },
  { id: "Appointments", icon: <Calendar size={18} />, label: "Appointments", path: "/dashboard/appointments" },
  { id: "Patients", icon: <Users size={18} />, label: "Patients", path: "/dashboard/patients" },
  { id: "Doctors", icon: <Stethoscope size={18} />, label: "Doctors", path: "/dashboard/doctors-management" },
  { id: "Settings", icon: <Settings size={18} />, label: "Settings", path: "/dashboard/settings" },
];

const MOCK_CHART_DATA = {
  flow: [
    { day: 'Mon', visits: 24 }, { day: 'Tue', visits: 18 }, { day: 'Wed', visits: 32 },
    { day: 'Thu', visits: 28 }, { day: 'Fri', visits: 45 }, { day: 'Sat', visits: 15 },
    { day: 'Sun', visits: 8 },
  ],
  revenue: [
    { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 }, 
    { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 }, 
    { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 67000 },
  ],
  activity: [
    { id: 1, patient: "Sarah Jenkins", action: "New Appointment", time: "10:42 AM", status: "Confirmed" },
    { id: 2, patient: "Michael Ross", action: "Lab Results", time: "09:15 AM", status: "Pending" },
    { id: 3, patient: "Davina Claire", action: "Payment", time: "Yesterday", status: "Completed" },
    { id: 4, patient: "Harvey Specter", action: "Consultation", time: "Yesterday", status: "Completed" },
  ]
};

// --- CUSTOM COMPONENTS ---

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white p-3 text-[10px] uppercase tracking-widest shadow-xl border border-gray-800">
        <p className="mb-1 text-gray-500">{label}</p>
        <p className="font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// --- MAIN DASHBOARD LAYOUT ---

const TenantDashboard = () => {
  const [tenantData, setTenantData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Data Fetching Strategy (Memoized)
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/clinic-login"); return; }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Parallel Request Execution for Speed
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
      console.error("Sync Error:", err);
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 2. Event Handlers
  const handleLogout = () => {
    localStorage.clear();
    navigate("/clinic-login", { replace: true });
  };

  const handleProfileUpdate = (newData) => {
    setTenantData(prev => ({ ...prev, ...newData }));
  };

  const isTabActive = (itemPath) => {
    if (itemPath === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(itemPath);
  };

  // 3. Loading State
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" size={30} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#1a1a1a] font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-8 shrink-0 hidden md:flex">
        <div>
          <div className="mb-12 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <h1 className="text-xl font-serif italic tracking-tighter">Sovereign</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400">Clinical Suite</p>
          </div>

          <nav className="space-y-2">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest transition-all duration-300 ${
                  isTabActive(item.path) 
                  ? "bg-black text-white shadow-lg translate-x-1" 
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* TOP HEADER */}
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="relative w-full max-w-md hidden md:block group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH PATIENTS OR RECORDS..." 
              className="w-full bg-transparent pl-8 text-[10px] tracking-widest uppercase focus:outline-none placeholder:text-gray-300"
            />
          </div>

          <div className="flex items-center gap-8 ml-auto">
            <div className="relative cursor-pointer hover:opacity-70 transition-opacity">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            
            <div className="flex items-center gap-4 border-l pl-8 border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold uppercase tracking-tight">
                  {tenantData?.name || "Clinic Admin"}
                </p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                  {tenantData?.subscription?.plan || "Free"} Plan
                </p>
              </div>
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-serif italic uppercase shadow-md border-2 border-white ring-1 ring-gray-100">
                {tenantData?.name?.charAt(0) || "S"}
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-[#FDFDFD] scroll-smooth">
          <Routes>
            <Route path="/" element={<OverviewContent stats={dashboardStats} tenant={tenantData} />} />
            
            {/* Module Routes */}
            <Route path="appointments/*" element={<Appointments />} />
            <Route path="patients/*" element={<Patients />} />
            <Route path="doctors-management/*" element={<Doctors />} />
            
            {/* Settings Route with Prop Drilling for Instant Updates */}
            <Route 
              path="settings/*" 
              element={
                <ClinicSettings 
                  data={tenantData} 
                  onProfileUpdate={handleProfileUpdate} 
                />
              } 
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENT: OVERVIEW ANALYTICS ---

const OverviewContent = ({ stats, tenant }) => (
  <div className="p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    {/* 1. WELCOME SECTION */}
    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-light tracking-tighter text-gray-900">
          Welcome back, <span className="italic font-serif">{tenant?.name ? tenant.name.split(' ')[0] : "Administrator"}.</span>
        </h2>
        <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <button className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest border border-gray-200 px-4 py-2 hover:bg-black hover:text-white transition-all duration-300">
        Generate Report <ArrowUpRight size={14} />
      </button>
    </header>

    {/* 2. KPI METRICS GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 group cursor-default relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300 rounded-sm">
              {stat.icon}
            </div>
            <span className={`text-[9px] font-bold px-2 py-1 rounded-sm ${stat.change.includes('+') ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
              {stat.change}
            </span>
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1 relative z-10">{stat.label}</h3>
          <p className="text-2xl font-semibold tracking-tighter relative z-10">{stat.value}</p>
          
          {/* Subtle Hover Decoration */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      ))}
    </div>

    {/* 3. CHARTING SECTION */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Patient Flow Chart */}
      <div className="lg:col-span-2 bg-white border border-gray-100 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-serif italic text-gray-800">Patient Flow</h3>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Weekly Visits Overview</p>
          </div>
          <MoreHorizontal size={20} className="text-gray-300 cursor-pointer hover:text-black transition-colors" />
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CHART_DATA.flow}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#9ca3af', fontFamily: 'sans-serif'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#9ca3af', fontFamily: 'sans-serif'}} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="visits" 
                stroke="#1a1a1a" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVisits)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#000' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Widget (Inverted Style) */}
      <div className="bg-black text-white p-8 flex flex-col justify-between shadow-xl">
        <div>
           <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="text-lg font-serif italic text-white">Revenue</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">Net Earnings (H1)</p>
             </div>
             <span className="text-green-400 text-xs font-mono bg-green-900/30 px-2 py-1 rounded">+12.5%</span>
           </div>
           
           <div className="h-40 w-full mb-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={MOCK_CHART_DATA.revenue}>
                 <Bar dataKey="revenue" radius={[2, 2, 0, 0]} animationDuration={1500}>
                    {MOCK_CHART_DATA.revenue.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === MOCK_CHART_DATA.revenue.length - 1 ? "#FFFFFF" : "#333333"} 
                      />
                    ))}
                 </Bar>
                 <Tooltip cursor={{fill: 'transparent'}} content={<div className="bg-white text-black p-2 text-[9px] font-bold">HIDDEN</div>} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        <div>
           <p className="text-3xl font-light tracking-tighter">$328,000</p>
           <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">Total Generated This Year</p>
        </div>
      </div>
    </div>

    {/* 4. BOTTOM ACTIVITY GRID */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
       {/* Recent Activity List */}
       <div className="bg-white border border-gray-100 p-8 shadow-sm">
          <h3 className="text-lg font-serif italic mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {MOCK_CHART_DATA.activity.map((item) => (
               <div key={item.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 p-2 -mx-2 rounded transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                        {item.patient.charAt(0)}
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-wide group-hover:text-black text-gray-800">{item.patient}</p>
                        <p className="text-[10px] text-gray-400">{item.action}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-mono text-gray-500">{item.time}</p>
                     <p className={`text-[9px] font-bold mt-1 ${item.status === 'Confirmed' ? 'text-green-600' : 'text-gray-300'}`}>
                        {item.status}
                     </p>
                  </div>
               </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border border-gray-100 text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300">
             View Full Audit Log
          </button>
       </div>

       {/* System Status / Quick Actions */}
       <div className="bg-gray-50 border border-gray-100 p-8 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm animate-in zoom-in duration-500">
             <Stethoscope size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-light tracking-tighter mb-2">Clinic Operations</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-8 leading-relaxed">
             System operating at <span className="text-green-600 font-bold">98% efficiency</span>. All doctors are currently checked in and rounds are proceeding on schedule.
          </p>
          <div className="flex gap-4">
             <button className="px-6 py-3 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-gray-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Add Doctor
             </button>
             <button className="px-6 py-3 bg-white border border-gray-200 text-[10px] uppercase tracking-widest hover:border-black transition-colors">
                System Health
             </button>
          </div>
       </div>
    </div>

  </div>
);

export default TenantDashboard;