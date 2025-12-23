import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const specialists = [
  {
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Dr. Emily Chen",
    role: "Pediatrician",
    availability: "View Residencies",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Dr. Michael Ross",
    role: "Dermatologist",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Dr. Lisa Wong",
    role: "General Practice",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
  },
];

const SpecialistsSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.from(".section-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      });

      // Staggered card entry
      gsap.from(".specialist-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        y: 100,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-32 px-6 md:px-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="section-title">
            <span className="text-blue-600 font-semibold tracking-widest text-xs uppercase mb-4 block">
              Expertise
            </span>
            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-slate-900 leading-[0.9]">
              Meet our top <br />
              <span className="italic font-serif">specialists</span>
            </h2>
          </div>
          
          <button onClick={() => navigate("/doctors")} className="section-title group flex items-center gap-3 text-slate-900 font-medium hover:text-blue-600 transition-colors">
            View All Members
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>

        {/* Specialists Grid */}
        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {specialists.map((doc, index) => (
            <div 
              key={index} 
              className="specialist-card group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] mb-8 overflow-hidden bg-slate-100 rounded-sm">
                <img 
                  src={doc.image} 
                  alt={doc.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                    <ArrowUpRight size={18} className="text-slate-900" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                    {doc.name}
                  </h3>
                </div>
                <p className="text-slate-500 font-medium text-sm">{doc.role}</p>
                
                <div className="pt-4 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${doc.availability.includes('Available') ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    {doc.availability}
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