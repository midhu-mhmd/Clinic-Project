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
    <section ref={sectionRef} className="bg-[#F0FDFA] py-40 px-8 overflow-hidden">
      <div className="max-w-350 mx-auto">
        
        {/* MINIMALIST HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 border-b border-[#1E293B]/10 pb-16">
          <div className="overflow-hidden">
            <h2 className="reveal-up text-[clamp(3rem,8vw,7rem)] leading-[0.85] font-light tracking-tighter text-[#1E293B]">
              Your data, <br />
              <span className="italic font-serif text-[#0F766E]">fully protected.</span>
            </h2>
          </div>
          <div className="max-w-[320px] mt-12 lg:mt-0">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#0F766E] font-bold mb-4">
              Security & Compliance
            </p>
            <p className="text-sm text-[#1E293B]/60 leading-relaxed font-light italic">
              "Your medical records are encrypted end-to-end. Only you and your authorised physician hold the decryption keys."
            </p>
          </div>
        </div>

        {/* REFINED BENTO GRID */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-[#1E293B]/10 border border-[#1E293B]/10 rounded-xl overflow-hidden">
          
          {/* Main Visual: Clinical Precision */}
          <div className="lg:col-span-7 bg-[#F0FDFA] p-12 group cursor-none">
            <div className="flex justify-between items-start mb-20">
              <span className="text-[9px] font-mono opacity-40 uppercase tracking-[0.3em]">Data Protection</span>
              <div className="w-8 h-8 rounded-full border border-[#1E293B]/10 flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-all duration-500">
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
          <div className="lg:col-span-5 bg-[#1E293B] text-white p-12 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <Shield size={24} strokeWidth={1} className="text-[#0F766E]" />
              <ArrowUpRight size={20} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <div>
              <h3 className="text-4xl font-light tracking-tighter mb-6">End-to-End Encryption</h3>
              <p className="text-sm opacity-50 leading-relaxed font-light max-w-sm">
                Industry-standard encryption ensures medical records remain confidential. Only the patient and their attending physician have access.
              </p>
            </div>
          </div>

          {/* Metrics Block */}
          <div className="lg:col-span-12 bg-[#F0FDFA] p-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { val: "256-bit", lab: "AES Encryption" },
                { val: "99.99%", lab: "Platform Uptime" },
                { val: "HIPAA", lab: "Compliant" },
                { val: "ISO 27001", lab: "Certified" }
              ].map((stat, i) => (
                <div key={i} className="border-l border-[#1E293B]/10 pl-8">
                  <h4 className="text-4xl font-light tracking-tighter text-[#1E293B] mb-2">{stat.val}</h4>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#0F766E] font-bold">{stat.lab}</p>
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



