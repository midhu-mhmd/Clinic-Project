import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Command, ChevronLeft, ChevronRight, Building2, MoreHorizontal, Calendar, Plus, Filter } from "lucide-react";
import TenantProfileModal from "../../components/adminDashboard/TenantProfileModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

const TenantsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Date Formatter Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  useEffect(() => {
    const fetchClinics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/tenants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Ensure we handle different backend response shapes
        const results = Array.isArray(data) ? data : data.data || data.tenants || [];
        setClinics(results);
        setError(null);
      } catch (err) {
        setError("Database connection offline or unauthorized.");
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => {
      const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const plan = c.subscription?.plan || c.tier || "BASIC";
      const status = (c.subscription?.status || c.status || "PENDING").toUpperCase();

      const matchesPlan = filterPlan ? plan === filterPlan : true;
      const matchesStatus = filterStatus ? status === filterStatus : true;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [clinics, searchQuery, filterPlan, filterStatus]);

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const paginatedItems = filteredClinics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <MinimalLoader />;

  return (
    <div className="bg-transparent text-zinc-900 font-sans selection:bg-zinc-100 antialiased">

      {/* 01. NAVIGATION BAR - Sticky below main header */}
      <nav className="border-b border-zinc-100 sticky top-16 bg-white/80 backdrop-blur-md z-40 lg:-mx-10 lg:px-10 px-4 py-3 mb-6 -mx-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <div className="flex items-center gap-2">
              <Command size={14} className="text-zinc-900" />
              <span className="text-xs font-bold tracking-tight uppercase">Registry</span>
            </div>

            <div className="h-4 w-[1px] bg-zinc-200" />

            <div className="flex items-center gap-2 text-zinc-400">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs outline-none w-48 placeholder:text-zinc-300"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-2 border border-zinc-200 rounded px-2 py-1 cursor-pointer">
                <Filter size={12} className="text-zinc-400" />
                <select
                  className="bg-transparent text-zinc-600 outline-none text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  value={filterPlan}
                  onChange={(e) => { setFilterPlan(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Plans</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-zinc-200 rounded px-2 py-1 cursor-pointer">
                <Filter size={12} className="text-zinc-400" />
                <select
                  className="bg-transparent text-zinc-600 outline-none text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING_VERIFICATION">PENDING</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
              </div>
            </div>

            <button
              className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors w-full lg:w-auto"
              onClick={() => alert("Redirecting to tenant manual onboarding portal...")}
            >
              <Plus size={12} /> Invite Tenant
            </button>
          </div>
        </div>
      </nav>

      <main className="relative">
        <div className="overflow-x-auto custom-scrollbar pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="min-w-[1000px]">
            {/* 02. TABLE HEADER */}
            <div className="grid grid-cols-12 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-t-md text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <div className="col-span-1">Ref</div>
              <div className="col-span-3">Clinical Entity</div>
              <div className="col-span-2">Registration ID</div>
              <div className="col-span-2">Reg. Date</div>
              <div className="col-span-1">Plan</div>
              <div className="col-span-1 text-center">Billing</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* 03. TABLE ROWS */}
            <div className="border-x border-b border-zinc-100 rounded-b-md divide-y divide-zinc-50">
              <AnimatePresence mode="wait">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((clinic, index) => (
                    <ClinicRow
                      key={clinic._id || index}
                      clinic={clinic}
                      index={(currentPage - 1) * itemsPerPage + index}
                      formatDate={formatDate}
                      onClick={() => setSelectedTenant(clinic._id)}
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
              Showing {paginatedItems.length} of {filteredClinics.length} entities
            </div>
            <div className="flex gap-1 text-[11px] items-center">
              <span className="mr-4 text-zinc-400">Page {currentPage} of {totalPages}</span>
              <PaginationBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </PaginationBtn>
              <PaginationBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight size={16} />
              </PaginationBtn>
            </div>
          </footer>
        )}
      </main>

      {/* 05. PROFILE MODAL */}
      <AnimatePresence>
        {selectedTenant && (
          <TenantProfileModal
            tenantId={selectedTenant}
            onClose={() => setSelectedTenant(null)}
            onStatusChange={(id, newStatus) => {
              setClinics(clinics.map(c => c._id === id ? { ...c, isActive: newStatus } : c));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ClinicRow = ({ clinic, index, formatDate, onClick }) => {
  // Extracting dynamic data
  const clinicId = clinic._id || clinic.id || "N/A";
  const plan = clinic.subscription?.plan || clinic.tier || "BASIC";
  const status = (clinic.subscription?.status || clinic.status || "PENDING").toUpperCase();
  const location = clinic.location || clinic.city || clinic.address || "Global";
  const image = clinic.image || clinic.img || "https://images.unsplash.com/photo-1629909613654-2871b886daa4";
  const registrationId = clinic.registrationId || "N/A";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="grid grid-cols-12 items-center py-4 px-4 hover:bg-zinc-50/50 transition-colors group cursor-pointer"
    >
      {/* Ref (Numbering) */}
      <div className="col-span-1 text-[11px] font-mono text-zinc-300">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Name and Image */}
      <div className="col-span-3 flex items-center gap-3 pr-2">
        <img src={image} alt="Logo" className="w-9 h-9 flex-shrink-0 rounded bg-zinc-100 object-cover border border-zinc-200/50" />
        <div className="truncate">
          <h3 className="text-[13px] font-semibold text-zinc-900 leading-tight truncate">{clinic.name || "Unnamed Clinic"}</h3>
          <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 uppercase tracking-tighter truncate">
            <MapPin size={10} className="flex-shrink-0" /> <span className="truncate">{location}</span>
          </p>
        </div>
      </div>

      {/* Registration ID */}
      <div className="col-span-2 text-[10px] font-mono text-zinc-500 truncate pr-2">
        {registrationId}
      </div>

      {/* CreatedAt Date */}
      <div className="col-span-2 flex items-center gap-1.5 text-zinc-500">
        <Calendar size={12} className="text-zinc-300" />
        <span className="text-[11px] font-medium">{formatDate(clinic.createdAt)}</span>
      </div>

      {/* Subscription Plan */}
      <div className="col-span-1">
        <span className="text-[9px] font-mono font-bold text-zinc-400 px-1.5 py-0.5 border border-zinc-100 rounded-sm bg-zinc-50">
          {plan}
        </span>
      </div>

      {/* Billing Status */}
      <div className="col-span-1 flex justify-center">
        <span className={`text-[8px] px-2 py-[2px] rounded-sm font-bold uppercase tracking-widest border ${status === 'ACTIVE'
          ? 'bg-blue-50 text-blue-600 border-blue-100'
          : 'bg-orange-50 text-orange-600 border-orange-100'
          }`}>
          {status}
        </span>
      </div>

      {/* Account Status */}
      <div className="col-span-1 flex justify-center">
        <span className={`text-[8px] px-2 py-[2px] rounded-sm font-bold uppercase tracking-widest border ${clinic.isActive !== false
          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
          : 'bg-red-50 text-red-600 border-red-100'
          }`}>
          {clinic.isActive !== false ? "Active" : "Suspended"}
        </span>
      </div>

      {/* Action Button */}
      <div className="col-span-1 text-right">
        <button 
          className="p-1 hover:bg-zinc-200 rounded transition-colors text-zinc-300 hover:text-zinc-900 group-hover:text-zinc-500"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
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

const MinimalLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="w-5 h-5 border-2 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
  </div>
);

export default TenantsPage;