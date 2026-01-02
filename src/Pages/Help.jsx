import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Search,
  ArrowRight,
  MessageCircle,
  BookOpen,
  ShieldCheck,
  Cpu,
} from "lucide-react";

const Help = () => {
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Elegant Staggered Entrance
      gsap.from(".reveal", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
      });

      // Subtle Border Animation
      gsap.from(".divider", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 2,
        ease: "power4.inOut",
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  const categories = [
    {
      title: "Protocol Initiation",
      count: "12 Guides",
      icon: <BookOpen size={20} />,
      id: "01",
    },
    {
      title: "Facility Infrastructure",
      count: "08 Guides",
      icon: <ShieldCheck size={20} />,
      id: "02",
    },
    {
      title: "Transaction Architecture",
      count: "05 Guides",
      icon: <Cpu size={20} />,
      id: "03",
    },
    {
      title: "Neural Assistant Setup",
      count: "10 Guides",
      icon: <MessageCircle size={20} />,
      id: "04",
    },
  ];

  return (
    <div
      ref={mainRef}
      className="min-h-screen bg-[#FAF9F6] text-[#2D302D] selection:bg-[#8DAA9D] selection:text-[#FAF9F6]"
    >
      {/* MINIMALIST SEARCH HEADER */}
      <section className="pt-40 pb-24 px-8 border-b border-[#2D302D]/5">
        <div className="max-w-350 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-8 mb-16">
            <div className="overflow-hidden">
              <h1 className="reveal text-[clamp(3rem,8vw,7rem)] font-light leading-[0.9] tracking-tighter uppercase">
                Support{" "}
                <span className="italic font-serif text-[#8DAA9D] lowercase tracking-normal">
                  Index.
                </span>
              </h1>
            </div>
            <p className="reveal max-w-xs text-[10px] uppercase tracking-[0.4em] text-[#2D302D]/40 font-bold">
              Autonomous Documentation & Technical Protocol Assistance.
            </p>
          </div>

          <div className="reveal max-w-3xl relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:text-[#8DAA9D] group-focus-within:opacity-100 transition-all" />
            <input
              type="text"
              placeholder="Query the Archive..."
              className="w-full bg-transparent border-b border-[#2D302D]/10 py-8 pl-12 outline-none focus:border-[#2D302D] transition-all text-xl font-light placeholder:text-[#2D302D]/20"
            />
            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.3em] uppercase font-bold text-[#8DAA9D] hover:text-[#2D302D] transition-colors">
              Execute
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY ARCHIVE GRID */}
      <section className="py-0 px-8">
        <div className="max-w-350 mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#2D302D]/10 border-x border-b border-[#2D302D]/10">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="reveal bg-[#FAF9F6] p-12 hover:bg-[#8DAA9D]/5 transition-all duration-700 cursor-pointer group flex flex-col justify-between aspect-square"
              >
                <div>
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-[10px] font-mono text-[#8DAA9D] tracking-widest">
                      {cat.id} //
                    </span>
                    <div className="opacity-20 group-hover:opacity-100 group-hover:text-[#8DAA9D] transition-all duration-500">
                      {cat.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-light tracking-tight mb-2 group-hover:italic transition-all duration-500">
                    {cat.title}
                  </h3>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#2D302D]/40 font-bold">
                    {cat.count}
                  </p>
                </div>

                <div className="flex items-center gap-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Access Files
                  </span>
                  <ArrowRight size={14} className="text-[#8DAA9D]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNICAL CONTACT BLOCK */}
      <section className="py-40 px-8">
        <div className="max-w-350 mx-auto border-t border-[#2D302D]/5 pt-20 flex flex-col lg:flex-row justify-between items-end gap-16">
          <div className="reveal">
            <h4 className="text-[clamp(2rem,4vw,4rem)] font-light tracking-tighter leading-none mb-6">
              Require human <br />
              <span className="italic font-serif text-[#8DAA9D]">
                intervention?
              </span>
            </h4>
            <p className="text-[#2D302D]/40 text-sm font-light max-w-sm leading-relaxed">
              Our technical engineering team is available for high-priority
              architectural support 24/7 for Tier-1 members.
            </p>
          </div>

          <button className="reveal group relative bg-[#2D302D] text-[#FAF9F6] py-8 px-16 text-[10px] tracking-[0.5em] uppercase font-bold hover:bg-[#8DAA9D] transition-all duration-700 overflow-hidden">
            <span className="relative z-10">Initiate Contact</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Help;
