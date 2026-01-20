import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Globe, Lock, BellRing, CreditCard, Loader2 } from "lucide-react";

// Sub-components
import PublicProfile from "../../components/clinicSettings/PublicProfile.jsx";
import SecurityLogin from "../../components/clinicSettings/SecurityLogin.jsx";
import AlertsNotifications from "../../components/clinicSettings/AlertsNotifications.jsx";
import BillingSubscription from "../../components/clinicSettings/BillingSubscription.jsx";

const ClinicSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/tenants/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettingsData(res.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (updatedFields) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/tenants/profile", updatedFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettingsData(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Update failed" };
    }
  };

  const sections = [
    { id: "profile", path: "/dashboard/settings", icon: <Globe size={16} />, label: "Public Profile" },
    { id: "security", path: "/dashboard/settings/security", icon: <Lock size={16} />, label: "Security & Login" },
    { id: "notifications", path: "/dashboard/settings/notifications", icon: <BellRing size={16} />, label: "Alerts & Notifications" },
    { id: "billing", path: "/dashboard/settings/billing", icon: <CreditCard size={16} />, label: "Subscription" },
  ];

  // Logic to determine if a button should look active
  const isActive = (path) => {
    if (path === "/dashboard/settings") {
      return location.pathname === "/dashboard/settings" || location.pathname === "/dashboard/settings/";
    }
    return location.pathname === path;
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-gray-300" size={32} />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="mb-12 pb-12 border-b border-gray-100">
        <h2 className="text-3xl font-light tracking-tighter uppercase mb-2 text-black">
          {settingsData?.name || "Clinic"} <span className="italic font-serif text-gray-400 text-2xl lowercase">Settings</span>
        </h2>
        <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">
          Managing: {settingsData?.email || "Account Environment"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <aside className="lg:w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => navigate(section.path)}
              className={`w-full flex items-center gap-4 px-4 py-4 text-[10px] uppercase tracking-widest transition-all ${
                isActive(section.path)
                  ? "bg-black text-white font-bold shadow-md translate-x-1"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 max-w-2xl">
          {/* VERY IMPORTANT: 
              These Route paths are relative to where ClinicSettings is mounted.
              If it is mounted at /dashboard/settings, then "" is /dashboard/settings.
          */}
          <Routes>
            <Route index element={<PublicProfile data={settingsData} onUpdate={handleUpdate} />} />
            <Route path="security" element={<SecurityLogin data={settingsData} onUpdate={handleUpdate} />} />
            <Route path="notifications" element={<AlertsNotifications data={settingsData} onUpdate={handleUpdate} />} />
            <Route path="billing" element={<BillingSubscription data={settingsData} onUpdate={handleUpdate} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ClinicSettings;