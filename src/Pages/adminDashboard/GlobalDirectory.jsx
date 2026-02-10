import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, ArrowLeft, Clock, Calendar, IndianRupee, ChevronRight } from "lucide-react";

const GlobalDirectory = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:5000/api/doctors/directory");
        const extracted = Array.isArray(data) ? data : data.doctors || data.data || [];
        setFaculty(extracted);
      } catch (err) {
        console.error("Fetch error:", err);
        setFaculty([
          { id: "01", name: "Dr. Julian Voss", specialty: "Neural Restoration", clinic: "Zurich", fee: "2,500", duty: "Mon - Wed", time: "09:00 - 14:00" },
          { id: "02", name: "Dr. Elena Thorne", specialty: "Cardiac Architecture", clinic: "London", fee: "3,000", duty: "Tue - Fri", time: "11:00 - 17:00" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const filtered = useMemo(() => {
    return faculty.filter(f => 
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [faculty, searchQuery]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <MinimalLoader />;

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100 font-sans">
      {/* 01. UTILITY BAR */}
      <div className="border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-tighter border-r border-zinc-200 pr-4 uppercase">Registry</span>
            <div className="flex items-center gap-2 text-zinc-400">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Filter by name..." 
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs outline-none w-48 placeholder:text-zinc-300"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-5">
        {/* 02. TABLE HEADER */}
        <div className="grid grid-cols-12 px-3 py-3 bg-zinc-50/50 border border-zinc-100 rounded-t-lg text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <div className="col-span-1">Ref</div>
          <div className="col-span-4">Practitioner</div>
          <div className="col-span-2">Consultation</div>
          <div className="col-span-3">Availability</div>
          <div className="col-span-2 text-right">Location</div>
        </div>

        {/* 03. DATA ROWS */}
        <div className="border-x border-b border-zinc-100 rounded-b-lg divide-y divide-zinc-50">
          <AnimatePresence mode="wait">
            {paginatedItems.map((doc, index) => (
              <FacultyRow key={doc.id || index} doc={doc} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* 04. PAGINATION */}
        <footer className="mt-8 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            Showing <span className="text-zinc-900 font-medium">{paginatedItems.length}</span> of {filtered.length}
          </p>
          <div className="flex gap-1">
            <NavBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ArrowLeft size={14} />
            </NavBtn>
            <div className="flex items-center px-4 text-[11px] font-medium border border-zinc-100 rounded-md bg-white">
              {currentPage} / {totalPages || 1}
            </div>
            <NavBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ArrowRight size={14} />
            </NavBtn>
          </div>
        </footer>
      </main>
    </div>
  );
};

const FacultyRow = ({ doc, index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid grid-cols-1 md:grid-cols-12 items-center py-4 px-3 hover:bg-zinc-50/50 transition-colors group"
  >
    <div className="hidden md:block col-span-1 text-[11px] font-mono text-zinc-400">
      {String(index + 1).padStart(2, '0')}
    </div>

    <div className="col-span-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-zinc-100 overflow-hidden border border-zinc-200">
        <img src={doc.image || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.name}`} alt="" className="w-full h-full object-cover grayscale" />
      </div>
      <div>
        <h3 className="text-[13px] font-semibold text-zinc-900 leading-none">{doc.name}</h3>
        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tight">{doc.specialty}</p>
      </div>
    </div>

    <div className="col-span-2 flex items-center gap-1">
      <IndianRupee size={11} className="text-zinc-400" />
      <span className="text-xs font-medium text-zinc-900">{doc.fee || '--'}</span>
      <span className="text-[9px] text-zinc-400 ml-1">/ visit</span>
    </div>

    <div className="col-span-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
          <Calendar size={12} className="text-zinc-300" />
          {doc.duty}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
          <Clock size={12} className="text-zinc-300" />
          {doc.time}
        </div>
      </div>
    </div>

    <div className="col-span-2 text-right">
      <div className="flex items-center justify-end gap-2 group-hover:translate-x-1 transition-transform">
        <span className="text-[11px] font-medium text-zinc-500">{doc.clinic}</span>
        <ChevronRight size={14} className="text-zinc-300" />
      </div>
    </div>
  </motion.div>
);

const NavBtn = ({ children, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className="p-2 border border-zinc-100 rounded-md bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 disabled:hover:border-zinc-100 transition-all"
  >
    {children}
  </button>
);

const MinimalLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
  </div>
);

export default GlobalDirectory;