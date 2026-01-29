import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 1. Added useNavigate
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Star,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
  MessageSquare,
  Quote,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // 2. Initialize navigate
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          `http://localhost:5000/api/doctors/public/${id}`,
        );

        if (data.success) {
          setDoctor(data.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Clinical dossier could not be retrieved.",
        );
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoctorDetails();
  }, [id]);

  useEffect(() => {
    if (loading || !doctor) return;

    let ctx = gsap.context(() => {
      gsap.from(".hero-text-reveal", {
        y: 100,
        skewY: 3,
        opacity: 0,
        duration: 1.6,
        ease: "expo.out",
        stagger: 0.1,
      });

      gsap.fromTo(
        imageRef.current,
        { scale: 1.15, filter: "grayscale(100%)" },
        {
          scale: 1,
          filter: "grayscale(30%)",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        },
      );

      gsap.from(".fade-up", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".main-content",
          start: "top 80%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, doctor]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#8DAA9D] mb-4" size={40} />
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">
          Decrypting Profile...
        </p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6] text-red-500">
        <AlertCircle size={40} className="mb-4" />
        <p className="text-[10px] uppercase tracking-[0.4em] mb-4">
          {error || "Doctor not found"}
        </p>
        <button
          onClick={() => window.history.back()}
          className="text-[9px] uppercase tracking-widest text-[#2D302D] underline"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF9F6] text-[#2D302D] selection:bg-[#8DAA9D] selection:text-[#FAF9F6]"
    >
      <section className="hero-section relative pt-40 pb-24 px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 items-end border-b border-[#2D302D]/5">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4 mb-12 overflow-hidden">
            <div className="hero-text-reveal flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D]">
                Physician Code: {doctor._id.slice(-6).toUpperCase()}
              </span>
              <div className="w-8 h-px bg-[#8DAA9D]/30" />
              <Star size={12} className="text-[#8DAA9D]" />
              <span className="text-[10px] font-bold tracking-[0.2em]">
                {doctor.rating || "5.0"} RATING
              </span>
            </div>
          </div>

          <div className="overflow-hidden">
            <h1 className="hero-text-reveal text-[clamp(3rem,7vw,7rem)] font-light leading-[0.9] tracking-tighter uppercase mb-4">
              {doctor.name.split(" ")[0]} <br />
              <span className="italic font-serif text-[#8DAA9D] lowercase tracking-normal">
                {doctor.name.split(" ").slice(1).join(" ")}.
              </span>
            </h1>
          </div>

          <p className="hero-text-reveal text-xl lg:text-2xl mt-10 font-light text-[#2D302D]/60 max-w-xl leading-relaxed italic">
            "
            {doctor.about ||
              `Pioneering ${doctor.specialization} through clinical excellence and architectural restorative care.`}
            "
          </p>
        </div>

        <div className="lg:col-span-5 relative aspect-[4/5] overflow-hidden rounded-sm bg-[#2D302D]/5">
          <img
            ref={imageRef}
            src={
              doctor.image ||
              `https://ui-avatars.com/api/?name=${doctor.name}&background=8DAA9D&color=fff&size=512`
            }
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <main className="main-content px-8 lg:px-16 py-32 grid grid-cols-1 lg:grid-cols-12 gap-24">
        <div className="lg:col-span-7 space-y-32">
          <div className="grid grid-cols-3 border-y border-[#2D302D]/5 py-12">
            {[
              { label: "Faculty Specialty", val: doctor.specialization },
              { label: "Clinical Tenure", val: `${doctor.experience}Y` },
              {
                label: "Clinic",
                val: doctor.tenantId?.name || "Global Network",
              },
            ].map((stat, i) => (
              <div key={i} className="fade-up">
                <span className="block text-[9px] uppercase tracking-[0.4em] text-[#2D302D]/30 font-bold mb-4">
                  {stat.label}
                </span>
                <span className="block text-xl lg:text-3xl font-light tracking-tighter uppercase">
                  {stat.val}
                </span>
              </div>
            ))}
          </div>

          <section className="fade-up space-y-10">
            <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D]">
              Clinical Philosophy
            </h2>
            <div className="text-2xl text-[#2D302D]/70 font-light leading-snug space-y-8">
              <p className="border-l-2 border-[#8DAA9D]/20 pl-8">
                Clinical practice in {doctor.specialization} is the pursuit of
                technical perfection balanced by human empathy. Dr.{" "}
                {doctor.name.split(" ").pop()} utilizes advanced protocols to
                ensure long-term patient resilience.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="p-8 bg-white border border-[#2D302D]/5 flex flex-col gap-4">
                  <Award size={20} className="text-[#8DAA9D]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">
                    Distinction
                  </span>
                  <span className="text-sm font-bold">
                    Board of {doctor.specialization} Excellence
                  </span>
                </div>
                <div className="p-8 bg-white border border-[#2D302D]/5 flex flex-col gap-4">
                  <Shield size={20} className="text-[#8DAA9D]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">
                    Validation
                  </span>
                  <span className="text-sm font-bold">
                    Verified Medical Faculty Member
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="fade-up pt-10 border-t border-[#2D302D]/5">
            <div className="relative p-16 bg-[#2D302D] text-[#FAF9F6]">
              <Quote
                className="absolute top-12 left-12 opacity-10"
                size={80}
                strokeWidth={1}
              />
              <p className="relative z-10 text-2xl font-light italic leading-relaxed mb-10">
                "The protocol designed for my recovery was as precise as it was
                supportive. A total shift in how I view medical care under Dr.{" "}
                {doctor.name.split(" ").pop()}."
              </p>
              <div className="flex items-center gap-6">
                <div className="w-12 h-px bg-[#8DAA9D]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                  Patient Registry // Verified Review
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="sticky top-24">
            <div className="bg-[#2D302D] text-[#FAF9F6] p-12 shadow-2xl space-y-12">
              <div className="flex justify-between items-start border-b border-[#FAF9F6]/10 pb-10">
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.5em] text-[#8DAA9D] font-bold mb-4">
                    Availability Status
                  </span>
                  <h3 className="text-3xl font-light tracking-tighter uppercase">
                    Protocol Entry
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full border border-[#FAF9F6]/10 flex items-center justify-center">
                  <Clock size={18} className="text-[#8DAA9D]" />
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    type: "In-Clinic Visit",
                    price: `$${doctor.fees || "150"}`,
                    icon: <MapPin size={16} />,
                  },
                  {
                    type: "Neural Consult (Video)",
                    price: `$${Math.round((doctor.fees || 150) * 0.6)}`,
                    icon: <MessageSquare size={16} />,
                    active: true,
                  },
                ].map((opt, i) => (
                  <div
                    key={i}
                    className={`p-6 border transition-all cursor-pointer flex justify-between items-center group ${opt.active ? "border-[#8DAA9D] bg-[#8DAA9D]/5" : "border-[#FAF9F6]/10 hover:border-[#FAF9F6]/40"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={opt.active ? "text-[#8DAA9D]" : "opacity-30"}
                      >
                        {opt.icon}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        {opt.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono opacity-30 group-hover:opacity-100 group-hover:text-[#8DAA9D] transition-all">
                      {opt.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    navigate("/appointment", {
                      state: {
                        clinicId: doctor.clinicId,
                        doctorId: doctor.id,
                      },
                    });
                  }}
                  className="w-full py-8 bg-[#8DAA9D] text-[#FAF9F6] text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[#FAF9F6] hover:text-[#2D302D] transition-all duration-700 flex items-center justify-center gap-4 group"
                >
                  Confirm Entry
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-2 transition-transform duration-500"
                  />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 opacity-20">
                <Shield size={12} />
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold">
                  Verified HIPAA Protocol
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
