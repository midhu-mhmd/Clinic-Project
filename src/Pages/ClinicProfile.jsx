import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Star, MapPin, Clock, ShieldCheck, Calendar, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ClinicProfile = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Cinematic Hero Entrance
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.1
      });

      // 2. Parallax Image Effect
      gsap.to(".hero-img", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // 3. Staggered reveal for info blocks
      gsap.from(".info-block", {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".info-grid",
          start: "top bottom-=100"
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="text-[#111] font-sans">
      
      {/* Immersive Hero Section */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden flex items-end pb-20 px-10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1629909613654-2871b886daa4?q=80&w=2000" 
            className="hero-img w-full h-full object-cover scale-110 grayscale-[0.5] brightness-[0.7]"
            alt="Clinic Interior"
          />
        </div>
        
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6 opacity-80 text-gray">
              <Star size={16} fill="currentColor" className="text-yellow-400" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">4.9 / Top Tier Facility</span>
            </div>
            <h1 className="hero-title text-[12vw] font-medium leading-[0.8] tracking-tighter text-gray   uppercase italic font-serif">
              Bright <br /> <span className="not-italic font-sans text-blue-500 lowercase">Health.</span>
            </h1>
          </div>
          
          <div className="flex flex-col items-end gap-6 text-gray text-right">
             <p className="max-w-xs text-sm opacity-60 font-light leading-relaxed">
               Advanced clinical care meets architectural serenity in the heart of San Francisco.
             </p>
             <button className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center hover:bg-gray hover:text-black transition-all duration-500">
                <ArrowDown size={20} />
             </button>
          </div>
        </div>
      </section>

      {/* The Core Content Grid */}
      <main className="px-10 py-32">
        <div className="info-grid grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Left Column: Essential Details */}
          <div className="lg:col-span-7 space-y-24">
            
            <section className="info-block">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-6 block">Architecture of Care</span>
              <h2 className="text-5xl font-medium tracking-tighter uppercase mb-8 leading-tight">
                Specialized in multi-disciplinary <br /> clinical excellence.
              </h2>
              <p className="text-xl text-neutral-500 font-light leading-relaxed">
                Our team of board-certified specialists uses the latest technology to ensure accurate diagnoses and effective treatments. We are here to support your health journey with compassion.
              </p>
            </section>

            <div className="info-block grid grid-cols-2 gap-px bg-black/5 border border-black/5">
              {[
                { label: "Location", val: "123 Wellness Blvd, SF", icon: <MapPin size={14}/> },
                { label: "Hours", val: "8 AM - 8 PM Daily", icon: <Clock size={14}/> },
                { label: "Security", val: "HIPAA Compliant", icon: <ShieldCheck size={14}/> },
                { label: "AI Enabled", val: "Smart Scheduling", icon: <Zap size={14}/> }
              ].map((item, i) => (
                <div key={i} className=" p-10 hover:bg-gray transition-colors group">
                  <div className="text-blue-600 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">{item.icon}</div>
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-30 block mb-1">{item.label}</span>
                  <span className="text-sm font-medium tracking-tight uppercase">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Floating Booking Action */}
          <div className="lg:col-span-5">
            <div className="info-block sticky top-32 bg-gray border border-black/5 p-12 space-y-10">
              <div className="flex justify-between items-center border-b border-black/5 pb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Booking Portal</span>
                <Calendar size={18} className="opacity-20" />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-3xl font-medium tracking-tighter uppercase">Request Visit</h3>
                <p className="text-sm text-gray-400 font-light">Consultations start from $80. Instant confirmation available via AI assistant.</p>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-black text-gray py-6 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-blue-600 transition-all duration-500">
                  Book Appointment Now
                </button>
                <button className="w-full border border-black/10 py-6 text-[10px] uppercase tracking-[0.3em] font-bold hover:border-black transition-all">
                  Chat with AI Assistant
                </button>
              </div>

              <div className="pt-6 border-t border-black/5 flex items-center justify-between text-[9px] uppercase font-bold opacity-30">
                <span>Verified Facility</span>
                <span>In-Network Insurance</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sub-Specialists Section (Editorial Row) */}
      <section className="px-10 py-32 border-t border-black/5">
        <h3 className="text-[10vw] font-medium tracking-tighter uppercase opacity-5 mb-20 select-none">Excellence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
           {['Dr. Sarah Jenkins', 'Dr. Michael Chen'].map((name, i) => (
             <div key={i} className="flex items-center gap-10 group cursor-pointer">
                <div className="w-32 h-40 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                   <img src={`https://i.pravatar.cc/300?img=${i+10}`} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt={name} />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-blue-600">Senior Specialist</span>
                  <h4 className="text-3xl font-medium tracking-tighter uppercase group-hover:translate-x-2 transition-transform">{name}</h4>
                  <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">12+ Years Experience</span>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default ClinicProfile;