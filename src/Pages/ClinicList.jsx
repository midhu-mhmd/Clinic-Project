import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, Plus, Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ClinicList = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch Dynamic Data
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/tenants/all");
        setClinics(data);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // 2. GSAP Animations
  useEffect(() => {
    if (loading || clinics.length === 0) return;

    const ctx = gsap.context(() => {
      // Reveal Header Text
      gsap.from(".reveal-text", {
        y: 120,
        rotate: 2,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.1,
      });

      // Staggered Grid Reveal
      gsap.from(".clinic-item", {
        opacity: 0,
        y: 60,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".clinic-grid",
          start: "top 80%",
        },
      });

      // Subtle Parallax for images
      gsap.utils.toArray(".clinic-img").forEach((img) => {
        gsap.to(img, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, clinics]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#8DAA9D] mb-4" size={48} />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50">
          Loading Directory
        </p>
      </div>
    );
  }

  // Filter logic for search
  const filteredClinics = clinics.filter(clinic => 
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] text-[#2D302D] min-h-screen">
      {/* MINIMAL NAV */}
      <nav className="flex justify-between items-center px-8 py-8 border-b border-[#2D302D]/5">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold">
          <div className="w-2 h-2 bg-[#8DAA9D] rounded-full animate-pulse" />
          Live Directory
        </div>
        <div className="flex gap-12 text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">
          <button className="hover:text-[#8DAA9D] hover:opacity-100 transition-all underline-offset-4 hover:underline">
            Filters
          </button>
          <button className="hover:text-[#8DAA9D] hover:opacity-100 transition-all underline-offset-4 hover:underline">
            Map View
          </button>
        </div>
      </nav>

      <main className="px-8 py-24">
        {/* EDITORIAL HEADER */}
        <header className="mb-32">
          <div className="overflow-hidden mb-4">
            <h1 className="reveal-text text-[clamp(3rem,9vw,9rem)] font-light leading-[0.85] tracking-tighter uppercase">
              Elite{" "}
              <span className="italic font-serif text-[#8DAA9D] lowercase tracking-normal">
                medical
              </span>
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="reveal-text text-[clamp(3rem,9vw,9rem)] font-light leading-[0.85] tracking-tighter uppercase">
              Infrastructure.
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-end mt-16 gap-12">
            <p className="max-w-md text-[#2D302D]/50 font-light text-lg italic leading-relaxed">
              "Access a curated selection of world-class clinics verified for
              clinical excellence and rigorous safety protocols."
            </p>

            <div className="relative w-full lg:w-100 group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:text-[#8DAA9D] group-focus-within:opacity-100 transition-all" />
              <input
                type="text"
                placeholder="Find a Facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-[#2D302D]/10 py-6 pl-10 outline-none focus:border-[#8DAA9D] transition-all text-[11px] uppercase tracking-[0.3em] font-bold"
              />
            </div>
          </div>
        </header>

        {/* SWISS GRID LIST */}
        <section className="clinic-grid grid grid-cols-1 md:grid-cols-2 gap-px bg-[#2D302D]/10 border border-[#2D302D]/10">
          {filteredClinics.map((clinic, index) => (
            <div
              key={clinic._id}
              onClick={() => navigate(`/clinic/${clinic._id}`)}
              className="clinic-item bg-[#FAF9F6] p-12 group cursor-pointer relative transition-colors duration-700 hover:bg-[#8DAA9D]/5"
            >
              <div className="flex justify-between items-start mb-20">
                <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
                  Exhibit — 0{index + 1}
                </span>
                <div className="w-12 h-12 rounded-full border border-[#2D302D]/10 flex items-center justify-center group-hover:bg-[#2D302D] group-hover:text-[#FAF9F6] transition-all duration-500">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-12 items-end">
                <div className="flex-1">
                  <h2 className="text-5xl font-light tracking-tighter mb-6 uppercase group-hover:italic group-hover:text-[#8DAA9D] transition-all duration-500">
                    {clinic.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {clinic.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] uppercase tracking-widest font-bold px-4 py-2 border border-[#2D302D]/10 rounded-full group-hover:border-[#8DAA9D]/30 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full xl:w-56 aspect-4/5 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 rounded-sm">
                  <img
                    src={clinic.img || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400"}
                    alt={clinic.name}
                    className="clinic-img w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-1000"
                  />
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-[#2D302D]/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                  {clinic.location}
                </span>
                <Plus
                  size={14}
                  className="group-hover:rotate-90 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* CTA FOOTER */}
      <footer className="px-8 py-40 text-center border-t border-[#2D302D]/5">
        <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold mb-8 opacity-40">Are you a practitioner?</h3>
        <button className="text-5xl font-light tracking-tighter uppercase hover:italic hover:text-[#8DAA9D] transition-all duration-500">
          Join the Exhibit
        </button>
      </footer>
    </div>
  );
};

export default ClinicList;