import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ArrowRight, Plus } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      gsap.set(".line-reveal", { y: "110%" });
      gsap.set(".fade-up", { y: 40, opacity: 0 });

      tl.to(".line-reveal", {
        y: "0%",
        duration: 1.8,
        stagger: 0.1,
      })
      .to(".fade-up", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
      }, "-=1.2")
      .fromTo(visualRef.current, 
        { scale: 1.2, filter: "blur(10px)", opacity: 0 }, 
        { scale: 1, filter: "blur(0px)", opacity: 1, duration: 2, ease: "power4.out" }, 
        "-=1.5"
      );

      // Parallax effect only for Desktop/Tablet
      const handleMouseMove = (e) => {
        if (window.innerWidth < 1024) return;
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;
        
        gsap.to(visualRef.current, {
          x: xPos,
          y: yPos,
          duration: 1.2,
          ease: "power2.out"
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full  text-[#2D302D] overflow-hidden flex flex-col justify-center py-20 lg:py-0">
      
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#2D302D 1px, transparent 1px), linear-gradient(90deg, #2D302D 1px, transparent 1px)`, backgroundSize: 'clamp(40px, 5vw, 60px) clamp(40px, 5vw, 60px)' }} />

      <div className="container mx-auto px-6 sm:px-10 md:px-16 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-4 items-center">
          
          {/* LEFT: CONTENT AREA */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <div className="fade-up mb-8 lg:mb-12 flex items-center gap-4">
              <span className="w-8 lg:w-12 h-[1px] bg-[#8DAA9D]"></span>
              <span className="text-[9px] lg:text-[10px] tracking-[0.4em] lg:tracking-[0.5em] uppercase font-bold text-[#8DAA9D]">
                The Sovereign Protocol — 2025
              </span>
            </div>

            {/* Oversized Responsive Typography */}
            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] xl:text-[8.5rem] leading-[0.85] tracking-[-0.04em] font-light uppercase">
              <div className="overflow-hidden">
                <span className="line-reveal inline-block">Humanity</span>
              </div>
              <div className="overflow-hidden">
                <span className="line-reveal inline-block italic font-serif text-[#8DAA9D] lowercase tracking-tighter sm:pr-4">meets</span>
              </div>
              <div className="overflow-hidden">
                <span className="line-reveal inline-block">Intelligence.</span>
              </div>
            </h1>

            <div className="mt-10 lg:mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-end">
              <p className="fade-up text-base sm:text-lg lg:text-xl font-light leading-relaxed opacity-70 max-w-sm lg:max-w-none">
                A refined synthesis of clinical excellence and artificial intelligence. 
                Sovereign provides a bespoke path to longevity, architected by data.
              </p>
              
              <div className="fade-up flex flex-col sm:flex-row lg:flex-col gap-8 sm:items-center lg:items-start">
                <button 
                  onClick={() => navigate("/clinics")}
                  className="group relative inline-flex items-center justify-between bg-[#2D302D] text-[#FAF9F6] px-8 py-5 lg:py-6 w-full sm:w-64 transition-transform active:scale-95 hover:bg-[#8DAA9D] duration-500"
                >
                  <span className="text-[9px] lg:text-[10px] tracking-[0.3em] uppercase font-bold">Initiate Discovery</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="flex items-center gap-4 lg:gap-8 lg:px-2">
                    <div className="flex -space-x-3">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-[#FAF9F6] bg-gray-200" />)}
                    </div>
                    <span className="text-[8px] lg:text-[9px] uppercase tracking-widest opacity-40 font-bold leading-tight">
                        12.4k Patients <br /> Secured.
                    </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: VISUAL AREA (Visible/Hidden behavior adjusted for Mobile) */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2 flex justify-center lg:block">
            <div ref={visualRef} className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-none aspect-[4/5] sm:aspect-[3/4] bg-[#2D302D] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-between text-[#FAF9F6]">
                    <div className="flex justify-between items-start">
                        <Plus className="text-[#8DAA9D] w-5 h-5 lg:w-6 lg:h-6" />
                        <span className="text-[8px] lg:text-[9px] uppercase tracking-widest opacity-40 font-mono">System_V.08</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="h-px w-full bg-white/10" />
                        <h3 className="text-3xl lg:text-4xl xl:text-5xl font-serif italic font-light tracking-tighter">98.2%</h3>
                        <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] font-bold text-[#8DAA9D]">Diagnostic Accuracy</p>
                    </div>
                </div>
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-black" />
            </div>
            
            {/* Sideways Label - Hidden on Mobile for clean UI */}
            <div className="hidden lg:block fade-up absolute -left-12 bottom-12 bg-[#8DAA9D] text-[#FAF9F6] py-3 lg:py-4 px-6 rotate-[-90deg] origin-bottom-left">
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold whitespace-nowrap">Clinical Excellence</span>
            </div>
          </div>

        </div>
      </div>

      {/* Side Numbers (Awwwards Style) - Hidden on Tablet/Mobile */}
      <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12 items-center opacity-20">
        <span className="text-[10px] font-bold">01</span>
        <div className="w-[1px] h-32 bg-[#2D302D]"></div>
        <span className="text-[10px] font-bold opacity-40">04</span>
      </div>
    </section>
  );
};

export default HeroSection;
