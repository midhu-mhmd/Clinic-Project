import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Shield, Clock, MapPin, ArrowRight, MessageSquare, Quote, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const DoctorProfile = () => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Text Mask Reveal
      gsap.from(".hero-text-reveal", {
        y: 120,
        opacity: 0,
        duration: 1.4,
        ease: "power4.out",
        stagger: 0.15
      });

      // 2. Image Parallax Scale
      gsap.fromTo(imageRef.current, 
        { scale: 1.1, y: 0 },
        { 
          scale: 1, 
          y: 50,
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        }
      );

      // 3. Stats Count-up & Fade
      gsap.from(".stat-item", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".stats-row",
          start: "top bottom-=100"
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF9F6] text-[#111] font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Editorial Hero Section */}
      <section className="hero-section relative w-full pt-32 pb-20 px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end border-b border-black/5">
        
        {/* Left: Typography & Intro */}
        <div className="lg:col-span-7 z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="px-3 py-1 rounded-full border border-blue-600/30 text-blue-600 text-[10px] uppercase tracking-widest font-bold">
              Board Certified
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
               <Star size={12} fill="currentColor" />
               <span className="text-[10px] font-bold text-black tracking-widest pt-0.5">4.98 RATING</span>
            </div>
          </div>
          
          <div className="overflow-hidden mb-2">
            <h1 className="hero-text-reveal text-[10vw] lg:text-[7vw] font-medium leading-[0.9] tracking-tighter uppercase text-black">
              Dr. Sarah <br />
              <span className="font-serif italic text-neutral-400">Jenkins.</span>
            </h1>
          </div>
          
          <p className="hero-text-reveal text-xl lg:text-2xl mt-8 font-light text-neutral-600 max-w-xl leading-relaxed">
            Leading the future of non-invasive cardiology with over 15 years of clinical excellence and compassionate care.
          </p>
        </div>

        {/* Right: Cinematic Portrait */}
        <div className="lg:col-span-5 relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-sm">
          <div className="absolute inset-0 bg-black/5 z-10 mix-blend-multiply pointer-events-none"></div>
          <img 
            ref={imageRef}
            src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=1200" 
            alt="Dr. Sarah Jenkins" 
            className="w-full h-full object-cover grayscale-[0.2]"
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="px-8 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        
        {/* Left Column: Story & Credentials */}
        <div className="lg:col-span-7 space-y-20">
          
          {/* Stats Row */}
          <div className="stats-row flex justify-between border-b border-black/5 pb-10">
             {[
               { label: "Patients", val: "5k+" },
               { label: "Experience", val: "15Y" },
               { label: "Surgeries", val: "1.2k" },
             ].map((stat, i) => (
               <div key={i} className="stat-item">
                 <span className="block text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-2">{stat.label}</span>
                 <span className="block text-4xl lg:text-5xl font-medium tracking-tighter">{stat.val}</span>
               </div>
             ))}
          </div>

          {/* Biography */}
          <section className="space-y-8">
            <h2 className="text-3xl font-medium tracking-tight">Philosophy of Care</h2>
            <div className="text-lg text-neutral-500 font-light leading-loose space-y-6">
              <p>
                "Medicine is not just about treating symptoms; it is about understanding the human story behind them. My approach combines rigorous data-driven diagnostics with a holistic view of patient lifestyle."
              </p>
              <p>
                Dr. Jenkins completed her residency at Johns Hopkins and has since pioneered new techniques in preventive cardiology that reduce the need for invasive surgery by 40%.
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
               <div className="flex items-center gap-3 px-6 py-4 bg-white border border-black/5 rounded-lg">
                  <Award className="text-blue-600" size={20} />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-widest">Awarded</span>
                    <span className="text-xs font-bold">Top Cardiologist 2024</span>
                  </div>
               </div>
            </div>
          </section>

          {/* Patient Reviews - Editorial Style */}
          <section className="pt-10 border-t border-black/5">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 mb-10">Patient Stories</h3>
            <div className="relative p-10 bg-white border border-black/5 rounded-sm">
              <Quote className="absolute top-8 left-8 text-neutral-100 transform -scale-x-100" size={60} />
              <p className="relative z-10 text-xl font-serif italic text-neutral-700 leading-relaxed mb-6">
                "I was terrified of my procedure, but Dr. Jenkins' calm demeanor and clear explanation changed everything. She didn't just treat my heart; she put my mind at ease."
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-neutral-100 rounded-full"></div>
                 <div>
                    <span className="block text-xs font-bold uppercase tracking-wider">Emma W.</span>
                    <span className="block text-[10px] text-neutral-400 uppercase tracking-widest">Verified Patient</span>
                 </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Interface */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-12">
            <div className="bg-white border border-black/5 p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] rounded-2xl relative overflow-hidden">
              
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                   <div>
                     <span className="block text-[10px] uppercase tracking-[0.2em] text-blue-600 font-bold mb-2">Availability</span>
                     <h3 className="text-2xl font-medium tracking-tight">Book a Session</h3>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                     <Clock size={18} />
                   </div>
                </div>

                {/* Date/Time Selection Minimal */}
                <div className="space-y-6 mb-10">
                   <div className="p-4 border border-black/10 rounded-lg hover:border-black transition-colors cursor-pointer flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-neutral-400 group-hover:text-black transition-colors" />
                        <span className="text-sm font-medium">In-Clinic Visit</span>
                      </div>
                      <span className="text-xs font-bold text-neutral-400">$150</span>
                   </div>
                   <div className="p-4 border border-blue-600/20 bg-blue-50/30 rounded-lg flex justify-between items-center cursor-pointer">
                      <div className="flex items-center gap-3">
                        <MessageSquare size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Video Consult</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600">$80</span>
                   </div>
                </div>

                <div className="space-y-3">
                   <button className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-4 group">
                      Confirm Booking <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                   <button className="w-full py-4 border border-black/10 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-50 transition-colors">
                      Ask AI Assistant First
                   </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-neutral-400">
                   <Shield size={12} />
                   <span className="text-[9px] uppercase tracking-widest">HIPAA Secure • Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DoctorProfile;