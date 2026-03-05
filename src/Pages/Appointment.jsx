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
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

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
  const timeSlots = useMemo(() => ["09:00", "10:30", "13:00", "14:30", "16:00"], []);
  const [bookedSlots, setBookedSlots] = useState([]);

  const consultationTypes = useMemo(() => [
    {
      id: "in-clinic",
      label: "In-Clinic Visit",
      desc: "Visit the facility in person for your consultation",
      icon: <MapPin size={20} />,
    },
    {
      id: "video",
      label: "Video Consultation",
      desc: "Connect via secure video call from anywhere",
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
      <div className="h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#8DAA9D]" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF9F6] text-[#2D302D] min-h-screen font-sans selection:bg-[#8DAA9D] selection:text-white pt-20"
    >
      {/* Step Progress Bar */}
      <div className="bg-[#FAF9F6] border-b border-[#2D302D]/5 px-8 lg:px-16 py-6 flex justify-between items-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`w-8 h-1 transition-all duration-500 ${step >= s ? "bg-[#8DAA9D]" : "bg-[#2D302D]/10"
                }`}
            />
          ))}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 hover:text-red-500 transition-colors"
        >
          <ArrowLeft size={14} /> Abandon Entry
        </button>
      </div>

      <main className="pb-24 px-8 lg:px-16 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 step-anim">
          {/* STEP 1 */}
          {step === 1 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">
                Select Facility
              </h2>

              <div className="grid gap-4">
                {data.clinics.map((c) => {
                  const active = normalizeId(selection.clinic) === normalizeId(c);
                  return (
                    <button
                      key={normalizeId(c)}
                      onClick={() =>
                        setSelection((prev) => ({ ...prev, clinic: c, doctor: null }))
                      }
                      className={`p-6 border flex justify-between items-center transition-all ${active
                          ? "border-[#8DAA9D] bg-[#8DAA9D]/5"
                          : "border-[#2D302D]/10"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <Building2 className="text-[#8DAA9D]" />
                        <div className="text-left">
                          <p className="font-bold uppercase text-sm tracking-tight">
                            {c.name}
                          </p>
                          <p className="text-[10px] opacity-50 uppercase tracking-widest">
                            {c.location || c.address || "—"}
                          </p>
                        </div>
                      </div>
                      {active && <CheckCircle2 size={18} className="text-[#8DAA9D]" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">
                Select Faculty
              </h2>

              {isLoading.doctors ? (
                <Loader2 className="animate-spin" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.doctors.map((d) => {
                    const active = normalizeId(selection.doctor) === normalizeId(d);
                    return (
                      <button
                        key={normalizeId(d)}
                        onClick={() => setSelection((prev) => ({ ...prev, doctor: d }))}
                        className={`p-6 border text-left transition-all ${active
                            ? "border-[#8DAA9D] bg-[#8DAA9D]/5"
                            : "border-[#2D302D]/10"
                          }`}
                      >
                        <img
                          src={d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Doctor")}`}
                          className="w-12 h-12 rounded-full mb-4 grayscale"
                          alt={d.name || "Doctor"}
                        />
                        <p className="font-bold uppercase text-sm">{d.name}</p>
                        <p className="text-[10px] text-[#8DAA9D] font-bold uppercase">
                          {d.specialization || d.specialty || "—"}
                        </p>
                        <p className="text-[10px] opacity-60 uppercase tracking-widest mt-2">
                          Experience: {d.experience || 0} Years
                        </p>
                        <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">
                          Fee: ₹{Number(d.consultationFee ?? d.fee ?? 0) || 0}
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
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">
                Consultation Type
              </h2>
              <p className="text-sm opacity-50 uppercase tracking-widest">
                Choose how you'd like to consult with your doctor
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultationTypes.map((ct) => {
                  const active = selection.consultationType === ct.id;
                  return (
                    <button
                      key={ct.id}
                      onClick={() =>
                        setSelection((prev) => ({ ...prev, consultationType: ct.id }))
                      }
                      className={`p-8 border text-left transition-all flex flex-col gap-4 ${
                        active
                          ? "border-[#8DAA9D] bg-[#8DAA9D]/5"
                          : "border-[#2D302D]/10 hover:border-[#2D302D]/30"
                      }`}
                    >
                      <div className={`${active ? "text-[#8DAA9D]" : "opacity-40"}`}>
                        {ct.icon}
                      </div>
                      <div>
                        <p className="font-bold uppercase text-sm tracking-tight">{ct.label}</p>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest mt-1">
                          {ct.desc}
                        </p>
                      </div>
                      {active && <CheckCircle2 size={18} className="text-[#8DAA9D]" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 4 — Date & Slot */}
          {step === 4 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">
                Temporal Slot
              </h2>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((d) => {
                  const active = selection.date?.fullDate === d.fullDate;
                  return (
                    <button
                      key={d.fullDate}
                      onClick={() => setSelection((prev) => ({ ...prev, date: d, slot: null }))}
                      className={`p-4 border text-center transition-all ${active
                          ? "bg-[#8DAA9D] text-white"
                          : "border-[#2D302D]/10"
                        }`}
                    >
                      <span className="text-[10px] block opacity-50 uppercase">
                        {d.dayName}
                      </span>
                      <span className="text-lg">{d.dayNumber}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {availableSlots.length === 0 ? (
                  <p className="col-span-3 text-sm opacity-50 uppercase tracking-widest py-4">
                    No available slots for this date
                  </p>
                ) : (
                  availableSlots.map((t) => {
                    const active = selection.slot === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setSelection((prev) => ({ ...prev, slot: t }))}
                        className={`p-4 border text-sm transition-all ${
                          active
                            ? "bg-[#2D302D] text-white"
                            : "border-[#2D302D]/10"
                        }`}
                      >
                        {formatTo12h(t)}
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* STEP 5 — Patient Info */}
          {step === 5 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">
                Patient Dossier
              </h2>

              <div className="grid gap-6">
                <div>
                  <input
                    placeholder="Legal Full Name"
                    className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 outline-none focus:border-[#8DAA9D]"
                    value={patient.name}
                    onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))}
                    onBlur={validateStep4}
                  />
                  {fieldErrors.name && (
                    <p className="text-[10px] uppercase tracking-widest text-red-500 mt-2">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Email Address"
                    className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 outline-none focus:border-[#8DAA9D]"
                    value={patient.email}
                    onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))}
                    onBlur={validateStep4}
                  />
                  {fieldErrors.email && (
                    <p className="text-[10px] uppercase tracking-widest text-red-500 mt-2">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    placeholder="Phone / Contact"
                    className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 outline-none focus:border-[#8DAA9D]"
                    value={patient.phone}
                    onChange={(e) => setPatient((p) => ({ ...p, phone: e.target.value }))}
                    onBlur={validateStep4}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[10px] uppercase tracking-widest text-red-500 mt-2">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <textarea
                  placeholder="Clinical Notes"
                  className="w-full bg-transparent border border-[#2D302D]/10 p-4 outline-none focus:border-[#8DAA9D] h-32"
                  value={patient.notes}
                  onChange={(e) => setPatient((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </section>
          )}

          {/* STEP 6 — SUCCESS */}
          {step === 6 && (
            <section className="text-center py-20 space-y-6">
              <div className="w-20 h-20 bg-[#8DAA9D]/10 rounded-full flex items-center justify-center mx-auto text-[#8DAA9D]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-4xl font-light uppercase">Protocol Validated</h2>
              <p className="text-sm opacity-50 uppercase tracking-widest">
                {selection.consultationType === "video"
                  ? "Your video consultation has been booked. Join the call below."
                  : "Your in-clinic appointment has been confirmed."}
              </p>

              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-4 bg-[#2D302D] text-white text-[10px] uppercase tracking-widest"
                >
                  Return Home
                </button>
                {selection.consultationType === "video" && createdAppointment?.meetingLink && (
                  <button
                    onClick={() => {
                      const token = createdAppointment.meetingLink.split("/consultation/")[1];
                      if (token) navigate(`/consultation/${token}`);
                    }}
                    className="px-8 py-4 bg-[#8DAA9D] text-white text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#8DAA9D]/80 transition-colors"
                  >
                    <Video size={14} />
                    Join Video Call
                  </button>
                )}
              </div>
            </section>
          )}

          {step < 6 && (
            <div className="mt-12 flex items-center gap-6">
              <button
                disabled={!canProceed || isLoading.submit}
                onClick={() => (step === 5 ? handleSubmission() : setStep((s) => s + 1))}
                className="px-12 py-6 bg-[#2D302D] text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#8DAA9D] transition-all disabled:opacity-30 flex items-center gap-2"
              >
                {isLoading.submit ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : step === 5 ? (
                  "Initialize Protocol"
                ) : (
                  "Proceed"
                )}
                <ChevronRight size={14} />
              </button>

              {error && (
                <p className="text-[10px] text-red-500 uppercase tracking-widest">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-5 h-fit sticky top-40 bg-white border border-[#2D302D]/5 p-10 space-y-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {selection.doctor ? (
                <img
                  src={
                    selection.doctor.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selection.doctor.name || "Doctor")}`
                  }
                  className="w-full h-full object-cover grayscale"
                  alt=""
                />
              ) : (
                <Stethoscope className="opacity-20" />
              )}
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#8DAA9D] uppercase tracking-widest">
                Assigned Faculty
              </p>
              <p className="text-sm font-bold uppercase">
                {selection.doctor?.name || "Pending..."}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6 text-[11px] uppercase tracking-widest">
            <div className="flex justify-between">
              <span className="opacity-40">Facility</span>
              <span>{selection.clinic?.name || "---"}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-40">Type</span>
              <span>
                {selection.consultationType === "video"
                  ? "Video Call"
                  : selection.consultationType === "in-clinic"
                  ? "In-Clinic"
                  : "---"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-40">Temporal Slot</span>
              <span>{selection.slot ? formatTo12h(selection.slot) : "---"}</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="opacity-40 font-bold">Total Fee</span>
              <span className="text-lg">₹{totalFee}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AppointmentPage;
