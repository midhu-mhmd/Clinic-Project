import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FinalCTA = () => {
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text Reveal
      gsap.from(".cta-reveal", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Magnetic Button Effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    gsap.to(buttonRef.current, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[60vh] sm:min-h-[80vh] flex flex-col items-center justify-center border-t border-[#0F766E]/10 overflow-hidden py-20"
    >
      {/* Decorative Branding Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <h2 className="text-[40vw] sm:text-[30vw] font-serif italic">Health</h2>
      </div>

      <div className="relative z-10 text-center max-w-4xl px-6 sm:px-8">
        <div className="overflow-hidden mb-4 sm:mb-6">
          <p className="cta-reveal text-[10px] tracking-[0.4em] sm:tracking-[0.6em] text-[#0F766E] uppercase font-bold">
            Ready to Get Started?
          </p>
        </div>

        <div className="overflow-hidden mb-10 sm:mb-12">
          <h2 className="cta-reveal text-[clamp(2rem,8vw,6rem)] font-light leading-none text-[#1E293B] tracking-tighter">
            Your health journey <br className="hidden sm:block" />
            <span className="italic font-serif text-[#0F766E]">
              starts here.
            </span>
          </h2>
        </div>

        <div className="overflow-hidden flex justify-center">
          <div className="cta-reveal w-full sm:w-auto">
            <button
              ref={buttonRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="group relative bg-[#0F766E] text-white px-8 sm:px-16 py-6 sm:py-8 rounded-2xl sm:rounded-full text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-bold transition-transform hover:bg-[#1E293B] duration-700 w-full sm:w-auto shadow-2xl shadow-[#0F766E]/20"
            >
              Talk to Our AI Assistant
              <div className="absolute -inset-4 border border-[#0F766E]/30 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700 -z-10 hidden sm:block" />
            </button>
          </div>
        </div>
      </div>

      {/* Minimal Footer Info */}
      <div className="absolute bottom-8 sm:bottom-12 w-full px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[8px] sm:text-[9px] tracking-widest text-[#1E293B]/40 uppercase text-center md:text-left">
          &copy; 2026 Sovereign Healthcare &mdash; Multi-Tenant Platform
        </p>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-[9px] tracking-[0.3em] text-[#1E293B] uppercase font-bold group flex items-center gap-4"
        >
          Back to Top
          <div className="w-8 h-px bg-[#0F766E] group-hover:w-12 transition-all duration-500"></div>
        </button>
      </div>
    </section>
  );
};

export default FinalCTA;
