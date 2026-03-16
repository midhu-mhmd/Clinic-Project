import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import axios from "axios";
import gsap from "gsap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Stethoscope,
  Loader2,
  MapPin,
  Video,
  Calendar,
  Clock,
  User,
} from "lucide-react";

import { API_URL as API_BASE } from "../utils/apiConfig.js";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
const validatePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const normalizeId = (x) => (x?._id || x?.id || "").toString();
const safeStr = (v) => String(v ?? "").trim();

const formatTo12h = (time24) => {
  const [hh, mm] = time24.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
};

const AppointmentPage = () => {
  const { id: urlClinicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // --- UI STATE ---
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState({
    clinics: true,
    doctors: false,
    submit: false,
  });
  const [error, setError] = useState("");

  // Inline validation errors
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // --- PATIENT FORM ---
  const [patient, setPatient] = useState({ name: "", email: "", phone: "", notes: "" });

  // --- DATA STATE ---
  const [data, setData] = useState({ clinics: [], doctors: [] });
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [selection, setSelection] = useState({
    clinic: null,
    doctor: location.state?.doctor || null,
    consultationType: null, // "in-clinic" | "video"
    date: null,
    slot: null,
  });

  // --- CONSTANTS ---
  const timeSlots = useMemo(() => ["09:00", "10:30", "11:05","11:10", "11:20","11:30","11:40","11:50","12:00","12:10","12:20","12:30","12:40","12:50","13:00", "14:30", "16:00", "16:30", "16:40", "21:20", "23:15", "23:20", "23:25", "23:30", "23:40", "23:50", "00:00", "00:10", "00:30", "00:40", "00:50", "01:20", "01:30", "01:40", "01:50", "02:00", "02:10", "02:20", "02:30", "02:40", "03:10", "03:20", "03:30"], []);
  const [bookedSlots, setBookedSlots] = useState([]);

  const consultationTypes = useMemo(() => [
    {
      id: "in-clinic",
      label: "In-Person Visit",
      desc: "Visit the clinic for a face-to-face consultation with your doctor",
      icon: <MapPin size={20} />,
    },
    {
      id: "video",
      label: "Telehealth Visit",
      desc: "Connect with your doctor via a secure, HIPAA-compliant video call",
      icon: <Video size={20} />,
    },
  ], []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        fullDate: d.toISOString().split("T")[0], // YYYY-MM-DD
        dayName: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
        dayNumber: d.getDate(),
        monthName: d.toLocaleString("default", { month: "short" }),
      };
    });
  }, []);

  /* ----------------------- 1) Fetch Clinics (Public) ----------------------- */
  useEffect(() => {
    const controller = new AbortController();

    const fetchClinics = async () => {
      try {
        setIsLoading((p) => ({ ...p, clinics: true }));
        setError("");

        const { data: res } = await axios.get(`${API_BASE}/tenants/all`, {
          signal: controller.signal,
        });

        if (res?.success) {
          setData((prev) => ({ ...prev, clinics: res.data || [] }));

          if (urlClinicId) {
            const found = (res.data || []).find((c) => normalizeId(c) === String(urlClinicId));
            if (found) {
              setSelection((prev) => ({ ...prev, clinic: found }));
              // step advance will happen when doctors load
            }
          }
        } else {
          setError(res?.message || "Failed to load clinics.");
        }
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError("System registry offline. Please try again later.");
      } finally {
        setIsLoading((p) => ({ ...p, clinics: false }));
      }
    };

    fetchClinics();
    return () => controller.abort();
  }, [urlClinicId]);

  /* ----------------------- 2) Fetch Doctors (Public) ----------------------- */
  useEffect(() => {
    const clinicId = normalizeId(selection.clinic);
    if (!clinicId) return;

    const controller = new AbortController();

    const fetchDoctors = async () => {
      setIsLoading((p) => ({ ...p, doctors: true }));
      setError("");

      try {
        const { data: res } = await axios.get(
          `${API_BASE}/tenants/doctors/public/${clinicId}`,
          { signal: controller.signal }
        );

        if (res?.success) {
          const docs = res.data || [];
          setData((prev) => ({ ...prev, doctors: docs }));

          // If we came from a doctor profile:
          const incomingDoctorId = location.state?.doctorId;
          if (incomingDoctorId) {
            const foundDoc = docs.find((d) => normalizeId(d) === String(incomingDoctorId));
            if (foundDoc) {
              setSelection((prev) => ({ ...prev, doctor: foundDoc }));
              setStep(3);
              return;
            }
          }

          // default flow
          setStep((prevStep) => (prevStep === 1 ? 2 : prevStep));
        } else {
          setError(res?.message || "Unable to synchronize faculty data.");
        }
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setError("Unable to synchronize faculty data.");
      } finally {
        setIsLoading((p) => ({ ...p, doctors: false }));
      }
    };

    fetchDoctors();
    return () => controller.abort();
  }, [selection.clinic, location.state?.doctorId]);

  /* ----------------------- 3) Fetch Booked Slots ----------------------- */
  useEffect(() => {
    const doctorId = normalizeId(selection.doctor);
    const dateStr = selection.date?.fullDate;
    if (!doctorId || !dateStr) {
      setBookedSlots([]);
      return;
    }

    const controller = new AbortController();

    const fetchBooked = async () => {
      try {
        const { data: res } = await axios.get(
          `${API_BASE}/appointments/booked-slots`,
          { params: { doctorId, date: dateStr }, signal: controller.signal }
        );
        if (res?.success) {
          setBookedSlots(res.data || []);
        }
      } catch (err) {
        if (err?.name === "CanceledError") return;
        setBookedSlots([]);
      }
    };

    fetchBooked();
    return () => controller.abort();
  }, [selection.doctor, selection.date]);

  const availableSlots = useMemo(
    () => timeSlots.filter((t) => !bookedSlots.includes(t)),
    [timeSlots, bookedSlots]
  );

  /* ----------------------- 4) Derived Fee ----------------------- */
  const totalFee = useMemo(() => {
    const d = selection.doctor;
    const fee = Number(d?.consultationFee ?? d?.fee ?? 0);
    const base = Number.isFinite(fee) ? fee : 0;
    // Video consultation at 60% of in-clinic fee
    return selection.consultationType === "video" ? Math.round(base * 0.6) : base;
  }, [selection.doctor, selection.consultationType]);

  /* ----------------------- 4) GSAP Step Animation ----------------------- */
  useLayoutEffect(() => {
    gsap.fromTo(
      ".step-anim",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [step]);

  /* ----------------------- 5) Validation ----------------------- */
  const validateStep4 = useCallback(() => {
    const name = safeStr(patient.name);
    const email = safeStr(patient.email);
    const phone = safeStr(patient.phone);

    const next = { name: "", email: "", phone: "" };

    if (!name) next.name = "Name required";
    if (!validateEmail(email)) next.email = "Invalid email";
    if (!validatePhone(phone)) next.phone = "Invalid phone";

    setFieldErrors(next);

    return !next.name && !next.email && !next.phone;
  }, [patient.name, patient.email, patient.phone]);

  const canProceed = useMemo(() => {
    if (step === 1) return Boolean(selection.clinic);
    if (step === 2) return Boolean(selection.doctor);
    if (step === 3) return Boolean(selection.consultationType);
    if (step === 4) return Boolean(selection.date && selection.slot);
    if (step === 5) return Boolean(patient.name) && validateEmail(patient.email) && validatePhone(patient.phone);
    return false;
  }, [step, selection, patient]);

  /* ----------------------- 6) Submit ----------------------- */
  const handleSubmission = useCallback(async () => {
    // validate client-side
    if (!validateStep4()) return;

    const clinicId = normalizeId(selection.clinic);
    const doctorId = normalizeId(selection.doctor);

    if (!clinicId || !doctorId || !selection?.date?.fullDate || !selection?.slot || !selection?.consultationType) {
      setError("Selection incomplete. Please verify clinic/doctor/type/date/slot.");
      return;
    }

    setIsLoading((p) => ({ ...p, submit: true }));
    setError("");

    // NOTE:
    // You are using PATIENT token currently, but backend is blocking due to subscription gate.
    // This page will still send token if present.
    const token = localStorage.getItem("token")?.replace(/['"]+/g, "");

    try {
      const payload = {
        tenantId: clinicId,
        doctorId,
        date: selection.date.fullDate,
        slot: selection.slot,
        consultationType: selection.consultationType,

        // patient snapshot
        patientName: safeStr(patient.name),
        patientEmail: safeStr(patient.email),
        patientContact: safeStr(patient.phone),
        notes: safeStr(patient.notes),

        // fee
        consultationFee: totalFee,
        fee: totalFee, // backward compat
      };

      const { data: res } = await axios.post(`${API_BASE}/appointments`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res?.success) {
        setCreatedAppointment(res.data || null);
        setStep(6);
        return;
      }

      setError(res?.message || "Protocol synchronization failed.");
    } catch (err) {
      const status = err?.response?.status;

      // 🔥 IMPORTANT UX: handle your exact 403 error
      if (status === 403) {
        const msg =
          err?.response?.data?.message ||
          "Access denied. Please login again.";
        setError(msg);

        // OPTIONAL: redirect if you want
        // navigate("/login");
        return;
      }

      setError(err?.response?.data?.message || err.message || "Protocol synchronization failed.");
    } finally {
      setIsLoading((p) => ({ ...p, submit: false }));
    }
  }, [selection, patient, totalFee, validateStep4]);

  if (isLoading.clinics) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0FDFA]">
        <Loader2 className="animate-spin text-[#0F766E]" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#F0FDFA] text-[#1E293B] min-h-screen selection:bg-[#0F766E] selection:text-white pt-16 md:pt-20"
    >
      {/* Step Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#0F766E]/10 px-4 md:px-8 lg:px-16 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="flex gap-1.5 md:gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`w-8 md:w-10 h-1 md:h-1.5 rounded-full transition-all duration-500 ${step >= s ? "bg-[#0F766E]" : "bg-[#0F766E]/10"
                }`}
            />
          ))}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-[10px] md:text-xs font-semibold tracking-wide uppercase flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors"
        >
          <ArrowLeft size={14} /> Cancel Booking
        </button>
      </div>

      <main className="pb-16 md:pb-24 px-4 md:px-8 lg:px-16 pt-8 md:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-7 step-anim">
          {/* STEP 1 */}
          {step === 1 && (
            <section className="space-y-8 md:space-y-10">
              <div>
                <p className="text-[10px] md:text-xs font-semibold tracking-wide text-[#0F766E] uppercase mb-1.5 md:mb-2">Step 1 of 5</p>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E293B]">
                  Choose Your <span className="italic font-serif text-[#0F766E]">Clinic</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1.5 md:mt-2">Select the healthcare facility where you'd like to be seen.</p>
              </div>

              <div className="grid gap-3">
                {data.clinics.map((c) => {
                  const active = normalizeId(selection.clinic) === normalizeId(c);
                  return (
                    <button
                      key={normalizeId(c)}
                      onClick={() =>
                        setSelection((prev) => ({ ...prev, clinic: c, doctor: null }))
                      }
                      className={`p-5 rounded-xl border-2 flex justify-between items-center transition-all ${active
                          ? "border-[#0F766E] bg-[#0F766E]/5 shadow-sm"
                          : "border-slate-200 hover:border-[#0F766E]/30"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-[#0F766E]/10' : 'bg-slate-100'}`}>
                          <Building2 size={18} className={active ? 'text-[#0F766E]' : 'text-slate-400'} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sm text-[#1E293B]">
                            {c.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {c.location || c.address || "—"}
                          </p>
                        </div>
                      </div>
                      {active && <CheckCircle2 size={20} className="text-[#0F766E]" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <section className="space-y-8 md:space-y-10">
              <div>
                <p className="text-[10px] md:text-xs font-semibold tracking-wide text-[#0F766E] uppercase mb-1.5 md:mb-2">Step 2 of 5</p>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E293B]">
                  Select Your <span className="italic font-serif text-[#0F766E]">Doctor</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1.5 md:mt-2">Choose a physician based on their specialty and availability.</p>
              </div>

              {isLoading.doctors ? (
                <div className="flex items-center gap-3 text-slate-400"><Loader2 className="animate-spin" size={20} /> <span className="text-sm">Loading physicians...</span></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {data.doctors.map((d) => {
                    const active = normalizeId(selection.doctor) === normalizeId(d);
                    return (
                      <button
                        key={normalizeId(d)}
                        onClick={() => setSelection((prev) => ({ ...prev, doctor: d }))}
                        className={`p-5 rounded-xl border-2 text-left transition-all ${active
                            ? "border-[#0F766E] bg-[#0F766E]/5 shadow-sm"
                            : "border-slate-200 hover:border-[#0F766E]/30"
                          }`}
                      >
                        <img
                          src={d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Doctor")}&background=0F766E&color=fff`}
                          className="w-14 h-14 rounded-full mb-4 object-cover"
                          alt={d.name || "Doctor"}
                        />
                        <p className="font-semibold text-sm text-[#1E293B]">{d.name}</p>
                        <p className="text-xs text-[#0F766E] font-medium mt-0.5">
                          {d.specialization || d.specialty || "General Practice"}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {d.experience || 0} years experience
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Consultation Fee: ₹{Number(d.consultationFee ?? d.fee ?? 0) || 0}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* STEP 3 — Consultation Type */}
          {step === 3 && (
            <section className="space-y-8 md:space-y-10">
              <div>
                <p className="text-[10px] md:text-xs font-semibold tracking-wide text-[#0F766E] uppercase mb-1.5 md:mb-2">Step 3 of 5</p>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E293B]">
                  Visit <span className="italic font-serif text-[#0F766E]">Type</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1.5 md:mt-2">How would you like to see your doctor?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {consultationTypes.map((ct) => {
                  const active = selection.consultationType === ct.id;
                  return (
                    <button
                      key={ct.id}
                      onClick={() =>
                        setSelection((prev) => ({ ...prev, consultationType: ct.id }))
                      }
                      className={`p-7 rounded-xl border-2 text-left transition-all flex flex-col gap-4 ${
                        active
                          ? "border-[#0F766E] bg-[#0F766E]/5 shadow-sm"
                          : "border-slate-200 hover:border-[#0F766E]/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'bg-slate-100 text-slate-400'}`}>
                        {ct.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1E293B]">{ct.label}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {ct.desc}
                        </p>
                      </div>
                      {active && <CheckCircle2 size={20} className="text-[#0F766E]" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 4 — Date & Slot */}
          {step === 4 && (
            <section className="space-y-8 md:space-y-10">
              <div>
                <p className="text-[10px] md:text-xs font-semibold tracking-wide text-[#0F766E] uppercase mb-1.5 md:mb-2">Step 4 of 5</p>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E293B]">
                  Preferred <span className="italic font-serif text-[#0F766E]">Date & Time</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1.5 md:mt-2">Pick a date and available time slot for your appointment.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Calendar size={14} /> Select Date</p>
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 md:grid md:grid-cols-7 md:gap-2 pb-2 md:pb-0 scrollbar-hide">
                  {weekDays.map((d) => {
                    const active = selection.date?.fullDate === d.fullDate;
                    return (
                      <button
                        key={d.fullDate}
                        onClick={() => setSelection((prev) => ({ ...prev, date: d, slot: null }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all flex-none snap-center min-w-[72px] md:min-w-0 ${active
                            ? "bg-[#0F766E] text-white border-[#0F766E] shadow-sm"
                            : "border-slate-200 hover:border-[#0F766E]/30"
                          }`}
                      >
                        <span className={`text-[10px] block uppercase font-medium ${active ? 'text-white/70' : 'text-slate-400'}`}>
                          {d.dayName}
                        </span>
                        <span className="text-lg font-medium">{d.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Clock size={14} /> Available Time Slots</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.length === 0 ? (
                    <p className="col-span-3 text-sm text-slate-400 py-4">
                      No available slots for this date. Please select another day.
                    </p>
                  ) : (
                    availableSlots.map((t) => {
                      const active = selection.slot === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelection((prev) => ({ ...prev, slot: t }))}
                          className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                            active
                              ? "bg-[#0F766E] text-white border-[#0F766E] shadow-sm"
                              : "border-slate-200 hover:border-[#0F766E]/30"
                          }`}
                        >
                          {formatTo12h(t)}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          )}

          {/* STEP 5 — Patient Info */}
          {step === 5 && (
            <section className="space-y-8 md:space-y-10">
              <div>
                <p className="text-[10px] md:text-xs font-semibold tracking-wide text-[#0F766E] uppercase mb-1.5 md:mb-2">Step 5 of 5</p>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#1E293B]">
                  Patient <span className="italic font-serif text-[#0F766E]">Information</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1.5 md:mt-2">Please provide your details so the clinic can prepare for your visit.</p>
              </div>

              <div className="grid gap-4 md:gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                  <input
                    placeholder="Enter your full name"
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#0F766E] transition-colors text-sm"
                    value={patient.name}
                    onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))}
                    onBlur={validateStep4}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-500 mt-1.5">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email Address *</label>
                  <input
                    placeholder="your.email@example.com"
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#0F766E] transition-colors text-sm"
                    value={patient.email}
                    onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))}
                    onBlur={validateStep4}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1.5">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Phone Number *</label>
                  <input
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#0F766E] transition-colors text-sm"
                    value={patient.phone}
                    onChange={(e) => setPatient((p) => ({ ...p, phone: e.target.value }))}
                    onBlur={validateStep4}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1.5">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Symptoms / Reason for Visit</label>
                  <textarea
                    placeholder="Briefly describe your symptoms or reason for this appointment..."
                    className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-[#0F766E] transition-colors h-32 text-sm resize-none"
                    value={patient.notes}
                    onChange={(e) => setPatient((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
            </section>
          )}

          {/* STEP 6 — SUCCESS */}
          {step === 6 && (
            <section className="text-center py-16 md:py-20 space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto text-[#0F766E]">
                <CheckCircle2 size={32} className="md:w-10 md:h-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-light text-[#1E293B]">Appointment Confirmed</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {selection.consultationType === "video"
                  ? "Your telehealth consultation has been scheduled. You will receive a reminder with the meeting link before your appointment."
                  : "Your in-person appointment has been confirmed. Please arrive 10 minutes early with any relevant medical records."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-xl bg-[#1E293B] text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide hover:bg-[#0F766E] transition-colors"
                >
                  Return Home
                </button>
                {selection.consultationType === "video" && createdAppointment?.meetingLink && (
                  <button
                    onClick={() => {
                      const token = createdAppointment.meetingLink.split("/consultation/")[1];
                      if (token) navigate(`/consultation/${token}`);
                    }}
                    className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-xl bg-[#0F766E] text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-2 md:gap-3 hover:bg-[#0F766E]/80 transition-colors"
                  >
                    <Video size={14} />
                    Join Video Consultation
                  </button>
                )}
              </div>
            </section>
          )}

          {step < 6 && (
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center gap-4 md:gap-6">
              <button
                disabled={!canProceed || isLoading.submit}
                onClick={() => (step === 5 ? handleSubmission() : setStep((s) => s + 1))}
                className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 rounded-xl bg-[#0F766E] text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide hover:bg-[#0F766E]/90 transition-all disabled:opacity-30 flex justify-center items-center gap-2 shadow-sm"
              >
                {isLoading.submit ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : step === 5 ? (
                  "Confirm Appointment"
                ) : (
                  "Continue"
                )}
                <ChevronRight size={14} />
              </button>

              {error && (
                <p className="text-xs text-red-500 font-medium">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR — Appointment Summary */}
        <aside className="lg:col-span-5 h-fit sticky top-24 lg:top-40 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm order-first lg:order-last mb-8 lg:mb-0">
          <p className="text-[10px] md:text-xs font-semibold text-[#0F766E] uppercase tracking-wide">Appointment Summary</p>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0F766E]/5 rounded-xl flex items-center justify-center overflow-hidden">
              {selection.doctor ? (
                <img
                  src={
                    selection.doctor.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selection.doctor.name || "Doctor")}&background=0F766E&color=fff`
                  }
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <Stethoscope size={22} className="text-[#0F766E]/30" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Attending Physician
              </p>
              <p className="text-sm font-semibold text-[#1E293B]">
                {selection.doctor?.name || "Not selected"}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Clinic</span>
              <span className="font-medium text-[#1E293B]">{selection.clinic?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Visit Type</span>
              <span className="font-medium text-[#1E293B]">
                {selection.consultationType === "video"
                  ? "Telehealth"
                  : selection.consultationType === "in-clinic"
                  ? "In-Person"
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time</span>
              <span className="font-medium text-[#1E293B]">{selection.slot ? formatTo12h(selection.slot) : "—"}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-4">
              <span className="text-slate-400 font-semibold">Consultation Fee</span>
              <span className="text-xl font-semibold text-[#0F766E]">₹{totalFee}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AppointmentPage;
