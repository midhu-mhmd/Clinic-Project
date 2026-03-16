import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowUpDown,
  Command,
  Plus, 
  UserX 
} from "lucide-react";
import UserProfileModal from "../../components/adminDashboard/UserProfileModal";

/* --- CONFIG --- */
const API_BASE_URL = "https://sovereigns.site/api";

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
const PatientsPage = () => {
  // Data State
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // Added selectedUser state
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (loading && page === 1) return <MinimalLoader />;

  return (
    <div className="bg-transparent text-zinc-900 font-sans selection:bg-zinc-100 antialiased">

      {/* 01. NAVIGATION BAR - Sticky below main header */}
      <nav className="border-b border-zinc-100 sticky top-16 bg-white/80 backdrop-blur-md z-40 -mx-6 lg:-mx-10 px-6 lg:px-10 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Command size={14} className="text-zinc-900" />
              <span className="text-xs font-bold tracking-tight uppercase">User Index</span>
            </div>

            <div className="h-4 w-[1px] bg-zinc-200" />

            <div className="flex items-center gap-2 text-zinc-400">
              <Search size={14} />
              <input
                type="text"
                placeholder="Probe identity..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-xs outline-none w-48 placeholder:text-zinc-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 border border-zinc-200 rounded px-2 py-1 cursor-pointer">
                <Filter size={12} className="text-zinc-400" />
                <select
                  className="bg-transparent text-zinc-600 outline-none text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  value={role}
                  onChange={(e) => { setRole(e.target.value); setPage(1); }}
                >
                  <option value="">Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="CLINIC_ADMIN">Clinic Admin</option>
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-zinc-200 rounded px-2 py-1 cursor-pointer">
                <Filter size={12} className="text-zinc-400" />
                <select
                  className="bg-transparent text-zinc-600 outline-none text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                >
                  <option value="">Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-zinc-200 rounded px-2 py-1 cursor-pointer">
                <Filter size={12} className="text-zinc-400" />
                <select
                  className="bg-transparent text-zinc-600 outline-none text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  value={tenantId}
                  onChange={(e) => { setTenantId(e.target.value); setPage(1); }}
                >
                  <option value="">Tenant</option>
                  {tenants.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 border border-zinc-200 rounded px-2 py-1 cursor-pointer">
                <Filter size={12} className="text-zinc-400" />
                <select
                  className="bg-transparent text-zinc-600 outline-none text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  value={lastActive}
                  onChange={(e) => { setLastActive(e.target.value); setPage(1); }}
                >
                  <option value="">Activity</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
            >
              <Download size={12} /> Export Archive
            </button>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* BULK ACTIONS TOOLBAR */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-6 border border-white/10 backdrop-blur-xl"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest border-r border-white/20 pr-6">
                {selectedUsers.length} Targets
              </span>
              <div className="flex items-center gap-3">
                <BulkActionBtn icon={<CheckCircle2 size={12} />} label="Activate" onClick={() => handleBulkStatus(true)} disabled={isBulkLoading} />
                <BulkActionBtn icon={<XCircle size={12} />} label="Suspend" onClick={() => handleBulkStatus(false)} disabled={isBulkLoading} variant="danger" />
                <BulkActionBtn icon={<LogOut size={12} />} label="Logout" onClick={handleBulkLogout} disabled={isBulkLoading} />
              </div>
              <button onClick={() => setSelectedUsers([])} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white underline underline-offset-4">Discard</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto custom-scrollbar pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="min-w-[1000px]">
            {/* 02. TABLE HEADER */}
            <div className="grid grid-cols-12 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-t-md text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <div className="col-span-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-black w-3 h-3"
                  onChange={(e) => {
                    if (e.target.checked) setSelectedUsers(users.map(u => u._id));
                    else setSelectedUsers([]);
                  }}
                  checked={selectedUsers.length === users.length && users.length > 0}
                />
                <span>Ref</span>
              </div>
              <div className="col-span-3 cursor-pointer hover:text-zinc-900 group flex items-center gap-1" onClick={() => toggleSort("name")}>
                User Profile <ArrowUpDown size={10} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortBy === 'name' ? 'opacity-100 text-zinc-900' : ''}`} />
              </div>
              <div className="col-span-2">System Role</div>
              <div className="col-span-2">Organization</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-center cursor-pointer hover:text-zinc-900 group flex items-center justify-center gap-1" onClick={() => toggleSort("lastLogin")}>
                Last Active <ArrowUpDown size={10} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortBy === 'lastLogin' ? 'opacity-100 text-zinc-900' : ''}`} />
              </div>
              <div className="col-span-1 text-center cursor-pointer hover:text-zinc-900 group flex items-center justify-center gap-1" onClick={() => toggleSort("createdAt")}>
                Registered <ArrowUpDown size={10} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortBy === 'createdAt' ? 'opacity-100 text-zinc-900' : ''}`} />
              </div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* 03. TABLE ROWS */}
            <div className="border-x border-b border-zinc-100 rounded-b-md divide-y divide-zinc-50">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="py-20 text-center text-xs text-zinc-400 uppercase tracking-widest">Synchronizing Archives...</div>
                ) : users.length > 0 ? (
                  users.map((user, index) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      index={(page - 1) * limit + index}
                      isSelected={selectedUsers.includes(user._id)}
                      onSelect={(id) => {
                        setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                      }}
                      onAction={() => setSelectedUser(user)} // Pass the whole user object
                      formatDate={formatDate}
                    />
                  ))
                ) : (
                  <div className="py-20 text-center text-xs text-zinc-400 uppercase tracking-widest">No records found</div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 04. PAGINATION */}
        {!error && totalPages > 1 && (
          <footer className="mt-8 flex items-center justify-between">
            <div className="text-[11px] text-zinc-400 font-medium">
              Showing {users.length} of {totalPages * limit} entities
            </div>
            <div className="flex gap-1 text-[11px] items-center">
              <span className="mr-4 text-zinc-400">Page {page} of {totalPages}</span>
              <PaginationBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </PaginationBtn>
              <PaginationBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={16} />
              </PaginationBtn>
            </div>
          </footer>
        )}
      </main>

      {/* 05. PROFILE MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <UserProfileModal
            userId={selectedUser._id}
            userData={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdate={fetchUsers}
          />
        )}
      </AnimatePresence>

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

const UserRow = ({ user, index, isSelected, onSelect, onAction, formatDate }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onAction} // Row click opens modal
      className={`grid grid-cols-12 items-center py-4 px-4 hover:bg-zinc-50/50 transition-colors group cursor-pointer ${isSelected ? 'bg-zinc-50/80 shadow-inner' : ''}`}
    >
      {/* Ref (Numbering) */}
      <div className="col-span-1 flex items-center gap-2 text-[11px] font-mono text-zinc-300">
        <input
          type="checkbox"
          className="accent-black w-3 h-3 cursor-pointer"
          checked={isSelected}
          onChange={() => onSelect(user._id)}
          onClick={(e) => e.stopPropagation()}
        />
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* User Profile */}
      <div className="col-span-3 flex items-center gap-3 pr-2">
        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
          <img
            src={user.image || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`}
            alt=""
            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          />
        </div>
        <div className="truncate">
          <h3 className="text-[13px] font-semibold text-zinc-900 leading-tight truncate flex items-center gap-1">
            {user.name}
            {user.isVerified && <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />}
          </h3>
          <p className="text-[10px] text-zinc-400 font-mono lowercase truncate mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Role */}
      <div className="col-span-2">
        <span className="text-[9px] font-mono font-bold text-zinc-400 px-1.5 py-0.5 border border-zinc-100 rounded-sm bg-zinc-50 uppercase tracking-widest">
          {user.role?.replace('_', ' ')}
        </span>
      </div>

      {/* Organization */}
      <div className="col-span-2 truncate pr-2">
        {user.tenantId ? (
          <span className="text-[11px] font-medium text-zinc-600">
            {user.tenantId.name}
          </span>
        ) : (
          <span className="text-[10px] text-zinc-300 font-mono tracking-tighter uppercase">Platform</span>
        )}
      </div>

      {/* Status */}
      <div className="col-span-1">
        <span className={`text-[8px] px-2 py-[2px] rounded-sm font-bold uppercase tracking-widest border ${user.isActive
          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
          : 'bg-red-50 text-red-600 border-red-100'
          }`}>
          {user.isActive ? 'Active' : 'Suspended'}
        </span>
      </div>

      {/* Last Active */}
      <div className="col-span-1 text-center">
        <span className="text-[11px] font-medium text-zinc-500">
          {user.lastLogin ? formatDate(user.lastLogin) : 'NEVER'}
        </span>
      </div>

      {/* Registered */}
      <div className="col-span-1 text-center">
        <span className="text-[11px] font-medium text-zinc-500">
          {formatDate(user.createdAt)}
        </span>
      </div>

      {/* Action Button */}
      <div className="col-span-1 text-right">
        <button 
          className="p-1 hover:bg-zinc-200 rounded transition-colors text-zinc-300 hover:text-zinc-900 group-hover:text-zinc-500"
          onClick={(e) => { e.stopPropagation(); onAction(); }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const PaginationBtn = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-1.5 border border-zinc-100 rounded bg-white text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 disabled:hover:border-zinc-100 transition-all"
  >
    {children}
  </button>
);

const BulkActionBtn = ({ icon, label, onClick, disabled, variant = "default" }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${variant === "danger"
      ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
      : "bg-white/10 text-white hover:bg-white hover:text-zinc-900"
      } disabled:opacity-20`}
  >
    {icon} {label}
  </button>
);

const MinimalLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="w-5 h-5 border-2 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
  </div>
);

export default PatientsPage;