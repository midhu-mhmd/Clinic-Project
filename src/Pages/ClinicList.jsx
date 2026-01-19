import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  Plus,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ClinicList = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Unified Data Fetching with fixed Backend Mapping
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/tenants/all"
        );

        const responseData = response.data;

        if (responseData.success && Array.isArray(responseData.data)) {
          const normalizedData = responseData.data.map((c) => ({
            ...c,
            displayLocation: c.location || "Global Access",
            displayTags: c.tags || ["General Practice"],
            displayImg:
              c.img ||
              "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800",
          }));
          setClinics(normalizedData);
        }
      } catch (err) {
        console.error("Server is returning 500. Check Backend Logs.");
        // FALLBACK DATA: Remove this once your backend is fixed
        /*
      setClinics([{
        _id: "demo",
        name: "Demo Clinic (Server Offline)",
        displayLocation: "Check Backend",
        displayTags: ["Error 500"],
        displayImg: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800"
      }]);
      */
        setError(
          "The server encountered an internal error (500). Please check the backend console."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // 2. GSAP Refresh & Animations
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [searchQuery, clinics]);

  useEffect(() => {
    if (loading || clinics.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(".reveal-text", {
        y: 120,
        rotate: 2,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
      });

      gsap.from(".clinic-item", {
        opacity: 0,
        y: 40,
        stagger: 0.05,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".clinic-grid",
          start: "top 85%",
        },
      });

      gsap.utils.toArray(".clinic-img-container").forEach((container) => {
        const img = container.querySelector("img");
        gsap.to(img, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, clinics]);

  // 3. Search Logic
  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.displayLocation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. Conditional States (Loading / Error)
  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6] p-12 text-center">
        <AlertCircle
          className="text-[#8DAA9D] mb-6"
          size={48}
          strokeWidth={1}
        />
        <h2 className="text-2xl font-light uppercase tracking-tighter mb-4">
          Connection Offline
        </h2>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 max-w-xs leading-loose">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-10 px-8 py-4 border border-[#2D302D]/10 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#2D302D] hover:text-white transition-all"
        >
          Retry Synchronization
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="relative">
          <Loader2
            className="animate-spin text-[#8DAA9D]"
            size={48}
            strokeWidth={1}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-[#2D302D] rounded-full" />
          </div>
        </div>
        <p className="mt-6 text-[9px] uppercase tracking-[0.6em] font-bold text-[#2D302D]/40">
          Syncing Virtual Vault
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF9F6] text-[#2D302D] min-h-screen selection:bg-[#8DAA9D] selection:text-white"
    >
      {/* MINIMAL NAV */}
      <nav className="flex justify-between items-center px-8 sm:px-12 py-8 border-b border-[#2D302D]/5 sticky top-0 bg-[#FAF9F6]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-black">
          <div className="w-2 h-2 bg-[#8DAA9D] rounded-full shadow-[0_0_10px_#8DAA9D]" />
          Directory <span className="hidden sm:inline opacity-20">v2.0</span>
        </div>
        <div className="flex gap-8 sm:gap-12 text-[9px] uppercase tracking-[0.3em] font-bold">
          <button className="opacity-40 hover:opacity-100 hover:text-[#8DAA9D] transition-all">
            Regional
          </button>
          <button className="opacity-40 hover:opacity-100 hover:text-[#8DAA9D] transition-all">
            Specialty
          </button>
        </div>
      </nav>

      <main className="px-8 sm:px-12 py-24">
        {/* EDITORIAL HEADER */}
        <header className="mb-32">
          <div className="overflow-hidden mb-2">
            <h1 className="reveal-text text-[clamp(2.5rem,10vw,10rem)] font-light leading-[0.8] tracking-tighter uppercase">
              Elite{" "}
              <span className="italic font-serif text-[#8DAA9D] lowercase tracking-tight">
                medical
              </span>
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="reveal-text text-[clamp(2.5rem,10vw,10rem)] font-light leading-[0.8] tracking-tighter uppercase">
              Infrastructure.
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mt-20 gap-16">
            <p className="max-w-sm text-[#2D302D]/40 font-light text-base sm:text-lg leading-relaxed border-l border-[#2D302D]/10 pl-8">
              A curated index of premier clinical environments, audited for
              technical precision and hospitality.
            </p>

            <div className="relative w-full lg:w-1/3 group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:text-[#8DAA9D] group-focus-within:opacity-100 transition-all" />
              <input
                type="text"
                placeholder="Search by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-[#2D302D]/10 py-6 pl-10 outline-none focus:border-[#8DAA9D] transition-all text-[11px] uppercase tracking-[0.3em] font-bold placeholder:text-[#2D302D]/20"
              />
            </div>
          </div>
        </header>

        {/* SWISS GRID LIST */}
        <section className="clinic-grid grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#2D302D]/5 border-y border-[#2D302D]/5">
          {filteredClinics.length > 0 ? (
            filteredClinics.map((clinic, index) => (
              <div
                key={clinic._id}
                onClick={() => navigate(`/clinic/${clinic._id}`)}
                className="clinic-item bg-[#FAF9F6] p-8 sm:p-16 group cursor-pointer relative overflow-hidden transition-all duration-700 hover:bg-white"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[120px] font-black pointer-events-none select-none transition-all duration-700 group-hover:opacity-[0.07] group-hover:scale-110">
                  {clinic.indexId || index + 1}
                </div>

                <div className="flex justify-between items-start mb-24 relative z-10">
                  <span className="text-[9px] font-mono opacity-30 uppercase tracking-[0.4em]">
                    Registry Ref // {clinic.indexId || `00${index + 1}`}
                  </span>
                  <div className="w-14 h-14 rounded-full border border-[#2D302D]/5 flex items-center justify-center group-hover:bg-[#2D302D] group-hover:text-[#FAF9F6] transition-all duration-700 ease-expo">
                    <ArrowUpRight size={20} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-16 items-start xl:items-end relative z-10">
                  <div className="flex-1 space-y-8">
                    <h2 className="text-5xl sm:text-6xl font-light tracking-tighter uppercase group-hover:text-[#8DAA9D] transition-all duration-500 leading-[0.9]">
                      {clinic.name}
                    </h2>

                    <div className="flex flex-wrap gap-2">
                      {clinic.displayTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] uppercase tracking-widest font-black px-4 py-2 bg-white border border-[#2D302D]/5 rounded-full group-hover:border-[#8DAA9D]/40 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="clinic-img-container w-full xl:w-64 aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 rounded-sm bg-gray-100 relative">
                    <img
                      src={clinic.displayImg}
                      alt={clinic.name}
                      className="w-full h-full object-cover scale-150 transition-transform duration-[2s] ease-out"
                    />
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-[#2D302D]/5 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-all">
                    <MapPin size={12} className="text-[#8DAA9D]" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                      {clinic.displayLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-40 transition-all">
                      View Dossier
                    </span>
                    <Plus
                      size={14}
                      className="opacity-20 group-hover:rotate-90 group-hover:opacity-100 transition-all duration-700"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-40 text-center bg-white/50 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
                No facilities match your search criteria
              </p>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER CTA */}
      <footer className="px-8 py-60 text-center border-t border-[#2D302D]/5 overflow-hidden">
        <div className="space-y-4 mb-12">
          <span className="text-[9px] uppercase tracking-[0.6em] font-black text-[#8DAA9D]">
            Partnerships
          </span>
          <h3 className="text-sm opacity-40 uppercase tracking-widest">
            Are you a clinical director?
          </h3>
        </div>
        <button className="group relative text-4xl sm:text-7xl font-light tracking-tighter uppercase transition-all duration-700">
          <span className="group-hover:italic group-hover:text-[#8DAA9D]">
            List your practice
          </span>
          <div className="absolute -bottom-4 left-0 w-0 h-px bg-[#8DAA9D] group-hover:w-full transition-all duration-700" />
        </button>
      </footer>
    </div>
  );
};

export default ClinicList;
