import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#FAF9F6] pt-32 pb-12 px-8 border-t border-[#2D302D]/5">
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP ROW: BRANDING STATEMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-6">
            <h3 className="text-[ clamp(2rem,4vw,3rem)] font-light tracking-tighter text-[#2D302D] leading-none mb-8">
              Redefining the <br />
              <span className="italic font-serif text-[#8DAA9D]">patient journey.</span>
            </h3>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-[#8DAA9D] animate-pulse" />
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#2D302D]/50 font-bold max-w-[240px]">
                Currently serving the digital healthcare landscape with clinical precision.
              </p>
            </div>
          </div>

          {/* LINK GROUPS */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-6">
              <span className="text-[9px] font-mono text-[#8DAA9D] uppercase tracking-[0.3em]">[ Platform ]</span>
              <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-widest text-[#2D302D] font-bold">
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">Clinics</a></li>
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">Specialists</a></li>
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">AI Maria</a></li>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-[9px] font-mono text-[#8DAA9D] uppercase tracking-[0.3em]">[ Studio ]</span>
              <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-widest text-[#2D302D] font-bold">
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">Vision</a></li>
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-[9px] font-mono text-[#8DAA9D] uppercase tracking-[0.3em]">[ Legal ]</span>
              <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-widest text-[#2D302D] font-bold">
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#8DAA9D] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: BIG BRANDING */}
        <div className="border-t border-[#2D302D]/10 pt-12 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="order-2 md:order-1">
            <h1 className="text-[12vw] font-light tracking-tighter leading-none text-[#2D302D]/5 select-none">
              HEALTHBOOK
            </h1>
            <p className="text-[9px] tracking-[0.4em] uppercase text-[#2D302D]/30 mt-4">
              © 2025 Intellectual Property — All Rights Reserved
            </p>
          </div>

          <div className="order-1 md:order-2 flex flex-col items-end gap-4">
            <div className="flex gap-2">
              {['TW', 'IG', 'LN'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 border border-[#2D302D]/10 rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-[#2D302D] hover:text-[#FAF9F6] transition-all duration-500">
                  {social}
                </a>
              ))}
            </div>
            <p className="text-[9px] tracking-widest text-[#2D302D]/40 uppercase">Designed for Wellness</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;