import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use((cfg) => {
  const t =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    "";
  const clean = t.replace(/['"]+/g, "").trim();
  if (clean && clean !== "null" && clean !== "undefined") {
    cfg.headers.Authorization = `Bearer ${clean}`;
  }
  return cfg;
});

const AdminSettings = () => {
  /* ───── state ───── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });
  const timerRef = useRef(null);

  const [profile, setProfile] = useState({ name: "", email: "", phoneNumber: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);

  /* ───── helpers ───── */
  const flash = useCallback((type, text) => {
    setToast({ type, text });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast({ type: "", text: "" }), 4000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  /* ───── fetch profile ───── */
  const fetchProfile = useCallback(async (signal) => {
    try {
      setLoading(true);
      const { data: res } = await api.get("/api/admin/settings/profile", { signal });
      if (res.success) {
        const u = res.data;
        setProfile({
          name: u.name || "",
          email: u.email || "",
          phoneNumber: u.phoneNumber || "",
        });
      }
    } catch (err) {
      if (err?.name === "CanceledError") return;
      flash("error", err?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    const ac = new AbortController();
    fetchProfile(ac.signal);
    return () => ac.abort();
  }, [fetchProfile]);

  /* ───── save profile ───── */
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) return flash("error", "Name is required.");
    setSaving(true);
    try {
      const { data: res } = await api.put("/api/admin/settings/profile", profile);
      if (res.success) {
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          phoneNumber: res.data.phoneNumber || "",
        });
        flash("success", "Profile updated.");
      } else {
        flash("error", res.message || "Update failed.");
      }
    } catch (err) {
      flash("error", err?.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ───── change password ───── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword) return flash("error", "All fields are required.");
    if (newPassword.length < 8) return flash("error", "New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return flash("error", "Passwords do not match.");

    setChangingPw(true);
    try {
      const { data: res } = await api.put("/api/admin/settings/change-password", {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        flash("success", "Password changed successfully.");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        flash("error", res.message || "Password change failed.");
      }
    } catch (err) {
      flash("error", err?.response?.data?.message || "Password change failed.");
    } finally {
      setChangingPw(false);
    }
  };

  /* ───── render ───── */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-400 gap-3">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Toast */}
      {toast.text && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-white border-emerald-200 text-emerald-700"
              : "bg-white border-red-200 text-red-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.text}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account, security, and platform preferences.</p>
      </div>

      {/* ──── PROFILE SECTION ──── */}
      <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-zinc-100 flex items-center gap-3">
          <User size={18} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Account Profile</h2>
        </div>

        <div className="p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                placeholder="Super Admin"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                placeholder="admin@sovereign.health"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
              <input
                type="tel"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>

      {/* ──── PASSWORD SECTION ──── */}
      <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-zinc-100 flex items-center gap-3">
          <KeyRound size={18} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="p-8 space-y-6">
          {/* Current password */}
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Current Password
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
              <input
                type={showPw ? "text" : "password"}
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New password */}
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                placeholder="Min 8 characters"
              />
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPw}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40"
            >
              {changingPw ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {changingPw ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      {/* ──── PLATFORM INFO SECTION ──── */}
      <section className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-zinc-100 flex items-center gap-3">
          <RefreshCw size={18} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Platform</h2>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Version</p>
              <p className="text-sm font-semibold text-zinc-800 mt-1">1.0.0</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Environment</p>
              <p className="text-sm font-semibold text-zinc-800 mt-1">
                {import.meta.env.MODE === "production" ? "Production" : "Development"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</p>
              <p className="text-sm font-semibold text-zinc-800 mt-1">Super Admin</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;
