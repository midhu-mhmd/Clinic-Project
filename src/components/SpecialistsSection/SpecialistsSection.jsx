import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const specialists = [
  { name: "Dr. Sarah Johnson", role: "Cardiology", image: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=800" },
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
    <section ref={sectionRef} className="py-20 sm:py-32 bg-[#F0FDFA] border-t border-[#1E293B]/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-8">
        
        {/* HEADER: Minimal & Bold */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-24 gap-8">
          <div className="reveal-item">
            <p className="text-[10px] tracking-[0.5em] text-[#0F766E] uppercase font-bold mb-4 sm:mb-6">Our Doctors</p>
            <h2 className="text-[clamp(2.2rem,6vw,5rem)] font-light leading-[1] sm:leading-[0.9] text-[#1E293B] tracking-tighter">
              Experienced <br className="hidden sm:block" />
              <span className="italic font-serif text-[#0F766E]">medical professionals.</span>
            </h2>
          </div>
          
          <button 
            onClick={() => navigate("/doctors")} 
            className="reveal-item group flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase font-bold text-[#1E293B]"
          >
            View All Doctors
            <span className="w-12 h-px bg-[#0F766E] group-hover:w-20 transition-all duration-700"></span>
          </button>
        </div>

        {/* GRID: High-End Photography Style */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-y-16">
          {specialists.map((doc, index) => (
            <div key={index} className="reveal-item group cursor-pointer">
              {/* Image with subtle reveal */}
              <div className="relative aspect-3/4 overflow-hidden mb-6 bg-[#1E293B]/5 rounded-xl">
                <img 
                  src={doc.image} 
                  alt={doc.name}
                  className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-expo"
                />
                <div className="absolute inset-0 bg-[#1E293B]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Minimalist Info */}
              <div className="border-l border-[#0F766E]/20 pl-4 py-1">
                <h3 className="text-xl font-light text-[#1E293B] tracking-tight group-hover:text-[#0F766E] transition-colors duration-500 line-clamp-1">
                  {doc.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#1E293B]/40 font-bold whitespace-nowrap">
                    {doc.role}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[#0F766E]/40" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#0F766E] font-bold whitespace-nowrap">
                    Practitioner
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