import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Shield,
  Activity,
  Calendar,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";

/* --- CONFIG --- */
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    const cleanToken = token.replace(/['"]+/g, "");
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

/* --- COMPONENT --- */
const UsersPage = () => {
  // Data State
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Sort State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [lastActive, setLastActive] = useState("");

  // Selection State
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // 1. Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Fetch Tenants for filter
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data } = await api.get("/admin/tenants");
        setTenants(data?.data || []);
      } catch (err) {
        console.error("Failed to fetch tenants", err);
      }
    };
    fetchTenants();
  }, []);

  // 3. Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        search: debouncedSearch,
        role,
        status,
        tenantId,
      };

      if (lastActive) {
        const date = new Date();
        date.setDate(date.getDate() - Number(lastActive));
        params.lastActiveFrom = date.toISOString();
      }

      const { data } = await api.get("/users/all", { params });
      setUsers(data?.data || []);
      setTotalPages(data?.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sync clinical archive");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, debouncedSearch, role, status, tenantId, lastActive]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Bulk Actions
  const handleBulkStatus = async (isActive) => {
    if (!selectedUsers.length) return;
    setIsBulkLoading(true);
    try {
      await api.post("/users/bulk-update", { userIds: selectedUsers, isActive });
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      alert("Bulk update failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkLogout = async () => {
    if (!selectedUsers.length) return;
    setIsBulkLoading(true);
    try {
      await api.post("/users/bulk-logout", { userIds: selectedUsers });
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      alert("Bulk logout failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/users/export-csv", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'global_users_export.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Export failed");
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-zinc-100 antialiased">

      {/* HEADER SECTION */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                <Shield size={18} className="text-zinc-400" />
                Global User Index
              </h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                Platform Security & Access Management
              </p>
            </div>

            <div className="h-10 w-[1px] bg-zinc-200 hidden md:block" />

            <div className="hidden lg:flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-full text-zinc-400 focus-within:text-zinc-900 focus-within:bg-white focus-within:shadow-sm transition-all">
              <Search size={14} />
              <input
                type="text"
                placeholder="PROBE IDENTITY..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-[11px] font-bold tracking-widest outline-none w-64 placeholder:text-zinc-300 uppercase"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-100 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-sm shadow-sm"
            >
              <Download size={14} /> Export Archive
            </button>
          </div>
        </div>

        {/* REFINED FILTERS BAR */}
        <div className="max-w-[1600px] mx-auto px-8 pb-4 flex flex-wrap gap-4 items-center">
          <FilterSelect
            icon={<Activity size={12} />}
            label="Role"
            value={role}
            onChange={(v) => { setRole(v); setPage(1); }}
            options={[
              { label: "Super Admin", value: "SUPER_ADMIN" },
              { label: "Clinic Admin", value: "CLINIC_ADMIN" },
              { label: "Patient", value: "PATIENT" },
              { label: "Doctor", value: "DOCTOR" },
            ]}
          />
          <FilterSelect
            icon={<Activity size={12} />}
            label="Status"
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
            ]}
          />
          <FilterSelect
            icon={<Building2 size={12} />}
            label="Tenant"
            value={tenantId}
            onChange={(v) => { setTenantId(v); setPage(1); }}
            options={tenants.map(t => ({ label: t.name, value: t._id }))}
          />
          <FilterSelect
            icon={<Clock size={12} />}
            label="Active Within"
            value={lastActive}
            onChange={(v) => { setLastActive(v); setPage(1); }}
            options={[
              { label: "Last 7 Days", value: "7" },
              { label: "Last 30 Days", value: "30" },
            ]}
          />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-8 relative">

        {/* BULK ACTIONS TOOLBAR */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full shadow-2xl z-50 flex items-center gap-8 border border-white/10 backdrop-blur-xl"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] border-r border-white/20 pr-8">
                {selectedUsers.length} Targets Selected
              </span>
              <div className="flex items-center gap-4">
                <BulkActionBtn icon={<CheckCircle2 size={14} />} label="Activate" onClick={() => handleBulkStatus(true)} disabled={isBulkLoading} />
                <BulkActionBtn icon={<XCircle size={14} />} label="Suspend" onClick={() => handleBulkStatus(false)} disabled={isBulkLoading} variant="danger" />
                <BulkActionBtn icon={<LogOut size={14} />} label="Force Logout" onClick={handleBulkLogout} disabled={isBulkLoading} />
              </div>
              <button onClick={() => setSelectedUsers([])} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white underline underline-offset-4">Discard</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DATA TABLE */}
        <div className="bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 border-b border-zinc-100">
                  <th className="px-6 py-5 w-12 text-center">
                    <input
                      type="checkbox"
                      className="accent-black"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers(users.map(u => u._id));
                        else setSelectedUsers([]);
                      }}
                      checked={selectedUsers.length === users.length && users.length > 0}
                    />
                  </th>
                  <th className="px-6 py-5 cursor-pointer hover:text-zinc-900 group" onClick={() => toggleSort("name")}>
                    User Profile <ArrowUpDown size={10} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </th>
                  <th className="px-6 py-5">System Role</th>
                  <th className="px-6 py-5">Organization</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 cursor-pointer hover:text-zinc-900 group" onClick={() => toggleSort("lastLogin")}>
                    Last Active <ArrowUpDown size={10} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </th>
                  <th className="px-6 py-5 cursor-pointer hover:text-zinc-900 group text-right" onClick={() => toggleSort("createdAt")}>
                    Created At <ArrowUpDown size={10} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      isSelected={selectedUsers.includes(user._id)}
                      onSelect={(id) => {
                        setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                      }}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Users size={32} className="text-zinc-100" />
                        <p className="text-xs text-zinc-400 uppercase tracking-widest">No matching identification found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && totalPages > 1 && (
          <footer className="mt-10 flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Index Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-zinc-100 rounded-sm hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-zinc-100 rounded-sm hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* ERROR OVERLAY */}
      {error && (
        <div className="fixed top-24 right-8 bg-white border border-red-100 p-4 rounded-xl shadow-xl flex items-center gap-4 animate-in slide-in-from-right duration-500 z-50">
          <div className="p-2 bg-red-50 text-red-500 rounded-lg">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight text-red-600">Sync Failure</h4>
            <p className="text-[10px] text-zinc-500">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const UserRow = ({ user, isSelected, onSelect }) => {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`group hover:bg-zinc-50/50 transition-colors ${isSelected ? 'bg-zinc-50/80 shadow-inner' : ''}`}
    >
      <td className="px-6 py-4 text-center">
        <input
          type="checkbox"
          className="accent-black cursor-pointer"
          checked={isSelected}
          onChange={() => onSelect(user._id)}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0">
            <img
              src={user.image || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`}
              alt=""
              className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-[13px] font-bold text-zinc-900 truncate">{user.name}</h3>
            <p className="text-[10px] text-zinc-400 font-mono lowercase truncate">{user.email}</p>
          </div>
          {user.isVerified && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-2 py-1 rounded-sm">
          {user.role?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4">
        {user.tenantId ? (
          <button className="text-[11px] font-bold text-zinc-900 border-b border-zinc-200 hover:border-black transition-all text-left">
            {user.tenantId.name}
          </button>
        ) : (
          <span className="text-[10px] text-zinc-300 font-mono tracking-tighter">N/A [PLATFORM]</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
          <span className={`text-[9px] font-bold uppercase tracking-widest ${user.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
            {user.isActive ? 'Active' : 'Suspended'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-[10px] font-mono text-zinc-500">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'NEVER'}
        </p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">
          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </td>
    </motion.tr>
  );
};

const FilterSelect = ({ icon, label, value, options, onChange }) => (
  <div className="relative group">
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100/50 border border-zinc-100 hover:border-zinc-300 transition-colors rounded-sm cursor-pointer">
      <span className="text-zinc-400">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-[10px] font-bold uppercase tracking-widest pr-4 outline-none cursor-pointer"
      >
        <option value="">{label}: ALL</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 text-zinc-400 pointer-events-none" />
    </div>
  </div>
);

const BulkActionBtn = ({ icon, label, onClick, disabled, variant = "default" }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${variant === "danger"
        ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
        : "bg-white/5 hover:bg-white hover:text-black"
      } disabled:opacity-20`}
  >
    {icon} {label}
  </button>
);

const SkeletonRow = () => (
  <tr className="border-b border-zinc-50">
    <td className="px-6 py-6" colSpan="7">
      <div className="h-4 bg-zinc-50 rounded-sm animate-pulse w-full" />
    </td>
  </tr>
);

export default UsersPage;