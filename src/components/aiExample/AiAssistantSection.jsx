import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AiAssistantSection = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sophisticated reveal on scroll
      gsap.fromTo(
        [textRef.current, chatRef.current],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full py-32 bg-[#FAF9F6] border-t border-[#2D302D]/5"
    >
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        {/* LEFT: MINIMAL TYPOGRAPHY */}
        <div ref={textRef} className="pt-4">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#8DAA9D] font-bold mb-8">
            02 — Intelligent Guidance
          </p>

          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.1] text-[#2D302D] tracking-tighter">
            An intuitive path <br />
            <span className="italic font-serif text-[#8DAA9D]">
              to the right specialist.
            </span>
          </h2>

          <p className="mt-10 text-[#2D302D] font-light text-lg leading-relaxed max-w-sm opacity-60">
            Skip the guesswork. Describe your symptoms and let our assistant
            identify the care you actually need.
          </p>

          <button className="mt-12 group flex items-center gap-6 text-[10px] tracking-[0.3em] uppercase font-bold text-[#2D302D]">
            Start Consultation
            <div className="relative w-12 h-px bg-[#8DAA9D] group-hover:w-20 transition-all duration-700"></div>
          </button>
        </div>

        {/* RIGHT: ABSTRACT CHAT INTERFACE */}
        <div
          ref={chatRef}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-100 flex flex-col gap-8">
            {/* Minimal Bubble 1 */}
            <div className="self-end max-w-[80%]">
              <p className="text-[10px] tracking-widest uppercase opacity-30 mb-2 text-right">
                Patient
              </p>
              <div className="px-6 py-4 rounded-3xl border border-[#2D302D]/10 text-[#2D302D] font-light italic">
                "Persistent headache and sensitivity to light."
              </div>
            </div>

            {/* Minimal Bubble 2 */}
            <div className="self-start max-w-[80%]">
              <p className="text-[10px] tracking-widest uppercase text-[#8DAA9D] mb-2">
                Assistant
              </p>
              <div className="px-6 py-4 rounded-3xl bg-[#2D302D] text-[#FAF9F6] font-light">
                This suggests a visit to a{" "}
                <strong className="font-normal text-[#8DAA9D]">
                  Neurologist
                </strong>
                . I’ve found three top-rated clinics near you.
              </div>
            </div>

            {/* Subtle Input Indicator */}
            <div className="mt-4 flex items-center justify-between px-2 opacity-30 border-b border-[#2D302D]/10 pb-4 italic font-light text-sm">
              <span>Type your symptoms...</span>
              <div className="w-2 h-2 rounded-full bg-[#8DAA9D] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistantSection;
