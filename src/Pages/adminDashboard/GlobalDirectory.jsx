import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowLeft,
  ChevronRight,
  Filter,
  Download,
  CheckCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Command,
  ArrowUpDown,
  ChevronLeft
} from "lucide-react";

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

const GlobalDirectory = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    isActive: "",
    verificationStatus: "",
    hasSchedule: false,
    tenantId: ""
  });

  // Sorting
  const [sort, setSort] = useState({
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // UI States
  const [isExporting, setIsExporting] = useState(false);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        specialization: filters.specialization,
        isActive: filters.isActive,
        verificationStatus: filters.verificationStatus,
        hasSchedule: filters.hasSchedule,
        tenantId: filters.tenantId
      };

      const { data } = await api.get("/doctors/directory", { params });
      setFaculty(data.data || []);
      setTotalCount(data.meta?.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, sort, filters]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFaculty();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchFaculty]);

  const handleSort = (field) => {
    setSort(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
    setCurrentPage(1);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === faculty.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(faculty.map(f => f._id));
    }
  };

  const handleBulkAction = async (actionType, value) => {
    if (selectedIds.length === 0) return;
    try {
      const payload = {
        doctorIds: selectedIds,
        [actionType]: value
      };
      await api.post("/doctors/bulk-status", payload);
      setSelectedIds([]);
      fetchFaculty();
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const params = {
        search: searchQuery,
        specialization: filters.specialization,
        isActive: filters.isActive,
        verificationStatus: filters.verificationStatus,
        hasSchedule: filters.hasSchedule,
        tenantId: filters.tenantId
      };
      const response = await api.get("/doctors/export-csv", {
        params,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `practitioners_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(dateString));
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && currentPage === 1) return <MinimalLoader />;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100 antialiased">
      {/* 01. NAVIGATION BAR */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Command size={14} className="text-zinc-900" />
              <span className="text-xs font-bold tracking-tight uppercase">Faculty Registry</span>
            </div>

            <div className="h-4 w-[1px] bg-zinc-200" />

            <div className="flex items-center gap-2 text-zinc-400">
              <Search size={14} />
              <input
                type="text"
                placeholder="Probe practitioners..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                  value={filters.specialization}
                  onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                >
                  <option value="">Spec</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-zinc-200 rounded px-2 py-1 cursor-pointer">
                <Filter size={12} className="text-zinc-400" />
                <select
                  className="bg-transparent text-zinc-600 outline-none text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                >
                  <option value="">Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
            >
              <Download size={12} /> {isExporting ? "Processing..." : "Export CSV"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {/* BULK ACTIONS TOOLBAR */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-6 border border-white/10 backdrop-blur-xl"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest border-r border-white/20 pr-6">
                {selectedIds.length} Targets
              </span>
              <div className="flex items-center gap-3">
                <BulkActionBtn icon={<UserCheck size={12} />} label="Activate" onClick={() => handleBulkAction('isActive', true)} />
                <BulkActionBtn icon={<UserX size={12} />} label="Deactivate" onClick={() => handleBulkAction('isActive', false)} variant="danger" />
              </div>
              <button onClick={() => setSelectedIds([])} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white underline underline-offset-4">Discard</button>
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
                  checked={selectedIds.length === faculty.length && faculty.length > 0}
                  onChange={toggleSelectAll}
                />
                <span>Ref</span>
              </div>
              <div className="col-span-3 cursor-pointer hover:text-zinc-900 group flex items-center gap-1" onClick={() => handleSort("name")}>
                Practitioner <ArrowUpDown size={10} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sort.sortBy === 'name' ? 'opacity-100 text-zinc-900' : ''}`} />
              </div>
              <div className="col-span-2">Department</div>
              <div className="col-span-1">Fee</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Verification</div>
              <div className="col-span-2">Affiliation</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* 03. TABLE ROWS */}
            <div className="border-x border-b border-zinc-100 rounded-b-md divide-y divide-zinc-50">
              <AnimatePresence mode="wait">
                {loading && currentPage === 1 ? (
                  <div className="py-20 text-center text-xs text-zinc-400 uppercase tracking-widest">Synchronizing Directory...</div>
                ) : faculty.length > 0 ? (
                  faculty.map((doc, index) => (
                    <FacultyRow
                      key={doc._id}
                      doc={doc}
                      index={(currentPage - 1) * itemsPerPage + index}
                      isSelected={selectedIds.includes(doc._id)}
                      onSelect={() => toggleSelect(doc._id)}
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
        {totalPages > 1 && (
          <footer className="mt-8 flex items-center justify-between">
            <div className="text-[11px] text-zinc-400 font-medium">
              Showing {faculty.length} of {totalCount} practitioners
            </div>
            <div className="flex gap-1 text-[11px] items-center">
              <span className="mr-4 text-zinc-400">Page {currentPage} of {totalPages}</span>
              <PaginationBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>
                <ChevronLeft size={16} />
              </PaginationBtn>
              <PaginationBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading}>
                <ChevronRight size={16} />
              </PaginationBtn>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const FacultyRow = ({ doc, index, isSelected, onSelect, formatDate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`grid grid-cols-12 items-center py-4 px-4 hover:bg-zinc-50/50 transition-colors group cursor-pointer ${isSelected ? 'bg-zinc-50/80 shadow-inner' : ''}`}
  >
    {/* Ref */}
    <div className="col-span-1 flex items-center gap-2 text-[11px] font-mono text-zinc-300">
      <input
        type="checkbox"
        className="accent-black w-3 h-3 cursor-pointer"
        checked={isSelected}
        onChange={onSelect}
        onClick={(e) => e.stopPropagation()}
      />
      {String(index + 1).padStart(2, '0')}
    </div>

    {/* Practitioner */}
    <div className="col-span-3 flex items-center gap-3 pr-2">
      <div className="w-9 h-9 flex-shrink-0 rounded bg-zinc-100 border border-zinc-200 overflow-hidden">
        <img
          src={doc.image || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.name}`}
          alt=""
          className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
        />
      </div>
      <div className="truncate">
        <h3 className="text-[13px] font-semibold text-zinc-900 leading-tight truncate flex items-center gap-1">
          {doc.name}
          {doc.verificationStatus === 'VERIFIED' && <CheckCircle size={10} className="text-blue-500 shrink-0" />}
        </h3>
        <p className="text-[10px] text-zinc-400 font-mono uppercase truncate mt-0.5">
          {doc.regNo || doc._id.slice(-8).toUpperCase()}
        </p>
      </div>
    </div>

    {/* Department */}
    <div className="col-span-2">
      <span className="text-[9px] font-mono font-bold text-zinc-400 px-1.5 py-0.5 border border-zinc-100 rounded-sm bg-zinc-50 uppercase tracking-widest truncate max-w-full inline-block">
        {doc.specialization}
      </span>
    </div>

    {/* Fee */}
    <div className="col-span-1">
      <span className="text-[11px] font-bold text-zinc-900">
        ₹{doc.consultationFee?.toLocaleString()}
      </span>
    </div>

    {/* Status */}
    <div className="col-span-1">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${doc.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${doc.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
          {doc.isActive ? 'Active' : 'N/A'}
        </span>
      </div>
    </div>

    {/* Verification */}
    <div className="col-span-1">
      <span className={`text-[8px] px-2 py-[2px] rounded-sm font-bold uppercase tracking-widest border ${doc.verificationStatus === 'VERIFIED'
        ? 'bg-blue-50 text-blue-600 border-blue-100'
        : doc.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
        }`}>
        {doc.verificationStatus || 'PENDING'}
      </span>
    </div>

    {/* Affiliation */}
    <div className="col-span-2 truncate pr-2">
      <div className="flex flex-col">
        <span className="text-[11px] font-medium text-zinc-600 truncate">
          {doc.tenantId?.name || 'Protocol Hub'}
        </span>
        <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-tighter">
          #{doc.tenantId?.registrationId?.slice(-6) || 'N/A'}
        </span>
      </div>
    </div>

    {/* Action */}
    <div className="col-span-1 text-right">
      <button className="p-1 hover:bg-zinc-200 rounded transition-colors text-zinc-300 hover:text-zinc-900 group-hover:text-zinc-500">
        <MoreVertical size={14} />
      </button>
    </div>
  </motion.div>
);

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

const FilterGroup = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</label>
    {children}
  </div>
);

export default GlobalDirectory;
