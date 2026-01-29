import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { 
  Users, Building2, DollarSign, Activity, 
  Search, Bell, LayoutDashboard, LogOut 
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: "Overview", path: "/admin/dashboard" },
    { icon: <Building2 size={18} />, label: "Tenants / Clinics", path: "/admin/tenants" },
    { icon: <Users size={18} />, label: "Patient Registry", path: "/admin/patients" },
    { icon: <Users size={18} />, label: "Global Directory", path: "/admin/global-directory" },
    { icon: <DollarSign size={18} />, label: "Subscriptions", path: "/admin/subscriptions" },
    { icon: <Activity size={18} />, label: "System Logs", path: "/admin/system-logs" },
  ];

  const currentPage = menuItems.find(m => m.path === location.pathname)?.label || "Control";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex text-[#2D302D]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#2D302D] text-[#FAF9F6] hidden lg:flex flex-col p-8 sticky top-0 h-screen z-50">
        <div className="mb-12">
          <h2 className="text-xl font-serif italic tracking-tighter">SuperAdmin.</h2>
          <p className="text-[9px] uppercase tracking-[0.3em] opacity-40">Platform Control</p>
        </div>
        
        <nav className="space-y-6 flex-1">
          {menuItems.map((item) => (
            <div 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 cursor-pointer transition-all duration-300 group ${
                location.pathname === item.path ? "text-[#8DAA9D]" : "opacity-40 hover:opacity-100"
              }`}
            >
              {item.icon}
              <span className="text-xs uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform">
                {item.label}
              </span>
            </div>
          ))}
        </nav>

        <div className="pt-8 border-t border-[#FAF9F6]/10">
          <button onClick={() => navigate("/login")} className="flex items-center gap-4 text-xs uppercase tracking-widest font-bold opacity-40 hover:text-red-400 hover:opacity-100 transition-all">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-8 lg:px-12 py-8 flex justify-between items-center border-b border-[#2D302D]/5 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-light uppercase tracking-tighter">{currentPage}</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-40 italic">System v2.0</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" size={14} />
              <input type="text" placeholder="Search data..." className="pl-10 pr-4 py-2 bg-[#2D302D]/5 rounded-sm text-xs outline-none w-64 border-none focus:ring-1 ring-[#8DAA9D]" />
            </div>
            <Bell size={20} className="opacity-40 cursor-pointer hover:opacity-100" />
            <div className="w-10 h-10 rounded-full bg-[#8DAA9D] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">SA</div>
          </div>
        </header>

        <main className="p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Outlet /> {/* This is where sub-pages render */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;