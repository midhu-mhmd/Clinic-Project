import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Search, Heart, Globe, Plus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const DOCTORS = [
  { id: '01', name: "Dr. Sarah Jenkins", specialty: "Cardiology", experience: "15Y", availability: "Today", img: "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=800" },
  { id: '02', name: "Dr. Mark Doe", specialty: "Internal Med", experience: "8Y", availability: "Tomorrow", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800" },
  { id: '03', name: "Dr. Emily Yu", specialty: "Pediatrics", experience: "12Y", availability: "Oct 24", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800" },
  { id: '04', name: "Dr. Robert Chen", specialty: "Orthopedics", experience: "14Y", availability: "Today", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800" },
];

const DoctorList = () => {
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Elegant Reveal
      gsap.from(".header-reveal", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.15
      });

      // Subtle row entrance
      gsap.utils.toArray(".doctor-row").forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 30,
          duration: 1,
          scrollTrigger: {
            trigger: row,
            start: "top 90%",
          }
        });
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="bg-[#FAF9F6] text-[#2D302D] min-h-screen">

      <main className="px-8 lg:px-16 pt-32 pb-20">
        
        {/* REFINED HEADER */}
        <header className="mb-32 border-b border-[#2D302D]/10 pb-20">
          <div className="overflow-hidden mb-4">
            <h1 className="header-reveal text-[clamp(3.5rem,10vw,10rem)] font-light leading-[0.8] tracking-tighter uppercase italic font-serif text-[#8DAA9D]">
              Verified
            </h1>
          </div>
          <div className="overflow-hidden">
             <h1 className="header-reveal text-[clamp(3.5rem,10vw,10rem)] font-light leading-[0.8] tracking-tighter uppercase">
               Specialists.
             </h1>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-end mt-16 gap-12">
             <p className="max-w-md text-[#2D302D]/50 font-light text-xl leading-relaxed italic">
               "Connect with providers verified for clinical excellence, where every interaction is protected by design."
             </p>
             <div className="w-full lg:w-[400px]">
                <div className="flex items-center gap-4 border-b border-[#2D302D]/10 py-4 group focus-within:border-[#8DAA9D] transition-all">
                  <Search size={16} className="opacity-30 group-focus-within:text-[#8DAA9D] group-focus-within:opacity-100" />
                  <input 
                    type="text" 
                    placeholder="Search by Specialty..." 
                    className="bg-transparent outline-none text-[10px] uppercase tracking-[0.4em] font-bold w-full"
                  />
                </div>
             </div>
          </div>
        </header>

        {/* LIST: THE ARCHITECTURAL TABLE */}
        <div className="border-t border-[#2D302D]/10">
          {DOCTORS.map((doc) => (
            <div key={doc.id} className="doctor-row group relative grid grid-cols-1 lg:grid-cols-12 items-center py-10 px-4 border-b border-[#2D302D]/5 hover:bg-[#8DAA9D]/5 transition-all duration-700 cursor-pointer">
              
              {/* Exhibit Number */}
              <div className="hidden lg:block lg:col-span-1 text-[10px] font-mono opacity-20 group-hover:opacity-100 group-hover:text-[#8DAA9D] transition-all">
                {doc.id}
              </div>

              {/* Identity & Portrait Overlay */}
              <div className="lg:col-span-4 flex items-center gap-8">
                <div className="relative w-20 h-28 overflow-hidden grayscale brightness-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 rounded-sm bg-[#2D302D]/5">
                  <img src={doc.img} alt={doc.name} className="w-full h-full object-cover scale-125 group-hover:scale-100 transition-transform duration-1000" />
                </div>
                <div>
                  <h2 className="text-3xl font-light tracking-tighter group-hover:text-[#8DAA9D] transition-colors duration-500 uppercase">
                    {doc.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#2D302D]/40">{doc.specialty}</span>
                    <div className="w-1 h-1 rounded-full bg-[#8DAA9D]/30" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8DAA9D]">Verified</span>
                  </div>
                </div>
              </div>

              {/* Horizontal Metadata */}
              <div className="hidden lg:flex lg:col-span-2 flex-col gap-1 pl-8 border-l border-[#2D302D]/5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#2D302D]/30">Experience</span>
                <span className="text-sm font-medium tracking-tight text-[#2D302D]">{doc.experience}</span>
              </div>

              <div className="hidden lg:flex lg:col-span-2 flex-col gap-1 pl-8 border-l border-[#2D302D]/5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#2D302D]/30">Next Entry</span>
                <span className="text-sm font-medium tracking-tight text-[#8DAA9D]">{doc.availability}</span>
              </div>

              {/* Actions & Iconography */}
              <div className="lg:col-span-3 flex items-center justify-end gap-10">
                <div className="hidden xl:flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-700">
                   <Heart size={16} strokeWidth={1.5} className="text-[#2D302D]/40 hover:text-[#8DAA9D]" />
                   <Globe size={16} strokeWidth={1.5} className="text-[#2D302D]/40 hover:text-[#8DAA9D]" />
                </div>
                <button className="relative overflow-hidden bg-[#2D302D] text-[#FAF9F6] px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#8DAA9D] transition-all duration-700 flex items-center gap-4 group/btn">
                  Book Entry <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>

      {/* FOOTER ACCENT */}
      <footer className="px-8 lg:px-16 py-32 flex flex-col items-center">
         <div className="w-full h-[1px] bg-[#2D302D]/5 mb-24" />
         <h3 className="text-[clamp(2.5rem,8vw,8rem)] font-light tracking-tighter uppercase leading-none text-[#2D302D]/5 select-none text-center">
           A Lineage of <br /> Clinical Precision.
         </h3>
         <button className="mt-16 group flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#2D302D]">Technical Support</span>
            <div className="w-14 h-14 rounded-full border border-[#2D302D]/10 flex items-center justify-center group-hover:bg-[#2D302D] group-hover:text-[#FAF9F6] transition-all duration-500">
               <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            </div>
         </button>
      </footer>
    </div>
  );
};

export default DoctorList;
