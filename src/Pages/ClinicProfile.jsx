import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  ArrowDown,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
  Zap,
  Loader2,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ClinicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicDetails = async () => {
      try {
        // 1. Fixed data destructuring to get the inner 'data' object from backend
        const response = await axios.get(
          `http://localhost:5000/api/tenants/${id}`
        );

        // Based on your controller: res.status(200).json({ success: true, data: clinic })
        if (response.data && response.data.data) {
          setClinic(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching clinic:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinicDetails();
  }, [id]);

  useEffect(() => {
    if (loading || !clinic) return;

    let ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 120,
        skewY: 5,
        opacity: 0,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.1,
      });

      gsap.to(".hero-img", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.from(".info-block", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        stagger: 0.1,
        scrollTrigger: { trigger: ".info-grid", start: "top 85%" },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, clinic]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#8DAA9D] mb-4" size={48} />
        <p className="text-[10px] uppercase tracking-widest opacity-40">
          Decrypting Facility Data
        </p>
      </div>
    );
  }

  // 2. Added safety check if clinic exists after loading
  if (!clinic) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
        <p className="text-[10px] uppercase tracking-widest">
          Facility Not Found
        </p>
      </div>
    );
  }

  // 3. Handled name splitting with safety fallback
  const clinicName = clinic.name || "Unknown Facility";
  const nameParts = clinicName.split(" ");
  const firstName = nameParts[0];
  const remainingName = nameParts.slice(1).join(" ");

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF9F6] text-[#2D302D] selection:bg-[#8DAA9D] selection:text-[#FAF9F6]"
    >
      {/* MIX-BLEND NAV */}
      <nav className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold group text-[#FAF9F6] mix-blend-difference"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Directory
        </button>
      </nav>

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative h-[90vh] w-full overflow-hidden flex items-end pb-24 px-8 lg:px-16"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={
              clinic.image ||
              clinic.img ||
              "https://images.unsplash.com/photo-1629909613654-2871b886daa4"
            }
            className="hero-img w-full h-full object-cover grayscale-[0.3] brightness-[0.5] scale-110"
            alt={clinicName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-10 overflow-hidden">
              <Star size={14} className="text-[#8DAA9D] hero-reveal" />
              <span className="hero-reveal text-[10px] uppercase tracking-[0.5em] font-bold text-[#FAF9F6]/60">
                Official Exhibit — {clinic._id?.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="overflow-hidden mb-2">
              <h1 className="hero-reveal text-[clamp(3.5rem,8vw,10rem)] font-light leading-[0.8] tracking-tighter uppercase italic font-serif text-[#FAF9F6]">
                {firstName}
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 className="hero-reveal text-[clamp(3.5rem,8vw,10rem)] font-light leading-[0.8] tracking-tighter uppercase text-[#8DAA9D]">
                {remainingName || "Facility"}
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-end gap-10 text-[#FAF9F6] text-right">
            <p className="max-w-70 text-[11px] uppercase tracking-widest font-bold opacity-70 leading-relaxed">
              Established in {clinic.address || clinic.location}. <br />{" "}
              Verified Premium Clinical Infrastructure.
            </p>
            <div className="w-16 h-16 rounded-full border border-[#FAF9F6]/20 flex items-center justify-center hover:bg-[#FAF9F6] hover:text-[#2D302D] transition-all duration-700 cursor-pointer animate-bounce">
              <ArrowDown size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <main className="px-8 lg:px-16 py-32">
        <div className="info-grid grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-7 space-y-32">
            <section className="info-block">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8DAA9D] mb-8 block">
                Philosophy
              </span>
              <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-light tracking-tighter uppercase mb-12 leading-none">
                Specialized in <br />
                <span className="italic font-serif text-[#8DAA9D]">
                  {clinic.tags?.[0] || "Advanced Medicine"}
                </span>{" "}
                <br />
                clinical excellence.
              </h2>
              <p className="text-xl text-[#2D302D]/60 font-light leading-relaxed italic max-w-2xl">
                "
                {clinic.description ||
                  "Medical facility focused on clinical excellence."}
                "
              </p>
            </section>

            <div className="info-block grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#2D302D]/10 border border-[#2D302D]/10">
              {[
                {
                  label: "Address",
                  val: clinic.address || clinic.location,
                  icon: <MapPin size={14} />,
                },
                {
                  label: "Availability",
                  val: "By Appointment",
                  icon: <Clock size={14} />,
                },
                {
                  label: "Standard",
                  val:
                    clinic.subscription?.plan + " Certified" ||
                    "Tier-1 Certified",
                  icon: <ShieldCheck size={14} />,
                },
                {
                  label: "Contact",
                  val: "Secure Channel",
                  icon: <Zap size={14} />,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-[#FAF9F6] p-12 hover:bg-[#8DAA9D]/5 transition-colors group"
                >
                  <div className="text-[#8DAA9D] mb-6 opacity-40 group-hover:opacity-100 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 block mb-2">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="info-block sticky top-32 bg-[#2D302D] text-[#FAF9F6] p-12 space-y-12 rounded-sm shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#FAF9F6]/10 pb-8">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 font-mono">
                  Access Protocol — {clinic._id?.slice(-4).toUpperCase()}
                </span>
                <Calendar size={18} className="text-[#8DAA9D]" />
              </div>

              <div className="space-y-6">
                <h3 className="text-4xl font-light tracking-tighter uppercase">
                  Reserve Slot
                </h3>
                <p className="text-sm text-[#FAF9F6]/40 font-light italic leading-relaxed">
                  Instant scheduling is active for this facility. Please ensure
                  you have your medical ID ready for verification.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    navigate(`/appointment/${id}`);
                  }}
                  className="w-full bg-[#8DAA9D] text-[#FAF9F6] py-8 text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[#FAF9F6] hover:text-[#2D302D] transition-all duration-700"
                >
                  Book Appointment
                </button>
                <button className="w-full border border-[#FAF9F6]/10 py-8 text-[10px] uppercase tracking-[0.5em] font-bold hover:border-[#FAF9F6] transition-all duration-700">
                  Inquire
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* TAGS FOOTER */}
      <section className="px-8 lg:px-16 py-20 border-t border-[#2D302D]/5">
        <div className="flex flex-wrap gap-4">
          {clinic.tags?.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] uppercase tracking-[0.3em] font-bold px-6 py-3 border border-[#2D302D]/10 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClinicProfile;
