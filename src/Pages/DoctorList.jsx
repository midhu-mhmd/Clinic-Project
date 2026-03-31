import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/apiConfig.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Search, Heart, Globe, Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const DoctorList = () => {
  const mainRef = useRef(null);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);


  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/doctors/directory`, {
        params: {
          page,
          limit,
          search: searchQuery
        }
      });

      if (data.success) {
        setDoctors(data.data);
        if (data.meta) {
          setTotalPages(data.meta.totalPages);
        }
      }
    } catch (err) {
      console.error("Directory Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchDoctors();
    }, searchQuery ? 500 : 0);
    return () => clearTimeout(debounceTimer);
  }, [fetchDoctors, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);


  const handleDoctorClick = (id) => {
    navigate(`/doctor/${id}`);
  };

  // GSAP Animations
  useEffect(() => {
    if (loading || doctors.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(".header-reveal", {
        y: 100, opacity: 0, duration: 1.5, ease: "expo.out", stagger: 0.15,
      });

      gsap.utils.toArray(".doctor-row").forEach((row) => {
        gsap.from(row, {
          opacity: 0, y: 30, duration: 1,
          scrollTrigger: { trigger: row, start: "top 90%" },
        });
      });
    }, mainRef);
    return () => ctx.revert();
  }, [loading, doctors]);


  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F0FDFA]">
        <Loader2 className="animate-spin text-[#0F766E] mb-4" size={40} />
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">Loading Doctors...</p>
      </div>
    );
  }

  return (
    <div ref={mainRef} className="bg-[#F0FDFA] text-[#1E293B] min-h-screen">
      <main className="px-6 sm:px-10 lg:px-16 pt-24 sm:pt-32 pb-20">
        <header className="mb-16 sm:mb-32 border-b border-[#1E293B]/10 pb-12 sm:pb-20">
          <div className="overflow-hidden mb-2 sm:mb-4">
            <h1 className="header-reveal text-[clamp(2.5rem,10vw,10rem)] font-light leading-[1] sm:leading-[0.8] tracking-tighter uppercase italic font-serif text-[#0F766E]">
              Trusted
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="header-reveal text-[clamp(2.5rem,10vw,10rem)] font-light leading-[1] sm:leading-[0.8] tracking-tighter uppercase">
              Specialists.
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mt-10 sm:mt-16 gap-8 sm:gap-12">
            <p className="max-w-md text-[#1E293B]/50 font-light text-base sm:text-lg lg:text-xl leading-relaxed italic">
              "Connect with providers verified for clinical excellence across our global network of clinics."
            </p>
            <div className="w-full lg:w-96">
              <div className="flex items-center gap-4 border-b border-[#1E293B]/10 py-3 sm:py-4 group focus-within:border-[#0F766E] transition-all">
                <Search size={16} className="opacity-30 group-focus-within:text-[#0F766E]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Professionals..."
                  className="bg-transparent outline-none text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold w-full"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="border-t border-[#1E293B]/10">
          {doctors.length > 0 ? (
            doctors.map((doc, index) => (
              <div
                key={doc._id}
                onClick={() => handleDoctorClick(doc._id)}
                className="doctor-row group relative grid grid-cols-1 lg:grid-cols-12 items-center py-8 sm:py-10 px-0 lg:px-4 border-b border-[#1E293B]/5 hover:bg-[#0F766E]/5 transition-all duration-700 cursor-pointer gap-6 lg:gap-0"
              >
                <div className="hidden lg:block lg:col-span-1 text-[10px] font-mono opacity-20 group-hover:opacity-100 transition-all">
                   {String((page - 1) * limit + index + 1).padStart(2, "0")}
                </div>

                <div className="lg:col-span-4 flex items-center gap-5 sm:gap-8">
                  <div className="relative w-16 sm:w-20 h-24 sm:h-28 overflow-hidden grayscale brightness-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 rounded-lg bg-[#1E293B]/5 shrink-0">
                    <img
                      src={doc.image || `https://ui-avatars.com/api/?name=${doc.name}`}
                      alt={doc.name}
                      className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-1000"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-light tracking-tighter group-hover:text-[#0F766E] transition-colors duration-500 uppercase truncate">
                      {doc.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-bold text-[#1E293B]/40">
                        {doc.specialization}
                      </span>
                      {doc.tenantId?.name && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-[#0F766E]/30" />
                          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] font-bold text-[#0F766E] truncate max-w-[120px]">
                            {doc.tenantId.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex lg:col-span-2 flex-col gap-1 pl-8 border-l border-[#1E293B]/5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#1E293B]/30">Experience</span>
                  <span className="text-sm font-medium tracking-tight text-[#1E293B]">{doc.experience} Years</span>
                </div>

                <div className="hidden lg:flex lg:col-span-2 flex-col gap-1 pl-8 border-l border-[#1E293B]/5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#1E293B]/30">Rating</span>
                  <span className="text-sm font-medium tracking-tight text-[#0F766E]">{doc.rating || "5.0"} ⭐</span>
                </div>

                <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-6 sm:gap-10">
                  <div className="flex lg:hidden flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-[#0F766E]">{doc.rating || "5.0"} Rating</span>
                    <span className="text-[8px] uppercase tracking-widest font-bold text-[#1E293B]/30">{doc.experience}y Exp.</span>
                  </div>
                  
                  <div className="hidden xl:flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <Heart size={16} className="text-[#1E293B]/40 hover:text-[#0F766E]" />
                    <Globe size={16} className="text-[#1E293B]/40 hover:text-[#0F766E]" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDoctorClick(doc._id);
                    }}
                    className="relative bg-[#1E293B] text-[#F0FDFA] px-6 sm:px-10 py-4 sm:py-5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0F766E] transition-all duration-700 flex items-center gap-3 sm:gap-4 group/btn"
                  >
                    Book <span className="hidden xs:inline">Appointment</span> <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform shrink-0" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">No practitioners found in the global directory.</p>
            </div>
          )}
        </div>

        {/* 04. PAGINATION CONTROLLER */}
        {!loading && totalPages > 1 && (
          <div className="mt-20 flex justify-between items-center border-t border-[#1E293B]/10 pt-12">
            <div className="flex gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`text-[10px] font-bold w-8 h-8 flex items-center justify-center transition-all rounded-full ${page === i + 1 ? 'bg-[#0F766E] text-white' : 'opacity-30 hover:opacity-100 hover:bg-[#0F766E]/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-30 italic font-serif">
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorList;
