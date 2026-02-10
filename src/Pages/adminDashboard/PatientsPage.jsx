import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Activity,
  MoreHorizontal,
  Command,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
  Droplet
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const normalizeRole = (role) => String(role || "").trim().toUpperCase();

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication Required");
          return;
        }

        const { data } = await axios.get(`${API_BASE_URL}/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allUsers = Array.isArray(data) ? data : data.data || [];
        // Strictly filter for Patients only
        const patientData = allUsers.filter((u) => normalizeRole(u.role) === "PATIENT");
        setPatients(patientData);
        setError(null);
      } catch (err) {
        setError("Clinical archive unreachable.");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => 
      (p.name || "").toLowerCase().includes(q) || 
      String(p.patientId || p._id).toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedItems = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (loading) return <MinimalLoader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100 antialiased">
      
      {/* 01. NAVIGATION & SEARCH */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Command size={14} className="text-zinc-900" />
              <span className="text-xs font-bold tracking-tight uppercase">Medical Records</span>
            </div>
            <div className="h-4 w-[1px] bg-zinc-200" />
            <div className="flex items-center gap-2 text-zinc-400 focus-within:text-zinc-900 transition-colors">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Filter by name or UID..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs outline-none w-64 placeholder:text-zinc-300"
              />
            </div>
          </div>
          <div className="hidden md:block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Biological Data Index 2026
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-5">

        {/* 02. DATA TABLE HEADER */}
        <div className="grid grid-cols-12 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-t-md text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <div className="col-span-1">Ref</div>
          <div className="col-span-4">Patient Profile</div>
          <div className="col-span-2">Bio-Metrics</div>
          <div className="col-span-2">Blood Type</div>
          <div className="col-span-2 text-center">Stability</div>
          <div className="col-span-1 text-right">View</div>
        </div>

        {/* 03. TABLE BODY */}
        <div className="border-x border-b border-zinc-100 rounded-b-md divide-y divide-zinc-50 bg-white shadow-sm">
          <AnimatePresence mode="wait">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((patient, index) => (
                <PatientRow 
                  key={patient._id || index} 
                  patient={patient} 
                  index={(currentPage - 1) * itemsPerPage + index} 
                />
              ))
            ) : (
              <div className="py-24 text-center">
                <p className="text-xs text-zinc-400 uppercase tracking-[0.2em]">No patient records found</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* 04. PAGINATION */}
        {totalPages > 1 && (
          <footer className="mt-8 flex items-center justify-between">
            <div className="text-[11px] text-zinc-400 font-medium">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
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

const PatientRow = ({ patient, index }) => {
  const isCritical = String(patient.status || "").toLowerCase() === "critical";
  const uid = (patient.patientId || patient._id || "N/A").slice(-8).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-12 items-center py-4 px-4 hover:bg-zinc-50/80 transition-all group cursor-pointer"
    >
      <div className="col-span-1 text-[11px] font-mono text-zinc-300">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="col-span-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200/50">
          <img 
            src={patient.img || `https://api.dicebear.com/7.x/micah/svg?seed=${patient.name}`} 
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
            alt="" 
          />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-900 leading-tight group-hover:text-black">{patient.name || "Anonymous"}</h3>
          <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
            UID: {uid}
          </p>
        </div>
      </div>

      <div className="col-span-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-zinc-600 flex items-center gap-1">
            <User size={10} className="text-zinc-300" />
            {patient.age || "--"}y / {patient.gender || "N/A"}
          </span>
        </div>
      </div>

      <div className="col-span-2">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Droplet size={12} className={patient.blood ? "text-red-400" : "text-zinc-200"} />
          <span className="text-[11px] font-mono font-bold tracking-tighter">{patient.blood || "UNK"}</span>
        </div>
      </div>

      <div className="col-span-2 flex justify-center">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
          <span className={`text-[9px] font-bold uppercase tracking-widest ${isCritical ? "text-red-600" : "text-emerald-600"}`}>
            {isCritical ? "Critical" : "Stable"}
          </span>
        </div>
      </div>

      <div className="col-span-1 text-right">
        <div className="flex items-center justify-end group-hover:translate-x-1 transition-transform">
          <ArrowRight size={14} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
};

const PaginationBtn = ({ children, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className="p-1.5 border border-zinc-100 rounded bg-white text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-20 disabled:hover:border-zinc-100 transition-all"
  >
    {children}
  </button>
);

const MinimalLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
    <div className="w-5 h-5 border-2 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mb-4" />
    <span className="text-[10px] uppercase tracking-widest text-zinc-400">Loading Archive</span>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-zinc-500">
    <AlertCircle size={20} className="mb-4 text-red-200" />
    <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
    <button onClick={() => window.location.reload()} className="mt-6 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-zinc-900 pb-0.5 text-zinc-900">
      Refresh System
    </button>
  </div>
);

export default PatientsPage;