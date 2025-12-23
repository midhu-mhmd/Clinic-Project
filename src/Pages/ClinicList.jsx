import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Filter, Search, Plus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CLINICS = [
  { id: '01', name: "Bright Smile Dental", location: "San Francisco", tags: ["Orthodontics", "Implants"], img: "https://images.unsplash.com/photo-1629909613654-2871b886daa4?q=80&w=800" },
  { id: '02', name: "Downtown Ortho", location: "New York", tags: ["Braces", "Invisalign"], img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800" },
  { id: '03', name: "Pure Smile Studio", location: "London", tags: ["Cosmetic", "Checkups"], img: "https://images.unsplash.com/photo-1538108190963-b4352f342137?q=80&w=800" },
  { id: '04', name: "Pacific Heights", location: "Berlin", tags: ["Surgery", "General"], img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800" },
];

const ClinicList = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Title Mask Reveal
      gsap.from(".reveal-text", {
        y: "100%",
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.1
      });

      // 2. Grid Item "Sway" on Scroll
      gsap.utils.toArray(".clinic-item").forEach((item) => {
        gsap.from(item, {
          y: 100,
          opacity: 0,
          scrollTrigger: {
            trigger: item,
            start: "top bottom-=100",
            toggleActions: "play none none reverse"
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF9F6] text-[#111] font-sans">
      
      {/* Top Navigation - Hairline Style */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-black/5">
        <div className="flex items-center gap-2 font-bold uppercase tracking-[0.3em] text-[10px]">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          Live Directory
        </div>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-medium opacity-40">
          <button className="hover:opacity-100 transition-opacity">Filters</button>
          <button className="hover:opacity-100 transition-opacity">Map View</button>
        </div>
      </nav>

      <main className="px-8 py-20">
        
        {/* Editorial Header */}
        <header className="mb-32">
          <div className="overflow-hidden">
            <h1 className="reveal-text text-[10vw] font-medium leading-[0.85] tracking-tighter uppercase">
              Elite <span className="italic font-serif text-blue-600 lowercase tracking-normal">medical</span> <br />
              Infrastructure.
            </h1>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-end mt-12 gap-8">
             <p className="max-w-md text-neutral-500 font-light text-lg">
                Access a curated selection of world-class clinics verified for clinical excellence and patient safety.
             </p>
             <div className="relative w-full md:w-96 group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:text-blue-600 group-focus-within:opacity-100 transition-all" />
                <input 
                  type="text" 
                  placeholder="SEARCH CLINICS..." 
                  className="w-full bg-transparent border-b border-black/10 py-4 pl-8 outline-none focus:border-black transition-all text-[10px] uppercase tracking-[0.2em] font-bold" 
                />
             </div>
          </div>
        </header>

        {/* The Swiss Grid List */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 border border-black/5">
          {CLINICS.map((clinic) => (
            <div key={clinic.id} className="clinic-item bg-[#FAF9F6] p-10 group cursor-pointer relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-16">
                <span className="text-[10px] font-bold opacity-20 group-hover:opacity-100 transition-opacity">{clinic.id}</span>
                <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-end">
                <div className="flex-1">
                  <h2 className="text-4xl font-medium tracking-tighter mb-4 uppercase group-hover:text-blue-600 transition-colors">
                    {clinic.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {clinic.tags.map(tag => (
                      <span key={tag} className="text-[9px] uppercase tracking-widest font-bold px-3 py-1 border border-black/10 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="w-full md:w-48 aspect-[4/3] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                  <img 
                    src={clinic.img} 
                    alt={clinic.name} 
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" 
                  />
                </div>
              </div>

              {/* Hover Location Reveal */}
              <div className="mt-8 pt-8 border-t border-black/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{clinic.location}</span>
                 <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
              </div>

            </div>
          ))}
        </section>
      </main>

      {/* Modern Footer CTA */}
      <footer className="px-8 py-32 border-t border-black/5 text-center">
         <h3 className="text-[8vw] font-medium tracking-tighter uppercase mb-12">Can't decide?</h3>
         <button className="bg-blue-600 text-white px-12 py-6 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-colors">
            Ask AI Assistant
         </button>
      </footer>
    </div>
  );
};

export default ClinicList;