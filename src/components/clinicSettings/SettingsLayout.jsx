import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Globe, Lock, Palette, BellRing, CreditCard } from "lucide-react";

const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sections = [
    { id: "profile", path: "/dashboard/settings", icon: <Globe size={16} />, label: "Public Profile" },
    { id: "branding", path: "/dashboard/settings/branding", icon: <Palette size={16} />, label: "Visual Identity" },
    { id: "security", path: "/dashboard/settings/security", icon: <Lock size={16} />, label: "Security & Login" },
    { id: "notifications", path: "/dashboard/settings/notifications", icon: <BellRing size={16} />, label: "Alerts" },
    { id: "billing", path: "/dashboard/settings/billing", icon: <CreditCard size={16} />, label: "Subscription" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* SHARED HEADER */}
      <div className="mb-12 pb-12 border-b border-gray-100">
        <h2 className="text-3xl font-light tracking-tighter uppercase mb-2 text-black">Clinic Settings</h2>
        <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">Environment Management</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* SHARED SIDEBAR */}
        <aside className="lg:w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => navigate(section.path)}
              className={`w-full flex items-center gap-4 px-4 py-4 text-[10px] uppercase tracking-widest transition-all ${
                isActive(section.path)
                ? "bg-black text-white font-bold shadow-md" 
                : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </aside>

        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 max-w-2xl">
          {/* This is where PublicProfile, VisualIdentity, etc. will appear */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;