
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, Shield, ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TrustShowcase = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Reveal mask animation
      gsap.from(".reveal-up", {
        y: "110%",
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Subtle image zoom on scroll
      gsap.from(".bento-img", {
        scale: 1.1,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          scrub: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#FAF9F6] py-32 px-8 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-black/10 pb-12 mb-20">
          <div className="overflow-hidden">
            <h2 className="reveal-up text-[8vw] leading-none font-medium tracking-tighter uppercase">
              Secure <span className="italic font-serif text-blue-600 lowercase">by</span> Design.
            </h2>
          </div>
          <p className="max-w-[280px] text-[10px] uppercase tracking-[0.2em] leading-relaxed opacity-50 mt-6 md:mt-0">
            Every interaction is encrypted. Every record is private. Building trust through computational transparency.
          </p>
        </div>

        {/* Bento Grid Composition */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-black/10 border border-black/10">
          
          {/* Main Screenshot - Large */}
          <div className="md:col-span-8 bg-[#FAF9F6] p-10 group cursor-pointer">
            <div className="flex justify-between items-start mb-16">
              <span className="text-[10px] font-bold uppercase tracking-widest">01 / Unified Health Interface</span>
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <div className="aspect-video bg-slate-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200" 
                alt="Main UI" 
                className="bento-img w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Feature Card - Data Security */}
          <div className="md:col-span-4 bg-[#111111] text-white p-10 flex flex-col justify-between group cursor-pointer">
            <div className="flex justify-between items-start">
              <Shield size={20} strokeWidth={1} className="opacity-50" />
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-3xl font-medium tracking-tighter mb-4">Encryption Standard</h3>
              <p className="text-sm opacity-60 leading-relaxed font-light">
                We utilize zero-knowledge architecture. Your medical data is masked even from our own servers.
              </p>
            </div>
          </div>

          {/* Secondary Screenshot - Small */}
          <div className="md:col-span-4 bg-[#FAF9F6] p-10 group cursor-pointer">
             <div className="aspect-square bg-slate-100 mb-8 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
              <img 
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=800" 
                alt="Secondary UI" 
                className="bento-img w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">02 / Verified Care</span>
          </div>

          {/* Text/Metric Card */}
          <div className="md:col-span-8 bg-[#FAF9F6] p-10 flex flex-col justify-center">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                <div>
                    <h4 className="text-4xl font-medium tracking-tighter mb-2">99.9<span className="text-blue-600">%</span></h4>
                    <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold">Uptime Reliability</p>
                </div>
                <div>
                    <h4 className="text-4xl font-medium tracking-tighter mb-2">256<span className="text-blue-600">bit</span></h4>
                    <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold">AES Encryption</p>
                </div>
                <div className="hidden md:block">
                    <h4 className="text-4xl font-medium tracking-tighter mb-2">100<span className="text-blue-600">%</span></h4>
                    <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold">HIPAA Compliant</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustShowcase;



