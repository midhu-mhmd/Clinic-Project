import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const API_BASE_URL = "http://localhost:5000/api";

// --- Styled Components / Sub-components ---
const StatBox = ({ label, value }) => (
  <div className="fade-up">
    <span className="block text-[9px] uppercase tracking-[0.4em] text-[#2D302D]/30 font-bold mb-4">
      {label}
    </span>
    <span className="block text-xl lg:text-3xl font-light tracking-tighter uppercase text-[#2D302D]">
      {value}
    </span>
  </div>
);

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * ✅ Robust ID extraction
   * Works for:
   * - tenantId: "string"
   * - tenantId: { _id: "...", name: "..." }
   * - clinicId / tenant / clinic variations
   */
  const { clinicId, doctorId, clinicName } = useMemo(() => {
    if (!doctor) return { clinicId: null, doctorId: null, clinicName: null };

    const dId = doctor._id || doctor.id || null;

    const t =
      doctor.tenantId ||
      doctor.tenant ||
      doctor.clinicId ||
      doctor.clinic ||
      null;

    const cId =
      (typeof t === "string" ? t : null) ||
      t?._id ||
      t?.id ||
      t?.tenantId ||
      doctor.tenantId?._id ||
      doctor.clinicId?._id ||
      null;

    const cName =
      (typeof t === "object" ? t?.name : null) ||
      doctor.tenantName ||
      doctor.clinicName ||
      null;

    return { clinicId: cId, doctorId: dId, clinicName: cName };
  }, [doctor]);

  // ✅ Fetch Logic with AbortController
  useEffect(() => {
    const controller = new AbortController();

    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(
          `${API_BASE_URL}/doctors/public/${id}`,
          { signal: controller.signal }
        );

        if (data?.success) {
          setDoctor(data.data);
          // Debug: remove later
          // console.log("DOCTOR DATA:", data.data);
        } else {
          throw new Error(data?.message || "Profile not found");
        }
      } catch (err) {
        // axios cancel in v1 uses CanceledError name
        if (err?.name === "CanceledError") return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Clinical dossier could not be retrieved."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoctorDetails();
    return () => controller.abort();
  }, [id]);

  // ✅ GSAP Animations with scoped context
  useEffect(() => {
    if (loading || !doctor) return;
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-text-reveal", {
        y: 60,
        skewY: 2,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
        clearProps: "transform",
      });

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.1, filter: "grayscale(100%)" },
          {
            scale: 1,
            filter: "grayscale(20%)",
            scrollTrigger: {
              trigger: ".hero-section",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      gsap.from(".fade-up", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".main-content",
          start: "top 85%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, doctor]);

  // ✅ Appointment Options Data
  const appointmentOptions = useMemo(
    () => [
      {
        type: "In-Clinic Visit",
        price: `₹${doctor?.fees || 150}`,
        icon: <MapPin size={16} />,
        active: false,
      },
      {
        type: "Neural Consult (Video)",
        price: `₹${Math.round((doctor?.fees || 150) * 0.6)}`,
        icon: <MessageSquare size={16} />,
        active: true,
      },
    ],
    [doctor]
  );

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#8DAA9D] mb-4" size={32} />
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 animate-pulse">
          Decrypting Profile...
        </p>
      </div>
    );

  if (error || !doctor)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6] text-red-500 p-6 text-center">
        <AlertCircle size={40} className="mb-4 opacity-50" />
        <p className="text-[10px] uppercase tracking-[0.4em] mb-6 max-w-xs leading-loose">
          {error || "Doctor not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-[9px] uppercase tracking-widest text-[#2D302D] underline underline-offset-4 hover:text-[#8DAA9D] transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );

  const safeName = doctor?.name || "Doctor";
  const first = safeName.split(" ")[0] || "Doctor";
  const rest = safeName.split(" ").slice(1).join(" ");

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF9F6] text-[#2D302D] selection:bg-[#8DAA9D] selection:text-[#FAF9F6] min-h-screen"
    >
      {/* Hero Section */}
      <section className="hero-section relative pt-32 lg:pt-48 pb-24 px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end border-b border-[#2D302D]/5">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="hero-text-reveal flex items-center gap-3">
              <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D]">
                Physician Code: {String(doctorId || "").slice(-6).toUpperCase()}
              </span>
              <div className="w-8 h-px bg-[#8DAA9D]/30" />
              <Star size={12} className="text-[#8DAA9D] fill-[#8DAA9D]" />
              <span className="text-[10px] font-bold tracking-[0.2em]">
                {doctor.rating || "5.0"} RATING
              </span>
            </div>
          </div>

          <h1 className="hero-text-reveal text-[clamp(2.5rem,8vw,6.5rem)] font-light leading-[0.85] tracking-tighter uppercase mb-6">
            {first} <br />
            <span className="italic font-serif text-[#8DAA9D] lowercase tracking-normal">
              {rest ? `${rest}.` : ""}
            </span>
          </h1>

          <p className="hero-text-reveal text-lg lg:text-xl mt-8 font-light text-[#2D302D]/60 max-w-lg leading-relaxed italic">
            "
            {doctor.about ||
              `Specializing in ${doctor.specialization} with a focus on clinical excellence and patient-centric restorative care.`}
            "
          </p>

          {/* ✅ Booking warning if clinicId missing */}
          {!clinicId && (
            <div className="mt-10 inline-flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-red-700">
                Booking disabled: clinic id missing in doctor profile (backend must send tenantId).
              </span>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 relative aspect-[4/5] overflow-hidden rounded-sm bg-[#2D302D]/5 shadow-2xl">
          <img
            ref={imageRef}
            src={
              doctor.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                safeName
              )}&background=8DAA9D&color=fff&size=800`
            }
            alt={safeName}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content px-6 lg:px-16 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-7 space-y-24 lg:space-y-32">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-[#2D302D]/5 py-12">
            <StatBox label="Faculty Specialty" value={doctor.specialization || "—"} />
            <StatBox label="Clinical Tenure" value={`${doctor.experience || 0} Years`} />
            <StatBox label="Clinic" value={clinicName || doctor.tenantId?.name || "Global Network"} />
          </div>

          {/* Philosophy Section */}
          <section className="fade-up space-y-8">
            <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#8DAA9D]">
              Clinical Philosophy
            </h2>
            <div className="text-xl lg:text-2xl text-[#2D302D]/70 font-light leading-snug space-y-8">
              <p className="border-l-2 border-[#8DAA9D]/20 pl-8">
                Dr. {safeName.split(" ").pop()} integrates advanced{" "}
                {doctor.specialization || "clinical"} protocols with a commitment to
                long-term resilience and technical precision.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 pt-4">
                <div className="p-8 bg-white border border-[#2D302D]/5 flex flex-col gap-4 hover:border-[#8DAA9D]/30 transition-colors">
                  <Award size={20} className="text-[#8DAA9D]" />
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                    Distinction
                  </span>
                  <span className="text-sm font-bold">
                    Board of {doctor.specialization || "Medicine"} Excellence
                  </span>
                </div>
                <div className="p-8 bg-white border border-[#2D302D]/5 flex flex-col gap-4 hover:border-[#8DAA9D]/30 transition-colors">
                  <Shield size={20} className="text-[#8DAA9D]" />
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">
                    Validation
                  </span>
                  <span className="text-sm font-bold">
                    Verified Medical Faculty Member
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="fade-up pt-10">
            <div className="relative p-10 lg:p-16 bg-[#2D302D] text-[#FAF9F6] overflow-hidden">
              <Quote
                className="absolute top-8 left-8 opacity-5 text-[#8DAA9D]"
                size={120}
                strokeWidth={1}
              />
              <p className="relative z-10 text-xl lg:text-2xl font-light italic leading-relaxed mb-10">
                "The protocol designed for my recovery was as precise as it was supportive.
                A total shift in how I view medical care."
              </p>
              <div className="flex items-center gap-6">
                <div className="w-12 h-px bg-[#8DAA9D]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8DAA9D]">
                  Patient Registry // Verified Review
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Booking Card */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-12 lg:top-24">
            <div className="bg-[#2D302D] text-[#FAF9F6] p-8 lg:p-12 shadow-2xl space-y-10">
              <div className="flex justify-between items-start border-b border-[#FAF9F6]/10 pb-8">
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.5em] text-[#8DAA9D] font-bold mb-3">
                    Availability Status
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-light tracking-tighter uppercase">
                    Protocol Entry
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full border border-[#FAF9F6]/10 flex items-center justify-center">
                  <Clock size={16} className="text-[#8DAA9D]" />
                </div>
              </div>

              <div className="space-y-4">
                {appointmentOptions.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-5 border transition-all cursor-pointer flex justify-between items-center group ${
                      opt.active
                        ? "border-[#8DAA9D] bg-[#8DAA9D]/10"
                        : "border-[#FAF9F6]/10 hover:border-[#FAF9F6]/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={opt.active ? "text-[#8DAA9D]" : "opacity-30"}>
                        {opt.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {opt.type}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono ${
                        opt.active ? "text-[#8DAA9D]" : "opacity-30"
                      }`}
                    >
                      {opt.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* ✅ BOOK APPOINTMENT (NO SILENT DISABLE) */}
              <button
                onClick={() => {
                  if (!clinicId) {
                    alert(
                      "ClinicId missing from doctor profile.\n\nFix backend: populate tenantId OR return tenantId as string."
                    );
                    return;
                  }
                  navigate(`/appointment/${clinicId}`, { state: { clinicId, doctorId } });
                }}
                className="w-full py-6 bg-[#8DAA9D] text-[#FAF9F6] text-[10px] uppercase tracking-[0.5em] font-bold 
                           hover:bg-[#FAF9F6] hover:text-[#2D302D] transition-all duration-500 flex items-center 
                           justify-center gap-4 group"
              >
                Confirm Entry
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-2 transition-transform duration-300"
                />
              </button>

              <div className="flex items-center justify-center gap-3 opacity-20">
                <Shield size={12} />
                <span className="text-[8px] lg:text-[9px] uppercase tracking-[0.4em] font-bold">
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
