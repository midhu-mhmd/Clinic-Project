import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  ShieldCheck, Lock, Smartphone, History,
  KeyRound, AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

const cleanToken = (t) => {
  if (!t || typeof t !== "string") return null;
  const x = t.replace(/['"]+/g, "").trim();
  if (!x || x === "undefined" || x === "null") return null;
  return x;
};
const readAuthToken = () => {
  const t1 = cleanToken(localStorage.getItem("authToken"));
  if (t1 && t1.split(".").length === 3) return t1;
  const t2 = cleanToken(localStorage.getItem("token"));
  if (t2 && t2.split(".").length === 3) return t2;
  return null;
};
const authHeaders = () => {
  const token = readAuthToken();
  if (!token) throw new Error("Session missing.");
  return { Authorization: `Bearer ${token}` };
};

const SecurityLogin = ({ data, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [securityPrefs, setSecurityPrefs] = useState({
    twoFactor: false,
    sessionTimeout: "24h",
    loginAlerts: true
  });

  const [activeSessions, setActiveSessions] = useState([]);

  // 1. DATA INITIALIZATION: Fetch active sessions and current settings
  const fetchSecurityData = useCallback(async () => {
    try {
      const config = { headers: authHeaders() };

      const prefsRes = await axios.get(`${API_BASE_URL}/api/tenants/security`, config);

      if (prefsRes.data.success) {
        setActiveSessions(prefsRes.data.data.sessions || []);
        setSecurityPrefs(prev => ({ ...prev, twoFactor: prefsRes.data.data.twoFactor }));
      }

    } catch (err) {
      console.error("Failed to sync security data", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  // 2. DYNAMIC PREFERENCE UPDATES (Toggles)
  const toggleSecuritySetting = async (key) => {
    const updatedValue = !securityPrefs[key];

    // Optimistic Update
    setSecurityPrefs(prev => ({ ...prev, [key]: updatedValue }));

    try {
      await axios.put(`${API_BASE_URL}/api/tenants/security`,
        { [key]: updatedValue },
        { headers: authHeaders() }
      );
      setMessage({ type: "success", text: `${key} preference updated.` });
    } catch (err) {
      // Revert on error
      setSecurityPrefs(prev => ({ ...prev, [key]: !updatedValue }));
      setMessage({ type: "error", text: "Cloud sync failed." });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // 3. PASSWORD HANDLER (remains similar, but with dynamic URL)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match." });
    }

    setIsSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/api/tenants/change-password`, passwords, {
        headers: authHeaders()
      });

      setMessage({ type: "success", text: "Credentials updated." });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Verification failed." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  if (fetching) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-300" size={20} />
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Dynamic Feedback Toast */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-100 flex items-center gap-3 px-6 py-4 border shadow-2xl ${message.type === "success" ? "bg-white border-emerald-500 text-emerald-700" : "bg-white border-red-500 text-red-700"
          }`}>
          {message.type === "success" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          <span className="text-[10px] uppercase tracking-[0.2em] font-black">{message.text}</span>
        </div>
      )}

      {/* SECTION 1: CREDENTIALS */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <KeyRound size={16} className="text-gray-400" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Identity Protocol</h4>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-8 bg-[#F0FDFA] p-10">
          <div className="relative border-b border-gray-200 focus-within:border-black transition-colors">
            <label className="text-[8px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Current Signature</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-transparent py-2 text-xs outline-none"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-2 opacity-30 hover:opacity-100">
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="border-b border-gray-200 focus-within:border-black">
              <label className="text-[8px] uppercase tracking-widest text-gray-400 font-bold block mb-1">New Key</label>
              <input type="password" required className="w-full bg-transparent py-2 text-xs outline-none"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>
            <div className="border-b border-gray-200 focus-within:border-black">
              <label className="text-[8px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Confirm New Key</label>
              <input type="password" required className="w-full bg-transparent py-2 text-xs outline-none"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={isSaving}
            className="bg-[#1A1A1A] text-white px-10 py-4 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#0F766E] transition-all disabled:opacity-20">
            {isSaving ? "Syncing..." : "Rewrite Credentials"}
          </button>
        </form>
      </section>

      {/* SECTION 2: MFA DYNAMIC TOGGLE */}
      <section className="pt-10 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-50 flex items-center justify-center rounded-full">
              <Smartphone size={16} className={securityPrefs.twoFactor ? "text-[#0F766E]" : "text-gray-300"} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest">Two-Factor Authentication</h4>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Multi-layered clinical access protocol</p>
            </div>
          </div>
          <button
            onClick={() => toggleSecuritySetting('twoFactor')}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${securityPrefs.twoFactor ? "bg-[#0F766E]" : "bg-gray-200"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${securityPrefs.twoFactor ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </section>

      {/* SECTION 3: DYNAMIC SESSION LIST */}
      <section className="pt-10 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <History size={16} className="text-gray-400" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Log</h4>
        </div>

        <div className="grid gap-4">
          {activeSessions.length > 0 ? activeSessions.map((session, i) => (
            <div key={i} className="flex items-center justify-between p-6 border border-gray-100 hover:border-[#0F766E]/30 transition-all">
              <div className="flex items-center gap-6">
                <ShieldCheck size={16} className={session.isCurrent ? "text-[#0F766E]" : "text-gray-200"} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight">{session.browser} / {session.os}</p>
                  <p className="text-[8px] text-gray-400 font-mono uppercase mt-1">
                    {session.ipAddress} • {session.lastAccess}
                  </p>
                </div>
              </div>
              <span className={`text-[8px] uppercase tracking-widest font-black ${session.isCurrent ? "text-[#0F766E]" : "opacity-20"}`}>
                {session.isCurrent ? "Active Connection" : "Verified Device"}
              </span>
            </div>
          )) : (
            <p className="text-[9px] uppercase tracking-widest opacity-30 italic">No historical logs found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default SecurityLogin;