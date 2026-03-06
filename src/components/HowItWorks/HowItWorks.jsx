import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const containerRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stepsRef.current.forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: {
              trigger: step,
              start: "top 85%",
            },
            delay: i * 0.1,
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: "01",
      title: "Describe Symptoms",
      desc: "Use our AI-powered health assistant to describe your symptoms and receive preliminary guidance.",
      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    },
    {
      num: "02",
      title: "Find Your Doctor",
      desc: "Browse verified clinics and specialists. Filter by specialty, location, and availability.",
      img: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&q=80&w=800",
      offset: true,
    },
    {
      num: "03",
      title: "Book & Consult",
      desc: "Schedule an in-person visit or telehealth consultation. Receive reminders and join with one click.",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
    },
  ];

  return (
    <section ref={containerRef} className="relative w-full py-40 bg-[#F0FDFA]">
      <div className="max-w-7xl mx-auto px-8">
        {/* MINIMAL HEADER */}
        <div className="mb-32">
          <p className="text-[10px] tracking-[0.5em] text-[#0F766E] uppercase font-bold mb-6">
            How It Works
          </p>
          <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-light leading-none text-[#1E293B] tracking-tighter">
            Your path to care, <br />
            <span className="italic font-serif text-[#0F766E]">
              in three simple steps.
            </span>
          </h2>
        </div>

        {/* STAGGERED EXHIBITS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 items-start">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => (stepsRef.current[i] = el)}
              className={`flex flex-col ${step.offset ? "md:mt-32" : ""}`}
            >
              {/* Image Container with Minimalist Frame */}
              <div className="relative group aspect-9/12 mb-10 overflow-hidden bg-white border border-[#0F766E]/10 rounded-4xl transition-all duration-700 hover:border-[#0F766E]/30">
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                />
                {/* Overlay Number */}
                <div className="absolute top-8 left-8 text-[10px] font-mono text-[#1E293B]/40 tracking-widest uppercase">
                  Step {step.num}
                </div>
              </div>

              {/* Text Detail */}
              <div className="px-2">
                <h3 className="text-2xl font-light text-[#1E293B] mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[#1E293B]/50 font-light leading-relaxed">
                  {step.desc}
                </p>

                {/* Minimalist connecting line for desktop */}
                {i < 2 && (
                  <div className="hidden md:block mt-8 w-full h-px bg-linear-to-r from-[#0F766E]/40 to-transparent" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[#0F766E]/5 rounded-full blur-[120px] -z-10" />
    </section>
  );
};

export default HowItWorks;
