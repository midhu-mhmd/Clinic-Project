import React, { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, MapPin, AlertCircle, Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = "http://localhost:5000/api";

const ClinicList = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. DATA SYNC
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const { data: response } = await axios.get(`${API_BASE_URL}/tenants/all`);
        if (response.success) {
          setClinics(response.data.map((c, i) => ({
            ...c,
            id: c._id,
            displayLocation: c.location || "Global Access",
            displayImg: c.img || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200",
            indexStr: String(i + 1).padStart(2, "0"),
          })));
        }
      } catch (err) {
        setError("Network Infrastructure Offline");
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchClinics();
  }, []);

  // 2. 2025 KINETIC TYPOGRAPHY & REVEALS
  useEffect(() => {
    if (loading || clinics.length === 0) return;

    let ctx = gsap.context(() => {
      // Hero reveal
      gsap.from(".reveal-item", {
        y: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 1.4,
        ease: "expo.out"
      });

      // Card Staggered Reveal
      gsap.utils.toArray(".clinic-card").forEach((card, i) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, clinics]);

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, clinics]);

  if (error) return <ErrorState message={error} />;

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#FBFBF9] text-[#1A1A1A] font-sans selection:bg-[#8DAA9D] selection:text-white">
      
      {/* 00. FLOATING NAV (Minimalist) */}
      <nav className="fixed top-0 z-50 w-full flex justify-between items-center px-6 py-10 md:px-16">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="h-1.5 w-1.5 rounded-full bg-[#8DAA9D]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Directory v.25</span>
        </div>
        <div className="flex items-center gap-8">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 cursor-pointer transition-opacity">Contact</span>
            <div className="h-10 w-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all duration-500">
                <Plus size={14} />
            </div>
        </div>
      </nav>

      <main className="px-6 md:px-16 pt-48 pb-40">
        
        {/* 01. HERO (Extreme Minimalist) */}
        <header className="mb-40 md:mb-64">
          <div className="overflow-hidden mb-12">
            <h1 className="reveal-item text-[12vw] md:text-[9vw] font-light leading-[0.8] tracking-tighter uppercase">
              The <span className="italic font-serif text-[#8DAA9D] lowercase tracking-normal">Technical</span><br />
              Index.
            </h1>
          </div>
          
          <div className="reveal-item flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <p className="max-w-xs text-xs md:text-sm font-medium leading-relaxed opacity-40 uppercase tracking-widest">
              An audited archive of premier healthcare environments. Built for precision.
            </p>
            
            {/* Minimalist Floating Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 opacity-20" />
              <input 
                type="text" 
                placeholder="SEARCH ARCHIVE" 
                className="w-full bg-transparent border-b border-[#1A1A1A]/10 py-3 pl-6 outline-none focus:border-[#8DAA9D] transition-all text-[9px] font-bold tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* 02. EDITORIAL GRID (Focus on Whitespace) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
          {loading ? (
             <SkeletonLoader />
          ) : filteredClinics.map((clinic) => (
            <article 
              key={clinic.id}
              onClick={() => navigate(`/clinic/${clinic.id}`)}
              className="clinic-card group cursor-pointer"
            >
              <div className="relative mb-8 overflow-hidden aspect-[4/5] bg-[#F4F1EE]">
                <img 
                  src={clinic.displayImg} 
                  className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                  alt={clinic.name}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <div className="absolute top-6 left-6 mix-blend-difference text-white">
                    <span className="text-[9px] font-bold tracking-[0.5em]">{clinic.indexStr}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 opacity-30">
                  <MapPin size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{clinic.displayLocation}</span>
                </div>
                <div className="flex justify-between items-end">
                    <h2 className="text-3xl md:text-4xl font-light tracking-tighter uppercase leading-none group-hover:italic transition-all">
                        {clinic.name}
                    </h2>
                    <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* 03. FOOTER (Brutalist Minimalism) */}
      <footer className="py-40 px-6 border-t border-[#1A1A1A]/5 text-center">
          <div className="max-w-2xl mx-auto space-y-12">
            <h3 className="text-[10vw] md:text-[6vw] font-light uppercase tracking-tighter leading-none">
              List your <br />Facility
            </h3>
            <button className="text-[10px] font-bold uppercase tracking-[0.5em] border-b border-[#1A1A1A] pb-2 hover:text-[#8DAA9D] hover:border-[#8DAA9D] transition-all">
                Begin Audit Protocol
            </button>
          </div>
      </footer>
    </div>
  );
};

const SkeletonLoader = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-6 animate-pulse">
          <div className="aspect-[4/5] bg-[#1A1A1A]/5" />
          <div className="h-4 w-24 bg-[#1A1A1A]/5" />
          <div className="h-12 w-full bg-[#1A1A1A]/5" />
        </div>
      ))}
    </>
);

const ErrorState = ({ message }) => (
  <div className="flex h-screen flex-col items-center justify-center bg-[#FBFBF9] text-center">
    <AlertCircle className="mb-4 text-[#8DAA9D]" size={32} />
    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40">{message}</h3>
    <button onClick={() => window.location.reload()} className="mt-8 text-[9px] font-bold uppercase tracking-widest underline">Reset</button>
  </div>
);

export default ClinicList;