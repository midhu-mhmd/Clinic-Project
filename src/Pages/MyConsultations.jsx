import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  Video,
  ArrowLeft,
  Loader2,
  Clock,
  Calendar,
  User,
  Building2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

const API_BASE = "https://sovereigns.site";
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token") || "";
  const clean = t.replace(/['"]+/g, "").trim();
  if (clean && clean !== "null" && clean !== "undefined") {
    cfg.headers.Authorization = `Bearer ${clean}`;
  }
  return cfg;
});

const STATUS_MAP = {
  WAITING: { color: "text-amber-500", bg: "bg-amber-50", label: "Waiting" },
  IN_PROGRESS: { color: "text-blue-600", bg: "bg-blue-50", label: "In Progress" },
  COMPLETED: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Completed" },
  MISSED: { color: "text-red-500", bg: "bg-red-50", label: "Missed" },
  CANCELLED: { color: "text-[#1E293B]/40", bg: "bg-[#1E293B]/5", label: "Cancelled" },
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDuration = (seconds) => {
  if (!seconds) return "–";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const MyConsultations = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const { data } = await api.get("/api/video-consultations/my");
        if (data.success) {
          setConsultations(data.consultations || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".consult-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F0FDFA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#0F766E] animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#1E293B]/40 font-bold">
            Loading Consultations...
          </p>
        </div>
      </div>
    );
  }

  // ── Detail Modal ──
  if (selectedSession) {
    const s = selectedSession;
    const st = STATUS_MAP[s.status] || STATUS_MAP.WAITING;
    return (
      <div className="min-h-screen bg-[#F0FDFA] text-[#1E293B] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedSession(null)}
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-all mb-10"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Consultations
          </button>

          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-[#1E293B]/5 pb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full ${st.bg} ${st.color}`}>
                  {st.label}
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#0F766E]">
                  {s.roomId?.slice(0, 12)}...
                </span>
              </div>
              <h1 className="text-3xl font-light tracking-tight uppercase">
                Video <span className="italic font-serif text-[#0F766E]">Consultation</span>
              </h1>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#1E293B]/5 p-6">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/30 block mb-2">Doctor</span>
                <p className="text-sm font-medium">{s.doctorId?.name || "–"}</p>
                <p className="text-[10px] text-[#0F766E] mt-1">{s.doctorId?.specialization || ""}</p>
              </div>
              <div className="bg-white border border-[#1E293B]/5 p-6">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/30 block mb-2">Scheduled</span>
                <p className="text-sm font-medium">{formatDate(s.appointmentId?.dateTime)}</p>
              </div>
              <div className="bg-white border border-[#1E293B]/5 p-6">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/30 block mb-2">Duration</span>
                <p className="text-sm font-medium">{formatDuration(s.duration)}</p>
              </div>
              <div className="bg-white border border-[#1E293B]/5 p-6">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/30 block mb-2">Fee</span>
                <p className="text-sm font-medium">₹{s.appointmentId?.consultationFee ?? "–"}</p>
              </div>
            </div>

            {/* Doctor Notes */}
            {s.doctorNotes && (
              <div className="bg-white border border-[#0F766E]/20 p-6">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#0F766E] mb-3 flex items-center gap-2">
                  <FileText size={12} /> Doctor Notes
                </span>
                <p className="text-sm text-[#1E293B]/70 leading-relaxed whitespace-pre-wrap">{s.doctorNotes}</p>
              </div>
            )}

            {/* Prescription */}
            {s.prescription && (
              <div className="bg-white border border-[#0F766E]/20 p-6">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#0F766E] mb-3 flex items-center gap-2">
                  <FileText size={12} /> Prescription
                </span>
                <p className="text-sm text-[#1E293B]/70 leading-relaxed whitespace-pre-wrap">{s.prescription}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Consultation List ──
  return (
    <div ref={containerRef} className="min-h-screen bg-[#F0FDFA] text-[#1E293B] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-all mb-6"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <h1 className="text-5xl font-light tracking-tighter uppercase leading-none">
              My <span className="italic font-serif text-[#0F766E]">Consultations</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#1E293B]/30 font-bold mt-3">
              {consultations.length} video sessions
            </p>
          </div>
        </div>

        {/* List */}
        {consultations.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#1E293B]/5 rounded-[40px]">
            <Video size={40} className="text-[#1E293B]/10 mb-4" />
            <h3 className="text-base font-light uppercase tracking-tight">No Consultations</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#1E293B]/30 font-bold mt-2">
              Book a video appointment to start your first consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => {
              const st = STATUS_MAP[c.status] || STATUS_MAP.WAITING;
              const canJoin = ["WAITING", "IN_PROGRESS"].includes(c.status);
              return (
                <div
                  key={c._id}
                  className="consult-card group bg-white border border-[#1E293B]/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#0F766E]/20 hover:shadow-lg transition-all duration-500 cursor-pointer"
                  onClick={() => setSelectedSession(c)}
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#0F766E]/10 flex items-center justify-center shrink-0">
                      <Video size={20} className="text-[#0F766E]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium">
                          {c.doctorId?.name || "Doctor"}
                        </span>
                        <span className={`text-[8px] uppercase tracking-[0.2em] font-bold px-2.5 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#0F766E]">{c.doctorId?.specialization}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] uppercase tracking-widest text-[#1E293B]/20 font-bold flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(c.appointmentId?.dateTime)}
                        </span>
                        {c.duration > 0 && (
                          <span className="text-[9px] uppercase tracking-widest text-[#1E293B]/20 font-bold flex items-center gap-1">
                            <Clock size={10} /> {formatDuration(c.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canJoin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/consultation/${c.roomId}`);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1E293B] text-white text-[9px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-[#0F766E] transition-all duration-500 shrink-0"
                    >
                      <Video size={12} /> Join Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyConsultations;
