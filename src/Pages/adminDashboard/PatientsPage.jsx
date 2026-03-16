import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, MoreHorizontal, ChevronLeft, ChevronRight, Users } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
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
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const results = Array.isArray(data) ? data : data.data || data.patients || [];
        setPatients(results);
        setError(null);
      } catch (err) {
        setError("Database connection offline or unauthorized.");
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      return (
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [patients, searchQuery]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedItems = filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <MinimalLoader />;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
      {/* NAVIGATION BAR */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-zinc-900" />
              <span className="text-xs font-bold tracking-tight uppercase">Patients</span>
            </div>
            <div className="h-4 w-[1px] bg-zinc-200" />
            <div className="flex items-center gap-2 text-zinc-400">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs outline-none w-48 placeholder:text-zinc-300"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="overflow-x-auto custom-scrollbar pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="min-w-[900px]">
            {/* TABLE HEADER */}
            <div className="grid grid-cols-12 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-t-md text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Registered</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            {/* TABLE ROWS */}
            <div className="border-x border-b border-zinc-100 rounded-b-md divide-y divide-zinc-50">
              <AnimatePresence mode="wait">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((patient, index) => (
                    <PatientRow
                      key={patient._id || index}
                      patient={patient}
                      index={(currentPage - 1) * itemsPerPage + index}
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
        {/* PAGINATION */}
        {!error && totalPages > 1 && (
          <footer className="mt-8 flex items-center justify-between">
            <div className="text-[11px] text-zinc-400 font-medium">
              Showing {paginatedItems.length} of {filteredPatients.length} patients
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
      {/* ERROR OVERLAY */}
      {error && (
        <div className="fixed top-24 right-8 bg-white border border-red-100 p-4 rounded-xl shadow-xl flex items-center gap-4 animate-in slide-in-from-right duration-500 z-50">
          <div className="p-2 bg-red-50 text-red-500 rounded-lg">
            <span>!</span>
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

const PatientRow = ({ patient, index, formatDate }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-12 items-center py-4 px-4 hover:bg-zinc-50/50 transition-colors group cursor-pointer"
    >
      <div className="col-span-1 text-[11px] font-mono text-zinc-300">{String(index + 1).padStart(2, '0')}</div>
      <div className="col-span-3 flex items-center gap-3 pr-2">
        <img src={patient.image || `https://api.dicebear.com/7.x/micah/svg?seed=${patient.email}`} alt="Avatar" className="w-9 h-9 flex-shrink-0 rounded bg-zinc-100 object-cover border border-zinc-200/50" />
        <div className="truncate">
          <h3 className="text-[13px] font-semibold text-zinc-900 leading-tight truncate">{patient.name || "Unnamed Patient"}</h3>
        </div>
      </div>
      <div className="col-span-2 text-[10px] font-mono text-zinc-500 truncate pr-2">{patient.email}</div>
      <div className="col-span-2 text-[10px] font-mono text-zinc-500 truncate pr-2">{patient.phoneNumber || "N/A"}</div>
      <div className="col-span-2 flex items-center gap-1.5 text-zinc-500">
        <Calendar size={12} className="text-zinc-300" />
        <span className="text-[11px] font-medium">{formatDate(patient.createdAt)}</span>
      </div>
      <div className="col-span-2 text-right">
        <button className="p-1 hover:bg-zinc-200 rounded transition-colors text-zinc-300 hover:text-zinc-900 group-hover:text-zinc-500">
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

export default PatientsPage;