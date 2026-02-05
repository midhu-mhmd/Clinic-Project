import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Globe, Lock, BellRing, CreditCard, Loader2 } from "lucide-react";

// Sub-components
import PublicProfile from "../../components/clinicSettings/PublicProfile.jsx";
import SecurityLogin from "../../components/clinicSettings/SecurityLogin.jsx";
import AlertsNotifications from "../../components/clinicSettings/AlertsNotifications.jsx";
import BillingSubscription from "../../components/clinicSettings/BillingSubscription.jsx";

/* =========================================================
   CONFIG
========================================================= */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const PROFILE_URL = `${API_BASE}/api/tenants/profile`;

/* =========================================================
   AUTH HELPERS (authToken-first)
========================================================= */
const cleanToken = (t) => {
  if (!t || typeof t !== "string") return null;
  const x = t.replace(/['"]+/g, "").trim();
  if (!x || x === "undefined" || x === "null") return null;
  return x;
};

const isValidJwt = (t) => {
  const x = cleanToken(t);
  if (!x) return false;
  return x.split(".").length === 3;
};

const readAuthToken = () => {
  const t1 = cleanToken(localStorage.getItem("authToken"));
  if (isValidJwt(t1)) return t1;

  const t2 = cleanToken(localStorage.getItem("token")); // legacy fallback
  if (isValidJwt(t2)) return t2;

  return null;
};

const getAuthHeaders = () => {
  const token = readAuthToken();
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
};

const normalizeProfile = (payload) => {
  // supports {success, data} or {success, data: {..}} etc
  return payload?.data?.data ?? payload?.data ?? null;
};

const ClinicSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    navigate("/clinic-login", { replace: true });
  }, [navigate]);

  const fetchSettings = useCallback(async (signal) => {
    try {
      setLoading(true);
      setPageError("");

      const headers = getAuthHeaders();
      if (!headers) {
        setSettingsData(null);
        setPageError("Session missing. Please login again.");
        handleUnauthorized();
        return;
      }

      const res = await axios.get(PROFILE_URL, { signal, headers });
      const profile = normalizeProfile(res);

      setSettingsData(profile);
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === "CanceledError") return;

      const status = err?.response?.status;
      console.error("Settings fetch error:", err);

      if (status === 401) {
        setPageError("Session expired. Please login again.");
        handleUnauthorized();
        return;
      }

      setPageError(err?.response?.data?.message || "Failed to load settings.");
      setSettingsData(null);
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSettings(controller.signal);
    return () => controller.abort();
  }, [fetchSettings]);

  const handleUpdate = useCallback(
    async (updatedFields) => {
      try {
        const headers = getAuthHeaders();
        if (!headers) {
          handleUnauthorized();
          return { success: false, message: "Session missing. Please login again." };
        }

        const res = await axios.put(PROFILE_URL, updatedFields, { headers });
        const updated = normalizeProfile(res);

        setSettingsData(updated);
        return { success: true };
      } catch (err) {
        const status = err?.response?.status;

        if (status === 401) {
          handleUnauthorized();
          return { success: false, message: "Session expired. Please login again." };
        }

        return {
          success: false,
          message: err?.response?.data?.message || "Update failed",
        };
      }
    },
    [handleUnauthorized]
  );

  const sections = useMemo(
    () => [
      { id: "profile", path: "/dashboard/settings", icon: <Globe size={16} />, label: "Public Profile" },
      { id: "security", path: "/dashboard/settings/security", icon: <Lock size={16} />, label: "Security & Login" },
      { id: "notifications", path: "/dashboard/settings/notifications", icon: <BellRing size={16} />, label: "Alerts & Notifications" },
      { id: "billing", path: "/dashboard/settings/billing", icon: <CreditCard size={16} />, label: "Subscription" },
    ],
    []
  );

  const isActive = useCallback(
    (path) => {
      if (path === "/dashboard/settings") {
        return (
          location.pathname === "/dashboard/settings" ||
          location.pathname === "/dashboard/settings/"
        );
      }
      return location.pathname === path;
    },
    [location.pathname]
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Top header */}
      <div className="mb-12 pb-12 border-b border-gray-100">
        <h2 className="text-3xl font-light tracking-tighter uppercase mb-2 text-black">
          {settingsData?.name || "Clinic"}{" "}
          <span className="italic font-serif text-gray-400 text-2xl lowercase">
            Settings
          </span>
        </h2>
        <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">
          Managing: {settingsData?.email || "Account Environment"}
        </p>

        {pageError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase tracking-widest font-bold">
            {pageError}
          </div>
        )}
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
          <Routes>
            <Route
              index
              element={<PublicProfile data={settingsData} onUpdate={handleUpdate} />}
            />
            <Route
              path="security"
              element={<SecurityLogin data={settingsData} onUpdate={handleUpdate} />}
            />
            <Route
              path="notifications"
              element={<AlertsNotifications data={settingsData} onUpdate={handleUpdate} />}
            />
            <Route
              path="billing"
              element={<BillingSubscription data={settingsData} onUpdate={handleUpdate} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ClinicSettings;
