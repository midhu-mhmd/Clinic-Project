import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  IndianRupee,
  ChevronRight,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserX,
  Building2
} from "lucide-react";

/**
 * UTILS
 */
const API_URL = "http://localhost:5000/api/doctors/directory";
const BULK_API_URL = "http://localhost:5000/api/doctors/bulk-status";
const EXPORT_API_URL = "http://localhost:5000/api/doctors/export-csv";

const GlobalDirectory = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    isActive: "",
    verificationStatus: "",
    hasSchedule: false,
    tenantId: "" // For superadmins
  });

  // Sorting
  const [sort, setSort] = useState({
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // UI States
  const [showFilters, setShowFilters] = useState(false);
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

      const { data } = await axios.get(API_URL, { params });
      setFaculty(data.data || []);
      setTotalCount(data.meta?.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      // Fallback/Mock data if API fails
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
      await axios.post(BULK_API_URL, payload);
      alert(`Success: Updated ${selectedIds.length} records.`);
      setSelectedIds([]);
      fetchFaculty();
    } catch (err) {
      console.error("Bulk action failed:", err);
      alert("Error performing bulk action.");
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
      const response = await axios.get(EXPORT_API_URL, {
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
      alert("Failed to export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && faculty.length === 0) return <MinimalLoader />;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-indigo-100 font-sans">
      {/* 01. NAVIGATION & UTILITY */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold tracking-tight text-indigo-600 uppercase border-r border-slate-200 pr-6">Global Directory</h1>
            <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search name, reg no, phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-sm outline-none w-64 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${showFilters ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 text-sm font-semibold bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-full hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <Download size={16} />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {/* 01.1 EXTENDED FILTERS */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white border-b border-slate-200"
            >
              <div className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-5 gap-6">
                <FilterGroup label="Specialty">
                  <select
                    value={filters.specialization}
                    onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </FilterGroup>

                <FilterGroup label="Status">
                  <select
                    value={filters.isActive}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                  </select>
                </FilterGroup>

                <FilterGroup label="Verification">
                  <select
                    value={filters.verificationStatus}
                    onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">All Verifications</option>
                    <option value="PENDING">Pending Verification</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </FilterGroup>

                <FilterGroup label="Tenant / Clinic">
                  <input
                    type="text"
                    placeholder="Tenant ID..."
                    value={filters.tenantId}
                    onChange={(e) => setFilters({ ...filters, tenantId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </FilterGroup>

                <FilterGroup label="Requirements">
                  <button
                    onClick={() => setFilters({ ...filters, hasSchedule: !filters.hasSchedule })}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-lg border transition-all ${filters.hasSchedule ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    <span className="text-sm font-medium">Has Schedule</span>
                    {filters.hasSchedule ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </FilterGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        {/* 02. BULK ACTIONS BAR */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="mb-6 bg-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-indigo-200"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{selectedIds.length} Practitioners Selected</h3>
                  <p className="text-[11px] text-indigo-100">Perform bulk actions on the selected registry items</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BulkBtn onClick={() => handleBulkAction('isActive', true)} icon={<UserCheck size={14} />}>Activate</BulkBtn>
                <BulkBtn onClick={() => handleBulkAction('isActive', false)} icon={<UserX size={14} />}>Deactivate</BulkBtn>
                <div className="w-px h-8 bg-white/20 mx-2" />
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-bold uppercase tracking-widest px-4 hover:underline"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 03. DATA TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-[40px_minmax(250px,2fr)_1fr_1fr_1.2fr_1.2fr_1fr_80px] items-center px-6 py-4 bg-slate-50/80 border-b border-slate-200">
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={selectedIds.length === faculty.length && faculty.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <SortHeader label="Practitioner" field="name" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Dept" field="specialization" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Consult Fee" field="consultationFee" currentSort={sort} onSort={handleSort} />
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic / Tenant</div>
            <SortHeader label="Registered" field="createdAt" currentSort={sort} onSort={handleSort} />
            <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</div>
          </div>

          {/* TABLE BODY */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Synchronizing Registry...</span>
              </div>
            ) : faculty.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <AlertCircle size={32} strokeWidth={1.5} />
                <span className="text-sm">No practitioners found matching your criteria.</span>
              </div>
            ) : (
              faculty.map((doc, index) => (
                <FacultyRow
                  key={doc._id}
                  doc={doc}
                  isSelected={selectedIds.includes(doc._id)}
                  onSelect={() => toggleSelect(doc._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* 04. PAGINATION */}
        <footer className="mt-8 flex items-center justify-between">
          <p className="text-[13px] text-slate-500">
            Showing <span className="text-slate-900 font-bold">{faculty.length}</span> of {totalCount} entries
          </p>
          <div className="flex gap-2">
            <NavBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>
              <ArrowLeft size={16} />
              Previous
            </NavBtn>
            <div className="flex items-center px-6 text-sm font-bold bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700">
              {currentPage} / {totalPages || 1}
            </div>
            <NavBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading}>
              Next
              <ArrowRight size={16} />
            </NavBtn>
          </div>
        </footer>
      </main>
    </div>
  );
};

/**
 * SUB-COMPONENTS
 */

const FacultyRow = ({ doc, isSelected, onSelect }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`grid grid-cols-[40px_minmax(250px,2fr)_1fr_1fr_1.2fr_1.2fr_1fr_80px] items-center px-6 py-4 transition-colors hover:bg-slate-50/80 group ${isSelected ? 'bg-indigo-50/30' : ''}`}
  >
    <div className="flex justify-center">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
    </div>

    <div className="flex items-center gap-4">
      <div className="relative w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
        <img
          src={doc.image || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.name}`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
          {doc.name}
          {doc.verificationStatus === 'VERIFIED' && <CheckCircle size={14} className="text-blue-500 fill-blue-50" />}
        </h3>
        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
          {doc.regNo ? `REG: ${doc.regNo}` : `ID: ${doc._id.slice(-8).toUpperCase()}`}
        </p>
      </div>
    </div>

    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 w-fit">
        <Briefcase size={10} className="text-slate-400" />
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{doc.specialization}</span>
      </div>
    </div>

    <div className="flex items-center gap-1">
      <IndianRupee size={12} className="text-slate-400" />
      <span className="text-[13px] font-bold text-slate-900 leading-none">{doc.consultationFee?.toLocaleString() || '0'}</span>
    </div>

    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <StatusDot active={doc.isActive} />
        <span className="text-[11px] font-semibold text-slate-700">{doc.isActive ? 'Active' : 'Inactive'}</span>
      </div>
      <div className={`text-[10px] font-bold w-fit px-2 py-0.5 rounded uppercase ${doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' :
        doc.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
        }`}>
        {doc.verificationStatus || 'Pending'}
      </div>
    </div>

    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-700">
        <Building2 size={14} className="text-slate-400" />
        <span className="text-[12px] font-semibold truncate">{doc.tenantId?.name || 'Protocol Hub'}</span>
      </div>
      <span className="text-[10px] font-mono text-slate-400 ml-5">#{doc.tenantId?.registrationId?.slice(-6) || 'N/A'}</span>
    </div>

    <div className="flex flex-col">
      <span className="text-[12px] font-bold text-slate-700">{new Date(doc.createdAt).toLocaleDateString()}</span>
      <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight flex items-center gap-1">
        <Clock size={10} />
        {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>

    <div className="text-right">
      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
  </motion.div>
);

const SortHeader = ({ label, field, currentSort, onSort }) => {
  const isActive = currentSort.sortBy === field;
  return (
    <div
      onClick={() => onSort(field)}
      className="flex items-center gap-2 cursor-pointer group w-fit"
    >
      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {label}
      </span>
      <div className={`transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-50'}`}>
        {currentSort.sortOrder === 'asc' ? <ChevronUp size={12} className="text-indigo-600" /> : <ChevronDown size={12} className="text-indigo-600" />}
      </div>
    </div>
  );
};

const FilterGroup = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
    {children}
  </div>
);

const BulkBtn = ({ children, onClick, icon }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
  >
    {icon}
    {children}
  </button>
);

const StatusDot = ({ active }) => (
  <div className={`w-2 h-2 rounded-full ring-4 ${active ? 'bg-emerald-500 ring-emerald-500/10' : 'bg-slate-300 ring-slate-300/10'}`} />
);

const NavBtn = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
  >
    {children}
  </button>
);

const MinimalLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Protocol...</span>
    </div>
  </div>
);

export default GlobalDirectory;
