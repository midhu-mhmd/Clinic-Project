import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Star, MapPin, Clock, ShieldCheck, Calendar, Zap, Plus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ClinicProfile = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Reveal Titles with a Skew
      gsap.from(".hero-reveal", {
        y: 120,
        skewY: 5,
        opacity: 0,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.1
      });

      // 2. Parallax Image with Smooth Scrub
      gsap.to(".hero-img", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });

      // 3. Info Block staggered appearance
      gsap.from(".info-block", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".info-grid",
          start: "top 85%"
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] text-[#2D302D] selection:bg-[#8DAA9D] selection:text-[#FAF9F6]">
      
      {/* IMMERSIVE HERO */}
      <section ref={heroRef} className="relative h-[90vh] w-full overflow-hidden flex items-end pb-24 px-8 lg:px-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1629909613654-2871b886daa4?q=80&w=2000" 
            className="hero-img w-full h-full object-cover grayscale-[0.3] brightness-[0.6] scale-110"
            alt="Clinic Interior"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent opacity-60" />
        </div>
        
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-10 overflow-hidden">
              <Star size={14} className="text-[#8DAA9D] hero-reveal" />
              <span className="hero-reveal text-[10px] uppercase tracking-[0.5em] font-bold text-[#FAF9F6]/60">Exhibit 01 — Top Tier Facility</span>
            </div>
            <div className="overflow-hidden mb-2">
              <h1 className="hero-reveal text-[clamp(4rem,12vw,12rem)] font-light leading-[0.8] tracking-tighter uppercase italic font-serif text-[#FAF9F6]">
                Bright
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 className="hero-reveal text-[clamp(4rem,12vw,12rem)] font-light leading-[0.8] tracking-tighter uppercase text-[#8DAA9D]">
                Health.
              </h1>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-10 text-[#FAF9F6] text-right">
             <p className="max-w-[280px] text-[11px] uppercase tracking-widest font-bold opacity-70 leading-relaxed">
               Advanced clinical care meets architectural serenity in the heart of San Francisco.
             </p>
             <div className="w-16 h-16 rounded-full border border-[#FAF9F6]/20 flex items-center justify-center hover:bg-[#FAF9F6] hover:text-[#2D302D] transition-all duration-700 cursor-pointer animate-bounce">
                <ArrowDown size={18} />
             </div>
          </div>
        </div>
      </section>

      {/* CORE CONTENT GRID */}
      <main className="px-8 lg:px-16 py-32">
        <div className="info-grid grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* LEFT: ESSENTIALS */}
          <div className="lg:col-span-7 space-y-32">
            <section className="info-block">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8DAA9D] mb-8 block">Philosophy</span>
              <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-light tracking-tighter uppercase mb-12 leading-none">
                Specialized in <br /> 
                <span className="italic font-serif text-[#8DAA9D]">multi-disciplinary</span> <br /> 
                clinical excellence.
              </h2>
              <p className="text-xl text-[#2D302D]/60 font-light leading-relaxed italic max-w-2xl">
                "Our team of board-certified specialists uses technical precision and architectural calm to ensure the patient journey is as restorative as the treatment itself."
              </p>
            </section>

            <div className="info-block grid grid-cols-2 gap-px bg-[#2D302D]/10 border border-[#2D302D]/10">
              {[
                { label: "Location", val: "123 Wellness Blvd, SF", icon: <MapPin size={14}/> },
                { label: "Hours", val: "8 AM - 8 PM Daily", icon: <Clock size={14}/> },
                { label: "Security", val: "HIPAA Compliant", icon: <ShieldCheck size={14}/> },
                { label: "Neural", val: "Smart Scheduling", icon: <Zap size={14}/> }
              ].map((item, i) => (
                <div key={i} className="bg-[#FAF9F6] p-12 hover:bg-[#8DAA9D]/5 transition-colors group">
                  <div className="text-[#8DAA9D] mb-6 opacity-40 group-hover:opacity-100 transition-all">{item.icon}</div>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 block mb-2">{item.label}</span>
                  <span className="text-[11px] font-bold tracking-widest uppercase">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: FLOATING PORTAL */}
          <div className="lg:col-span-5 relative">
            <div className="info-block sticky top-32 bg-[#2D302D] text-[#FAF9F6] p-12 space-y-12 rounded-sm shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#FAF9F6]/10 pb-8">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 font-mono">Protocol — 01</span>
                <Calendar size={18} className="text-[#8DAA9D]" />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-4xl font-light tracking-tighter uppercase">Request Entry</h3>
                <p className="text-sm text-[#FAF9F6]/40 font-light italic leading-relaxed">Consultations start from $80. Instant verification available via our secure AI protocol.</p>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-[#8DAA9D] text-[#FAF9F6] py-8 text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[#FAF9F6] hover:text-[#2D302D] transition-all duration-700">
                  Book Appointment
                </button>
                <button className="w-full border border-[#FAF9F6]/10 py-8 text-[10px] uppercase tracking-[0.5em] font-bold hover:border-[#FAF9F6] transition-all duration-700">
                  Consult AI Agent
                </button>
              </div>

              <div className="pt-8 border-t border-[#FAF9F6]/10 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-bold opacity-30">
                <span>Verified Facility</span>
                <span>Tier-1 Insurance</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SPECIALISTS (EDITORIAL SECTION) */}
      <section className="px-8 lg:px-16 py-40 border-t border-[#2D302D]/5">
        <h3 className="text-[14vw] font-light tracking-tighter uppercase text-[#2D302D]/5 mb-32 select-none leading-none">
          EXCELLENCE
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
           {['Dr. Sarah Jenkins', 'Dr. Michael Chen'].map((name, i) => (
             <div key={i} className="flex flex-col lg:flex-row items-center gap-12 group cursor-pointer">
                <div className="w-full lg:w-48 aspect-[3/4] overflow-hidden grayscale brightness-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 rounded-sm">
                   <img src={`https://i.pravatar.cc/300?img=${i+10}`} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt={name} />
                </div>
                <div className="text-center lg:text-left">
                  <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8DAA9D] block mb-4">Senior Specialist</span>
                  <h4 className="text-4xl font-light tracking-tighter uppercase group-hover:text-[#8DAA9D] transition-all duration-500 mb-4">{name}</h4>
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">12Y Clinical Experience</span>
                    <Plus size={14} className="opacity-20 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default ClinicProfile;