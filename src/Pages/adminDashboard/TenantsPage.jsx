import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Plus, ArrowUpRight, MapPin, Search, Activity, Layers } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const TenantsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/tenants/all`);
        setClinics(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        // High-end placeholder data for cinematic effect
        setClinics([
          { id: "01", name: "Skyline Dental", city: "New York", patients: 1240, status: "Active", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070" },
          { id: "02", name: "Nova Heart Center", city: "London", patients: 890, status: "Active", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053" },
          { id: "03", name: "Zenith Wellness", city: "Dubai", patients: 2100, status: "Pending", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070" }
        ]);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchClinics();
  }, []);

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clinics, searchQuery]);

  if (loading) return <CinematicLoader />;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBF9] text-[#1A1A1A] selection:bg-[#8DAA9D] selection:text-white">
      
      {/* 01. NAVIGATION OVERLAY */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-10 mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-[#8DAA9D] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Sovereign / Global</span>
        </div>
        <div className="pointer-events-auto">
           <button className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-700">
              <Plus size={18} />
           </button>
        </div>
      </nav>

      <main className="px-6 md:px-16 pt-40 pb-32">
        
        {/* 02. HERO HEADER */}
        <section className="mb-48">
          <div className="overflow-hidden">
             <motion.h1 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="text-[14vw] md:text-[11vw] font-light leading-[0.8] tracking-tighter uppercase"
             >
               Clinic <br /> 
               <span className="italic font-serif text-[#8DAA9D] lowercase tracking-normal">Ecosystem.</span>
             </motion.h1>
          </div>

          <div className="mt-16 flex flex-col md:flex-row justify-between items-end gap-12">
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.4 }}
               transition={{ delay: 0.5 }}
               className="max-w-xs text-[11px] font-bold uppercase tracking-[0.3em] leading-relaxed"
             >
               Managing the structural integrity of premier healthcare environments across {clinics.length} technical nodes.
             </motion.p>

             <div className="relative group w-full md:w-96">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                <input 
                  type="text" 
                  placeholder="SEARCH ARCHIVE"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-[#1A1A1A]/10 py-4 pl-10 outline-none focus:border-[#8DAA9D] transition-all text-[11px] font-bold tracking-widest"
                />
             </div>
          </div>
        </section>

        {/* 03. THE CINEMATIC GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
          <AnimatePresence mode="popLayout">
            {filteredClinics.map((clinic, index) => (
              <ClinicCard key={clinic.id} clinic={clinic} index={index} />
            ))}
          </AnimatePresence>
        </section>
      </main>

      {/* 04. FOOTER BRUTALISM */}
      <footer className="py-40 px-6 border-t border-[#1A1A1A]/5 text-center">
          <h3 className="text-[10vw] font-light uppercase tracking-tighter leading-none opacity-10">Sovereign Clinical</h3>
          <p className="mt-12 text-[10px] font-bold uppercase tracking-[1em] opacity-30">All Protocols Verified 2026</p>
      </footer>
    </div>
  );
};

const ClinicCard = ({ clinic, index }) => {
  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer"
    >
      {/* Cinematic Image Container */}
      <div className="relative aspect-[4/5] bg-[#F4F1EE] overflow-hidden">
        <motion.img 
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 1.5, ease: "circOut" }}
          src={clinic.img || "https://images.unsplash.com/photo-1516549655169-df83a0774514"} 
          className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s]"
          alt={clinic.name}
        />
        
        {/* Status Overlay */}
        <div className="absolute top-6 left-6 mix-blend-difference text-white">
           <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">ID / {clinic.id}</span>
        </div>

        {/* Hover Arrow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ArrowUpRight size={32} className="text-white" strokeWidth={1} />
           </div>
        </div>
      </div>

      {/* Info Body */}
      <div className="mt-10 space-y-6">
        <div className="flex items-center gap-4">
           <div className={`h-[1px] w-8 ${clinic.status === 'Active' ? 'bg-[#8DAA9D]' : 'bg-orange-400'}`} />
           <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30">{clinic.status} Node</span>
        </div>
        
        <div className="flex justify-between items-start">
           <h2 className="text-4xl font-light tracking-tighter uppercase leading-none group-hover:text-[#8DAA9D] transition-colors">
              {clinic.name}
           </h2>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-[#1A1A1A]/5 text-[10px] font-bold uppercase tracking-widest opacity-40">
           <div className="flex items-center gap-2"><MapPin size={12}/> {clinic.city}</div>
           <div className="flex items-center gap-2"><Activity size={12}/> {clinic.patients} PTS</div>
        </div>
      </div>
    </motion.article>
  );
};

const CinematicLoader = () => (
  <div className="h-screen w-full bg-[#1A1A1A] flex flex-col items-center justify-center gap-10">
    <div className="relative w-48 h-1 bg-white/5 overflow-hidden">
       <motion.div 
         initial={{ x: "-100%" }}
         animate={{ x: "100%" }}
         transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
         className="absolute inset-0 bg-[#8DAA9D]"
       />
    </div>
    <span className="text-[9px] font-bold uppercase tracking-[1em] text-white/30 animate-pulse">Syncing Environment</span>
  </div>
);

export default TenantsPage;