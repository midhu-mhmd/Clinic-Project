import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    number: "01",
    title: "AI-guided care",
    desc: "Intelligent symptom analysis that directs you to the precise specialist without the wait.",
  },
  {
    number: "02",
    title: "Verified doctors",
    desc: "A curated network of healthcare professionals, strictly vetted for quality and trust.",
  },
  {
    number: "03",
    title: "Instant booking",
    desc: "Direct access to real-time availability. Schedule your consultation in seconds.",
  },
  {
    number: "04",
    title: "Secure data",
    desc: "Clinical-grade encryption ensures your medical history remains private and protected.",
  },
];

const WhyPatientsLoveUs = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal header
      gsap.from(".reveal-header", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Reveal grid items one by one with a border-draw effect
      cardsRef.current.forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
          },
          delay: i * 0.1,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-32 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* HEADER */}
        <div className="reveal-header border-b border-[#2D302D]/10 pb-16 mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
            <p className="text-[10px] tracking-[0.5em] uppercase text-[#8DAA9D] font-bold mb-4">
              Core Philosophies
            </p>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1] text-[#2D302D] tracking-tighter">
              A healthcare experience <br />
              <span className="italic font-serif text-[#8DAA9D]">reimagined.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-[#2D302D]/60 leading-relaxed font-light">
            We focus on the intersection of human empathy and medical precision to simplify your journey.
          </p>
        </div>

        {/* MINIMAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-[#2D302D]/5">
          {features.map((item, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="group relative p-10 border-r border-b border-[#2D302D]/5 hover:bg-[#8DAA9D]/5 transition-colors duration-700"
            >
              <span className="text-[10px] font-mono opacity-30 block mb-12">
                [{item.number}]
              </span>

              <h3 className="text-xl font-light text-[#2D302D] mb-4 tracking-tight">
                {item.title}
              </h3>

              <p className="text-sm text-[#2D302D]/60 leading-relaxed font-light">
                {item.desc}
              </p>
              
              {/* Subtle hover line */}
              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#8DAA9D] group-hover:w-full transition-all duration-700"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPatientsLoveUs;
