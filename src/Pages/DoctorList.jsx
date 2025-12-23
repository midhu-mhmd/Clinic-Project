import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Search, Activity, Heart, Globe } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const DOCTORS = [
  { id: '01', name: "Dr. Sarah Jenkins", specialty: "Cardiologist", experience: "15+ Years", availability: "Available Today", img: "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=800" },
  { id: '02', name: "Dr. Mark Doe", specialty: "General Physician", experience: "8 Years", availability: "Available Tomorrow", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800" },
  { id: '03', name: "Dr. Emily Yu", specialty: "Pediatrician", experience: "12 Years", availability: "Oct 24", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800" },
  { id: '04', name: "Dr. Robert Chen", specialty: "Orthopedic", experience: "14 Years", availability: "Available Today", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800" },
];

const DoctorList = () => {
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // cinematic entrance
      gsap.from(".header-reveal", {
        y: 120,
        skewY: 7,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.1
      });

      // stagger list items on scroll
      gsap.utils.toArray(".doctor-row").forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 40,
          scrollTrigger: {
            trigger: row,
            start: "top bottom-=50",
            toggleActions: "play none none reverse"
          }
        });
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-[#FAF9F6] text-[#111] selection:bg-blue-600 selection:text-white font-sans">

      <main className="px-10 pt-40 pb-20">
        
        {/* Editorial Header */}
        <header className="mb-40 border-b border-black/5 pb-20">
          <div className="overflow-hidden mb-2">
            <h1 className="header-reveal text-[12vw] font-medium leading-[0.8] tracking-tighter uppercase italic font-serif">
              Trusted <br /> <span className="not-italic font-sans text-blue-600 lowercase">Specialists.</span>
            </h1>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-end mt-16 gap-10">
             <p className="max-w-md text-neutral-500 font-light text-xl leading-relaxed">
                Connect with world-class healthcare providers verified for clinical excellence and patient care.
             </p>
             <div className="w-full md:w-auto">
                <div className="flex items-center gap-4 border-b border-black/10 py-2 group focus-within:border-black transition-all">
                  <Search size={18} className="opacity-20 group-focus-within:opacity-100" />
                  <input 
                    type="text" 
                    placeholder="FIND BY SPECIALTY..." 
                    className="bg-transparent outline-none text-[10px] uppercase tracking-[0.3em] font-bold w-64"
                  />
                </div>
             </div>
          </div>
        </header>

        {/* The List Layout - Editorial Grid */}
        <div className="space-y-[1px] bg-black/5 border-y border-black/5">
          {DOCTORS.map((doc) => (
            <div key={doc.id} className="doctor-row group bg-[#FAF9F6] grid grid-cols-1 lg:grid-cols-12 items-center py-12 px-4 hover:bg-white transition-all duration-700 cursor-pointer">
              
              {/* ID & Image Overlay */}
              <div className="lg:col-span-1 text-[10px] font-bold opacity-20 group-hover:opacity-100 group-hover:text-blue-600 transition-all">
                {doc.id}
              </div>

              {/* Doctor Avatar - Floating Interaction */}
              <div className="lg:col-span-3 flex items-center gap-8">
                <div className="w-24 h-32 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                  <img src={doc.img} alt={doc.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                </div>
                <div>
                  <h2 className="text-3xl font-medium tracking-tighter uppercase group-hover:text-blue-600 transition-colors">
                    {doc.name}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{doc.specialty}</p>
                </div>
              </div>

              {/* Stats - Horizontal alignment */}
              <div className="hidden lg:flex lg:col-span-2 flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Experience</span>
                <span className="text-sm font-medium tracking-tight">{doc.experience}</span>
              </div>

              <div className="hidden lg:flex lg:col-span-2 flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-neutral-400">Next Slot</span>
                <span className="text-sm font-medium tracking-tight text-green-600">{doc.availability}</span>
              </div>

              {/* Tags & Action */}
              <div className="lg:col-span-4 flex items-center justify-end gap-10">
                <div className="hidden md:flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <div className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-colors"><Heart size={14} /></div>
                   <div className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-colors"><Globe size={14} /></div>
                </div>
                <button className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all duration-500 flex items-center gap-3">
                  Book Visit <ArrowUpRight size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>

      {/* Floating CTA */}
      <footer className="px-10 py-32 flex flex-col items-center">
         <div className="w-full h-[1px] bg-black/5 mb-20" />
         <p className="text-[8vw] font-medium tracking-tighter uppercase leading-none opacity-10 mb-10">Excellence in Care.</p>
         <button className="flex items-center gap-4 group">
            <span className="text-[11px] uppercase tracking-[0.4em] font-bold">Talk to AI Assistant</span>
            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
               <ArrowUpRight size={20} />
            </div>
         </button>
      </footer>
    </div>
  );
};

export default DoctorList;
