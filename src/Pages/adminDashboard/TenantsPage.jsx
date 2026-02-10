import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Activity, Command, ChevronLeft, ChevronRight, Building2, MoreHorizontal, Calendar } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const TenantsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
        const { data } = await axios.get(`${API_BASE_URL}/tenants/all`);
        // Ensure we handle different backend response shapes
        const results = Array.isArray(data) ? data : data.data || data.tenants || [];
        setClinics(results);
        setError(null);
      } catch (err) {
        setError("Database connection offline.");
        setClinics([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clinics, searchQuery]);

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const paginatedItems = filteredClinics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <MinimalLoader />;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
      
      {/* 01. NAVIGATION BAR */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                className="bg-transparent text-xs outline-none w-64 placeholder:text-zinc-300"
              />
            </div>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Relational Index 2026
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 02. TABLE HEADER */}
        <div className="grid grid-cols-12 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-t-md text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <div className="col-span-1">Ref</div>
          <div className="col-span-4">Clinical Entity</div>
          <div className="col-span-2">Registration Date</div>
          <div className="col-span-2">Tier / Plan</div>
          <div className="col-span-2 text-center">Status</div>
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
                />
              ))
            ) : (
              <div className="py-20 text-center text-xs text-zinc-400 uppercase tracking-widest">No records found</div>
            )}
          </AnimatePresence>
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
    </div>
  );
};

const ClinicRow = ({ clinic, index, formatDate }) => {
  // Extracting dynamic data
  const clinicId = clinic._id || clinic.id || "N/A";
  const plan = clinic.subscription?.plan || clinic.tier || "BASIC";
  const status = (clinic.subscription?.status || clinic.status || "PENDING").toUpperCase();
  const location = clinic.location || clinic.city || clinic.address || "Global";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-12 items-center py-4 px-4 hover:bg-zinc-50/50 transition-colors group"
    >
      {/* Ref (Numbering) */}
      <div className="col-span-1 text-[11px] font-mono text-zinc-300">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Name and ID */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-zinc-100 flex items-center justify-center border border-zinc-200/50">
          <Building2 size={16} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-900 leading-tight">{clinic.name || "Unnamed Clinic"}</h3>
          <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
            <MapPin size={10} /> {location}
          </p>
        </div>
      </div>

      {/* CreatedAt Date */}
      <div className="col-span-2 flex items-center gap-1.5 text-zinc-500">
        <Calendar size={12} className="text-zinc-300" />
        <span className="text-[11px] font-medium">{formatDate(clinic.createdAt)}</span>
      </div>

      {/* Subscription Plan */}
      <div className="col-span-2">
        <span className="text-[10px] font-mono font-bold text-zinc-400 px-2 py-0.5 border border-zinc-100 rounded-sm bg-zinc-50">
          {plan}
        </span>
        <p className="text-[9px] text-zinc-300 mt-1 uppercase font-bold tracking-tighter">ID: {clinicId.slice(-6)}</p>
      </div>

      {/* Status Badge */}
      <div className="col-span-2 flex justify-center">
        <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest border ${
          status === 'ACTIVE' 
          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
          : 'bg-orange-50 text-orange-600 border-orange-100'
        }`}>
          {status}
        </span>
      </div>

      {/* Action Button */}
      <div className="col-span-1 text-right">
        <button className="p-1 hover:bg-zinc-200 rounded transition-colors text-zinc-300 hover:text-zinc-900">
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