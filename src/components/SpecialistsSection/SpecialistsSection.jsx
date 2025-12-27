import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const specialists = [
  { name: "Dr. Sarah Johnson", role: "Cardiology", image: "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=800" },
  { name: "Dr. Emily Chen", role: "Pediatrics", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800" },
  { name: "Dr. Michael Ross", role: "Dermatology", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800" },
  { name: "Dr. Lisa Wong", role: "General Practice", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800" },
];

const SpecialistsSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-item", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 1.5,
        ease: "expo.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[#FAF9F6] border-t border-[#2D302D]/5">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* HEADER: Minimal & Bold */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="reveal-item">
            <p className="text-[10px] tracking-[0.5em] text-[#8DAA9D] uppercase font-bold mb-6">05 — Medical Staff</p>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light leading-[0.9] text-[#2D302D] tracking-tighter">
              A lineage of <br />
              <span className="italic font-serif text-[#8DAA9D]">clinical excellence.</span>
            </h2>
          </div>
          
          <button 
            onClick={() => navigate("/doctors")} 
            className="reveal-item group flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase font-bold text-[#2D302D]"
          >
            All Specialists
            <span className="w-12 h-[1px] bg-[#8DAA9D] group-hover:w-20 transition-all duration-700"></span>
          </button>
        </div>

        {/* GRID: High-End Photography Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          {specialists.map((doc, index) => (
            <div key={index} className="reveal-item group cursor-pointer">
              {/* Image with subtle reveal */}
              <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#2D302D]/5">
                <img 
                  src={doc.image} 
                  alt={doc.name}
                  className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-expo"
                />
                <div className="absolute inset-0 bg-[#2D302D]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Minimalist Info */}
              <div className="border-l border-[#2D302D]/10 pl-4 py-1">
                <h3 className="text-xl font-light text-[#2D302D] tracking-tight group-hover:text-[#8DAA9D] transition-colors duration-500">
                  {doc.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#2D302D]/40 font-bold">
                    {doc.role}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[#8DAA9D]/40" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#8DAA9D] font-bold">
                    Resident
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialistsSection;