import React, { useCallback } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Users,
  Building2,
  CreditCard,
  Activity,
  Search,
  Bell,
  LayoutGrid,
  LogOut,
  ChevronRight,
  Settings,
  PieChart
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Updated icons to be more uniform
  const menuItems = [
    { icon: <PieChart size={20} />, label: "Overview", path: "/admin/dashboard" },
    { icon: <Building2 size={20} />, label: "Tenants", path: "/admin/tenants" },
    { icon: <Users size={20} />, label: "Patients", path: "/admin/patients" },
    { icon: <LayoutGrid size={20} />, label: "Directory", path: "/admin/global-directory" },
    { icon: <CreditCard size={20} />, label: "Billing", path: "/admin/subscriptions" },
    { icon: <Activity size={20} />, label: "Logs", path: "/admin/system-logs" },
  ];

  const currentPage = menuItems.find((m) => m.path === location.pathname)?.label || "Dashboard";

  const handleLogout = useCallback(() => {
    const keys = ["token", "role", "user", "tenant"];
    keys.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
    window.location.replace("/login");
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-zinc-200">
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden h-screen w-64 flex-col border-r border-zinc-200 bg-white lg:flex sticky top-0 z-50">
        
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-zinc-900"></div>
            <span className="font-semibold tracking-tight text-lg">Nexus.</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          <p className="px-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Platform</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-zinc-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-zinc-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200/60 bg-[#FAFAFA]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Admin</span>
            <span className="text-zinc-300">/</span>
            <span className="font-medium text-zinc-900">{currentPage}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-zinc-100 transition-shadow">
              <Search size={14} className="text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 bg-transparent text-sm text-zinc-800 placeholder-zinc-400 outline-none"
              />
              <kbd className="hidden rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400 lg:block">⌘K</kbd>
            </div>

            {/* Notifications */}
            <button className="relative rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#FAFAFA]"></span>
            </button>

            {/* User Avatar */}
            <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200 border border-zinc-200 shadow-sm cursor-pointer hover:ring-2 ring-zinc-100 transition-all">
              <div className="flex h-full w-full items-center justify-center bg-white text-xs font-bold text-zinc-900">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* --- PAGE CONTENT --- */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500">
             <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;