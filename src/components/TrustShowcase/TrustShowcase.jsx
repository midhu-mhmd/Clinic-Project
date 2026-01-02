import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, Shield, ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TrustShowcase = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Elegant Title Mask Reveal
      gsap.from(".reveal-up", {
        y: "100%",
        duration: 2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Subtle Grid Entrance
      gsap.from(gridRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#FAF9F6] py-40 px-8 overflow-hidden">
      <div className="max-w-350 mx-auto">
        
        {/* MINIMALIST HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 border-b border-[#2D302D]/10 pb-16">
          <div className="overflow-hidden">
            <h2 className="reveal-up text-[clamp(3rem,8vw,7rem)] leading-[0.85] font-light tracking-tighter text-[#2D302D]">
              Privacy as <br />
              <span className="italic font-serif text-[#8DAA9D]">a foundation.</span>
            </h2>
          </div>
          <div className="max-w-[320px] mt-12 lg:mt-0">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#8DAA9D] font-bold mb-4">
              06 — Infrastructure
            </p>
            <p className="text-sm text-[#2D302D]/60 leading-relaxed font-light italic">
              "We believe your medical history is yours alone. Our zero-knowledge protocol ensures your data is encrypted before it even reaches our cloud."
            </p>
          </div>
        </div>

        {/* REFINED BENTO GRID */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-[#2D302D]/10 border border-[#2D302D]/10">
          
          {/* Main Visual: Clinical Precision */}
          <div className="lg:col-span-7 bg-[#FAF9F6] p-12 group cursor-none">
            <div className="flex justify-between items-start mb-20">
              <span className="text-[9px] font-mono opacity-40 uppercase tracking-[0.3em]">Module — Data Integrity</span>
              <div className="w-8 h-8 rounded-full border border-[#2D302D]/10 flex items-center justify-center group-hover:bg-[#2D302D] group-hover:text-white transition-all duration-500">
                <Plus size={14} />
              </div>
            </div>
            <div className="aspect-16/10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200" 
                alt="Clinical UI" 
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
              />
            </div>
          </div>

          {/* Feature: Encryption (Dark Mode Contrast) */}
          <div className="lg:col-span-5 bg-[#2D302D] text-[#FAF9F6] p-12 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <Shield size={24} strokeWidth={1} className="text-[#8DAA9D]" />
              <ArrowUpRight size={20} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <div>
              <h3 className="text-4xl font-light tracking-tighter mb-6">Zero-Knowledge Architecture</h3>
              <p className="text-sm opacity-50 leading-relaxed font-light max-w-sm">
                Proprietary encryption that masks medical records from the server-side, granting only the patient and the physician decryption keys.
              </p>
            </div>
          </div>

          {/* Metrics Block */}
          <div className="lg:col-span-12 bg-[#FAF9F6] p-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { val: "256-bit", lab: "AES Security" },
                { val: "99.99%", lab: "Uptime" },
                { val: "HIPAA", lab: "Compliant" },
                { val: "ISO", lab: "Certified" }
              ].map((stat, i) => (
                <div key={i} className="border-l border-[#2D302D]/10 pl-8">
                  <h4 className="text-4xl font-light tracking-tighter text-[#2D302D] mb-2">{stat.val}</h4>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#8DAA9D] font-bold">{stat.lab}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustShowcase;



