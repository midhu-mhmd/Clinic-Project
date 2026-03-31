import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, MapPin, AlertCircle, Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

import API_BASE_URL from "../utils/apiConfig.js";

const ClinicList = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9);

  // 1. DATA SYNC
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const { data: response } = await axios.get(`${API_BASE_URL}/tenants/all`, {
          params: {
            page,
            limit,
            search: searchQuery
          }
        });

        if (response.success) {
          setClinics(response.data.map((c, i) => ({
            ...c,
            id: c._id,
            displayLocation: c.location || "Global Access",
            displayImg: c.img || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200",
            indexStr: String((page - 1) * limit + i + 1).padStart(2, "0"),
          })));

          if (response.meta) {
            setTotalPages(response.meta.totalPages);
          }
        }
      } catch {
        setError("Network Infrastructure Offline");
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchClinics();
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(debounceTimer);
  }, [page, limit, searchQuery]);

  // Reset page when searching
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

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
      gsap.utils.toArray(".clinic-card").forEach((card) => {
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


  if (error) return <ErrorState message={error} />;

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#F0FDFA] text-[#1E293B] font-sans selection:bg-[#0F766E] selection:text-white">

      {/* 00. FLOATING NAV (Minimalist) */}
      <nav className="fixed top-0 z-50 w-full flex justify-between items-center px-6 py-6 sm:py-10 md:px-16 bg-[#F0FDFA]/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em]">Clinic Directory</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <span className="hidden xs:block text-[9px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 cursor-pointer transition-opacity">Contact</span>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-[#1E293B]/10 flex items-center justify-center hover:bg-[#1E293B] hover:text-white transition-all duration-500">
            <Plus size={14} />
          </div>
        </div>
      </nav>

      <main className="px-6 md:px-16 pt-24 sm:pt-32 md:pt-48 pb-24 md:pb-40">

        {/* 01. HERO (Extreme Minimalist) */}
        <header className="mb-16 sm:mb-24 md:mb-64">
          <div className="overflow-hidden mb-6 sm:mb-8 md:mb-12 text-center md:text-left">
            <h1 className="reveal-item text-[12vw] sm:text-[10vw] md:text-[9vw] font-light leading-[1] md:leading-[0.8] tracking-tight md:tracking-tighter uppercase">
              Find <span className="italic font-serif text-[#0F766E] lowercase tracking-normal">Your</span><br className="hidden sm:block" />
              Clinic.
            </h1>
          </div>

          <div className="reveal-item flex flex-col md:flex-row justify-between items-center md:items-center gap-8 text-center md:text-left">
            <p className="max-w-[280px] sm:max-w-xs text-[9px] sm:text-[10px] md:text-sm font-medium leading-relaxed opacity-40 uppercase tracking-widest">
              Browse trusted clinics and hospitals in our network.
            </p>

            {/* Minimalist Floating Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 opacity-20" />
              <input
                type="text"
                placeholder="SEARCH CLINICS"
                className="w-full bg-transparent border-b border-[#1E293B]/10 py-2.5 sm:py-3 pl-6 outline-none focus:border-[#0F766E] transition-all text-[8px] sm:text-[9px] font-bold tracking-widest text-center md:text-left"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* 02. EDITORIAL GRID (Focus on Whitespace) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-12 gap-y-16 sm:gap-y-32">
          {loading ? (
            <SkeletonLoader />
          ) : clinics.map((clinic) => (
            <article
              key={clinic.id}
              onClick={() => navigate(`/clinic/${clinic.id}`)}
              className="clinic-card group cursor-pointer"
            >
              <div className="relative mb-6 sm:mb-8 overflow-hidden aspect-[4/5] bg-[#F4F1EE] rounded-2xl sm:rounded-none">
                <img
                  src={clinic.displayImg}
                  className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                  alt={clinic.name}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 mix-blend-difference text-white">
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.5em]">{clinic.indexStr}</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                <div className="flex items-center gap-3 opacity-30">
                  <MapPin size={10} />
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest truncate">{clinic.displayLocation}</span>
                </div>
                <div className="flex justify-between items-end gap-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tighter uppercase leading-none group-hover:italic transition-all truncate">
                    {clinic.name}
                  </h2>
                  <ArrowUpRight size={16} className="opacity-0 lg:group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500 shrink-0" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 03. PAGINATION CONTROLLER */}
        {!loading && totalPages > 1 && (
          <div className="mt-20 md:mt-32 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 border-t border-[#1E293B]/10 pt-8 md:pt-12">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>
              <div className="flex gap-2 flex-wrap justify-center">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`text-[9px] font-bold w-6 h-6 flex items-center justify-center transition-all ${page === i + 1 ? 'bg-[#1E293B] text-white rounded-md' : 'opacity-30 hover:opacity-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest opacity-20">
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </main>

      {/* 03. FOOTER (Brutalist Minimalism) */}
      <footer className="py-24 md:py-40 px-6 border-t border-[#1E293B]/5 text-center">
        <div className="max-w-2xl mx-auto space-y-8 md:space-y-12">
          <h3 className="text-[12vw] md:text-[6vw] font-light uppercase tracking-tight md:tracking-tighter leading-none">
            Register Your <br />Clinic
          </h3>
          <button className="text-[10px] font-bold uppercase tracking-[0.5em] border-b border-[#1E293B] pb-2 hover:text-[#0F766E] hover:border-[#0F766E] transition-all">
            Get Started
          </button>
        </div>
      </footer>
    </div>
  );
};

const SkeletonLoader = () => (
  <>
    {[1, 2, 3].map((_, index) => (
      <div key={index} className="space-y-6 animate-pulse">
        <div className="aspect-[4/5] bg-[#1E293B]/5" />
        <div className="h-4 w-24 bg-[#1E293B]/5" />
        <div className="h-12 w-full bg-[#1E293B]/5" />
      </div>
    ))}
  </>
);

const ErrorState = ({ message }) => (
  <div className="flex h-screen flex-col items-center justify-center bg-[#F0FDFA] text-center">
    <AlertCircle className="mb-4 text-[#0F766E]" size={32} />
    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40">{message}</h3>
    <button onClick={() => window.location.reload()} className="mt-8 text-[9px] font-bold uppercase tracking-widest underline">Reset</button>
  </div>
);

export default ClinicList;
