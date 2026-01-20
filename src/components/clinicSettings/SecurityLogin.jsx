import React, { useState } from "react";
import axios from "axios";
import { 
  ShieldCheck, Lock, Smartphone, History, 
  KeyRound, AlertTriangle, CheckCircle2, Eye, EyeOff 
} from "lucide-react";

const SecurityLogin = () => {
  const [isSaving, setIsSaving] = useState(false);
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage({ type: "error", text: "New passwords do not match." });
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      // This assumes you have a /change-password endpoint in your Auth/User controller
      await axios.put("http://localhost:5000/api/users/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: "Credentials updated successfully." });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Verification failed." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      {/* Feedback Toast */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 border ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span className="text-[10px] uppercase tracking-widest font-bold">{message.text}</span>
        </div>
      )}

      {/* SECTION 1: PASSWORD UPDATE */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <KeyRound size={18} className="text-gray-400" />
          <h4 className="text-[11px] font-bold uppercase tracking-widest">Update Credentials</h4>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6 bg-white border border-gray-100 p-8">
          <div className="space-y-2 relative">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Current Password</label>
            <input 
              type={showPassword ? "text" : "password"}
              required
              className="w-full border-b border-gray-100 py-3 text-xs outline-none focus:border-black transition-all"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 bottom-3 text-gray-300 hover:text-black"
            >
              {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">New Password</label>
              <input 
                type="password"
                required
                className="w-full border-b border-gray-100 py-3 text-xs outline-none focus:border-black transition-all"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Confirm New Password</label>
              <input 
                type="password"
                required
                className="w-full border-b border-gray-100 py-3 text-xs outline-none focus:border-black transition-all"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="mt-4 bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gray-800 transition-all disabled:bg-gray-200"
          >
            {isSaving ? "Validating..." : "Update Password"}
          </button>
        </form>
      </section>

      {/* SECTION 2: MULTI-FACTOR AUTH */}
      <section className="pt-8 border-t border-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Smartphone size={18} className="text-gray-400" />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest">Two-Factor Authentication</h4>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Add an extra layer of clinical data protection</p>
            </div>
          </div>
          <button 
            onClick={() => setSecurityPrefs({...securityPrefs, twoFactor: !securityPrefs.twoFactor})}
            className={`w-12 h-6 rounded-full p-1 flex transition-all duration-300 ${securityPrefs.twoFactor ? "bg-emerald-500 justify-end" : "bg-gray-200 justify-start"}`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
          </button>
        </div>
      </section>

      {/* SECTION 3: RECENT SESSIONS */}
      <section className="pt-8 border-t border-gray-50">
        <div className="flex items-center gap-3 mb-6">
          <History size={18} className="text-gray-400" />
          <h4 className="text-[11px] font-bold uppercase tracking-widest">Active Institutional Sessions</h4>
        </div>
        
        <div className="space-y-3">
          {[
            { device: "Chrome / macOS", ip: "192.168.1.1", status: "Current Session", date: "Active now" },
            { device: "iPhone 15 Pro", ip: "172.20.10.4", status: "Verified Device", date: "2 days ago" }
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 flex items-center justify-center rounded-sm">
                  <ShieldCheck size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-tight">{session.device}</p>
                  <p className="text-[9px] text-gray-400 font-mono uppercase">{session.ip} • {session.date}</p>
                </div>
              </div>
              <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-600">{session.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SecurityLogin;