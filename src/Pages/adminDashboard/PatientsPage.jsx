import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, ArrowUpRight, Search, Activity, Hexagon, 
  User, Droplets, Calendar, Filter, AlertCircle 
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Protocol: Retrieve token from localStorage
        const token = localStorage.getItem("token"); 
        
        const { data } = await axios.get(`${API_BASE_URL}/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Handle both direct array or nested data object
        const patientData = Array.isArray(data) ? data : data.data || [];
        setPatients(patientData);
      } catch (err) {
        console.error("Archive Sync Failed:", err);
        setError("Protocol Breach: Unable to sync with biological archive.");
      } finally {
        // Slight delay for cinematic effect
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  if (loading) return <CinematicLoader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FBFBF9] selection:bg-[#8DAA9D] selection:text-white">
      
      {/* 01. NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-16 py-10 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
          <Activity size={14} className="text-[#8DAA9D]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Neural / Patients</span>
        </div>
        <div className="pointer-events-auto flex gap-4">
           <button className="h-12 px-6 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all group">
              <Filter size={16} className="opacity-40 group-hover:text-[#8DAA9D] transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Filter Archive</span>
           </button>
           <motion.button 
             whileHover={{ scale: 1.1, backgroundColor: "#8DAA9D" }}
             className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center transition-colors"
           >
              <Plus size={20} />
           </motion.button>
        </div>
      </nav>

      <main className="px-6 md:px-16 pt-40 pb-20">
        
        {/* 02. HERO HEADER */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hexagon size={14} className="text-[#8DAA9D] fill-[#8DAA9D]/20 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 text-[#8DAA9D]">
                  {patients.length} Registered Subjects
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl font-light tracking-tighter uppercase leading-[0.9]">
                Patient <br /> <span className="italic font-serif opacity-50">Profiles.</span>
              </h2>
            </div>

            <div className="relative group w-full md:w-[400px]">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:text-[#8DAA9D] transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH BY IDENTITY"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 py-6 pl-12 outline-none focus:border-[#8DAA9D] transition-all text-[12px] font-bold tracking-[0.2em] text-white placeholder:opacity-20"
              />
            </div>
          </div>
        </section>

        {/* 03. PATIENT GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => (
                <PatientCard key={patient._id || patient.id} patient={patient} index={index} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-20 text-[10px] font-bold uppercase tracking-[0.5em]">
                No matching biological records found.
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[1em] opacity-30">Biometric Encryption Active — 2026</p>
      </footer>
    </div>
  );
};

const PatientCard = ({ patient, index }) => {
  const isCritical = patient.status?.toLowerCase() === "critical";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="relative group p-8 flex flex-col justify-between min-h-[520px] bg-[#141414] border border-white/5 hover:border-[#8DAA9D]/30 transition-all duration-500 overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isCritical ? 'via-red-500' : 'via-[#8DAA9D]'} to-transparent opacity-40`} />
      
      <div>
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest opacity-30 uppercase">
              {patient.patientId || patient.id || "ID-PENDING"}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isCritical ? 'text-red-400' : 'text-[#8DAA9D]'}`}>
              {isCritical ? "● Critical Node" : "● Stable Sync"}
            </span>
          </div>
          
          <div className="h-16 w-16 rounded-full overflow-hidden border border-white/10 group-hover:border-[#8DAA9D]/50 transition-all">
            <img 
              src={patient.img || `https://ui-avatars.com/api/?name=${patient.name}&background=1a1a1a&color=8DAA9D`} 
              alt={patient.name} 
              className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            />
          </div>
        </div>

        <h4 className="text-4xl font-light tracking-tighter mb-10 group-hover:text-[#8DAA9D] transition-colors leading-[0.85]">
          {patient.name?.split(' ')[0]} <br />
          <span className="italic font-serif opacity-60">{patient.name?.split(' ').slice(1).join(' ')}</span>
        </h4>

        <div className="grid grid-cols-2 gap-y-8 pt-8 border-t border-white/5">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-bold opacity-30 flex items-center gap-2">
              <User size={10} /> Age
            </p>
            <p className="text-xl font-light">{patient.age || "--"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-bold opacity-30 flex items-center gap-2">
              <Droplets size={10} /> Blood
            </p>
            <p className={`text-xl font-light ${patient.blood?.includes('-') ? 'text-orange-300' : ''}`}>
              {patient.blood || "N/A"}
            </p>
          </div>
          <div className="space-y-1 col-span-2">
            <p className="text-[9px] uppercase font-bold opacity-30 flex items-center gap-2">
              <Calendar size={10} /> Latest Sync
            </p>
            <p className="text-sm font-mono opacity-80">{patient.lastVisit || patient.updatedAt?.split('T')[0] || "No Data"}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center">
        <button className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-[#8DAA9D] transition-all">
          View Dossier
        </button>
        <button className="h-12 w-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#8DAA9D] hover:text-black transition-all">
          <ArrowUpRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const ErrorMessage = ({ message }) => (
  <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
    <AlertCircle className="text-red-500 mb-4" size={32} />
    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-500/80">{message}</span>
    <button 
      onClick={() => window.location.reload()}
      className="mt-8 text-[10px] font-bold uppercase tracking-widest border-b border-white/20 hover:border-[#8DAA9D] transition-all"
    >
      Retry Connection
    </button>
  </div>
);

const CinematicLoader = () => (
  <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center gap-8">
    <Hexagon size={40} className="text-[#8DAA9D] animate-spin-slow" />
    <span className="text-[10px] font-bold uppercase tracking-[1em] text-[#8DAA9D] animate-pulse">Syncing Biological Archive</span>
  </div>
);

export default PatientsPage;