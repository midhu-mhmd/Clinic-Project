import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#F0FDFA] pt-32 pb-12 px-8 border-t border-[#1E293B]/5">
      <div className="max-w-350 mx-auto">
        {/* TOP ROW: BRANDING STATEMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-6">
            <h3 className="text-[clamp(2rem,4vw,3rem)] font-light tracking-tighter text-[#1E293B] leading-none mb-8">
              Simplifying <br />
              <span className="italic font-serif text-[#0F766E]">
                healthcare access.
              </span>
            </h3>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#1E293B]/50 font-bold max-w-60">
                A multi-tenant platform connecting patients with trusted clinics and doctors.
              </p>
            </div>
          </div>

          {/* LINK GROUPS */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-6">
              <span className="text-[9px] font-mono text-[#0F766E] uppercase tracking-[0.3em]">
                Services
              </span>
              <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-widest text-[#1E293B] font-bold">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    Find a Clinic
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    Our Doctors
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    AI Health Assistant
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-[9px] font-mono text-[#0F766E] uppercase tracking-[0.3em]">
                Company
              </span>
              <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-widest text-[#1E293B] font-bold">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    Our Mission
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-[9px] font-mono text-[#0F766E] uppercase tracking-[0.3em]">
                Legal
              </span>
              <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-widest text-[#1E293B] font-bold">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0F766E] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: BIG BRANDING */}
        <div className="border-t border-[#1E293B]/10 pt-12 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="order-2 md:order-1">
            <h1 className="text-[12vw] font-light tracking-tighter leading-none text-[#1E293B]/5 select-none">
              HEALTHBOOK
            </h1>
            <p className="text-[9px] tracking-[0.4em] uppercase text-[#1E293B]/30 mt-4">
              © 2026 Sovereign HealthBook — All Rights Reserved
            </p>
          </div>

          <div className="order-1 md:order-2 flex flex-col items-end gap-4">
            <div className="flex gap-2">
              {["TW", "IG", "LN"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 border border-[#1E293B]/10 rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-[#0F766E] hover:text-white transition-all duration-500"
                >
                  {social}
                </a>
              ))}
            </div>
            <p className="text-[9px] tracking-widest text-[#1E293B]/40 uppercase">
              Built for Better Healthcare
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
