import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from "react";
import axios from "axios";
import gsap from "gsap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight, ArrowLeft, CheckCircle2, Lock, Building2, Stethoscope, MapPin, Loader2,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

/** * INDUSTRY BEST PRACTICE: 
 * Move validation and normalization outside the component 
 * to prevent re-allocation on every render.
 */
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const AppointmentPage = () => {
  const { id: urlClinicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // --- UI STATE ---
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState({ clinics: true, doctors: false, submit: false });
  const [error, setError] = useState(null);

  // --- DATA STATE ---
  const [data, setData] = useState({ clinics: [], doctors: [] });
  const [selection, setSelection] = useState({
    clinic: null,
    doctor: location.state?.doctor || null,
    date: null,
    slot: null,
  });

  const [patient, setPatient] = useState({ name: "", email: "", phone: "", notes: "" });

  // --- CONSTANTS ---
  const timeSlots = useMemo(() => ["09:00", "10:30", "13:00", "14:30", "16:00"], []);
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        fullDate: d.toISOString().split("T")[0],
        dayName: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
        dayNumber: d.getDate(),
        monthName: d.toLocaleString("default", { month: "short" }),
      };
    });
  }, []);

  /* ----------------------- 1) Fetch Clinics (Public) ----------------------- */
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const { data: res } = await axios.get(`${API_BASE}/tenants/all`);
        if (res.success) {
          setData(prev => ({ ...prev, clinics: res.data }));
          
          // Auto-select clinic if ID is in URL
          if (urlClinicId) {
            const found = res.data.find(c => (c._id || c.id) === urlClinicId);
            if (found) setSelection(prev => ({ ...prev, clinic: found }));
          }
        }
      } catch (err) {
        setError("System registry offline. Please try again later.");
      } finally {
        setIsLoading(prev => ({ ...prev, clinics: false }));
      }
    };
    fetchClinics();
  }, [urlClinicId]);

  /* ----------------------- 2) Fetch Doctors (Public Route Fix) ----------------------- */
  useEffect(() => {
    const clinicId = selection.clinic?._id || selection.clinic?.id;
    if (!clinicId) return;

    const fetchDoctors = async () => {
      setIsLoading(prev => ({ ...prev, doctors: true }));
      try {
        // ✅ CHANGED TO PUBLIC ROUTE to avoid "Access Denied"
        const { data: res } = await axios.get(`${API_BASE}/tenants/doctors/public/${clinicId}`);
        if (res.success) {
          setData(prev => ({ ...prev, doctors: res.data }));
          
          // If we came from a specific doctor profile, auto-select them
          if (location.state?.doctorId) {
            const foundDoc = res.data.find(d => (d._id || d.id) === location.state.doctorId);
            if (foundDoc) {
              setSelection(prev => ({ ...prev, doctor: foundDoc }));
              setStep(3); // Skip to date selection
            } else if (step === 1) setStep(2);
          } else if (step === 1) setStep(2);
        }
      } catch (err) {
        setError("Unable to synchronize faculty data.");
      } finally {
        setIsLoading(prev => ({ ...prev, doctors: false }));
      }
    };
    fetchDoctors();
  }, [selection.clinic, location.state?.doctorId]);

  /* ----------------------- 3) Handlers ----------------------- */
  const handleSubmission = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, submit: true }));
    setError(null);

    const token = localStorage.getItem("token")?.replace(/['"]+/g, '');
    if (!token) {
      setError("Authentication required to finalize protocol.");
      setIsLoading(prev => ({ ...prev, submit: false }));
      return;
    }

    try {
      const payload = {
        tenantId: selection.clinic?._id || selection.clinic?.id,
        doctorId: selection.doctor?._id || selection.doctor?.id,
        date: selection.date.fullDate,
        slot: selection.slot,
        patientName: patient.name,
        patientEmail: patient.email,
        patientContact: patient.phone,
        notes: patient.notes,
        fee: selection.doctor?.fee || selection.doctor?.consultationFee
      };

      const { data: res } = await axios.post(`${API_BASE}/appointments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.success) setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || "Protocol synchronization failed.");
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  }, [selection, patient]);

  // GSAP Step Animation
  useLayoutEffect(() => {
    gsap.fromTo(".step-anim", 
      { opacity: 0, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [step]);

  const canProceed = useMemo(() => {
    if (step === 1) return !!selection.clinic;
    if (step === 2) return !!selection.doctor;
    if (step === 3) return !!selection.date && !!selection.slot;
    if (step === 4) return patient.name && validateEmail(patient.email) && validatePhone(patient.phone);
    return false;
  }, [step, selection, patient]);

  if (isLoading.clinics) return <div className="h-screen flex items-center justify-center bg-[#FAF9F6]"><Loader2 className="animate-spin text-[#8DAA9D]" /></div>;

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] text-[#2D302D] min-h-screen font-sans selection:bg-[#8DAA9D] selection:text-white">
      {/* Dynamic Nav */}
      <nav className="fixed w-full z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#2D302D]/5 px-8 lg:px-16 py-6 flex justify-between items-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`w-8 h-1 transition-all duration-500 ${step >= s ? "bg-[#8DAA9D]" : "bg-[#2D302D]/10"}`} />
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 hover:text-red-500 transition-colors">
          <ArrowLeft size={14} /> Abandon Entry
        </button>
      </nav>

      <main className="pt-40 pb-24 px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 step-anim">
          {/* STEP 1: CLINIC */}
          {step === 1 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">Select Facility</h2>
              <div className="grid gap-4">
                {data.clinics.map(c => (
                  <button key={c._id} onClick={() => setSelection({...selection, clinic: c})} 
                    className={`p-6 border flex justify-between items-center transition-all ${selection.clinic?._id === c._id ? "border-[#8DAA9D] bg-[#8DAA9D]/5" : "border-[#2D302D]/10"}`}>
                    <div className="flex items-center gap-4">
                      <Building2 className="text-[#8DAA9D]" />
                      <div className="text-left">
                        <p className="font-bold uppercase text-sm tracking-tight">{c.name}</p>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest">{c.location || c.address}</p>
                      </div>
                    </div>
                    {selection.clinic?._id === c._id && <CheckCircle2 size={18} className="text-[#8DAA9D]" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* STEP 2: DOCTOR */}
          {step === 2 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">Select Faculty</h2>
              {isLoading.doctors ? <Loader2 className="animate-spin" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.doctors.map(d => (
                    <button key={d._id} onClick={() => setSelection({...selection, doctor: d})}
                      className={`p-6 border text-left transition-all ${selection.doctor?._id === d._id ? "border-[#8DAA9D] bg-[#8DAA9D]/5" : "border-[#2D302D]/10"}`}>
                      <img src={d.image} className="w-12 h-12 rounded-full mb-4 grayscale" alt="" />
                      <p className="font-bold uppercase text-sm">{d.name}</p>
                      <p className="text-[10px] text-[#8DAA9D] font-bold uppercase">{d.specialty}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* STEP 3: DATE & TIME */}
          {step === 3 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">Temporal Slot</h2>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(d => (
                  <button key={d.fullDate} onClick={() => setSelection({...selection, date: d})}
                    className={`p-4 border text-center transition-all ${selection.date?.fullDate === d.fullDate ? "bg-[#8DAA9D] text-white" : "border-[#2D302D]/10"}`}>
                    <span className="text-[10px] block opacity-50 uppercase">{d.dayName}</span>
                    <span className="text-lg">{d.dayNumber}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(t => (
                  <button key={t} onClick={() => setSelection({...selection, slot: t})}
                    className={`p-4 border text-sm transition-all ${selection.slot === t ? "bg-[#2D302D] text-white" : "border-[#2D302D]/10"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* STEP 4: DOSSIER */}
          {step === 4 && (
            <section className="space-y-12">
              <h2 className="text-5xl font-light tracking-tighter uppercase">Patient Dossier</h2>
              <div className="grid gap-6">
                <input placeholder="Legal Full Name" className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 outline-none focus:border-[#8DAA9D]" 
                  onChange={e => setPatient({...patient, name: e.target.value})} />
                <input placeholder="Email Address" className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 outline-none focus:border-[#8DAA9D]" 
                  onChange={e => setPatient({...patient, email: e.target.value})} />
                <input placeholder="Phone / Contact" className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 outline-none focus:border-[#8DAA9D]" 
                  onChange={e => setPatient({...patient, phone: e.target.value})} />
                <textarea placeholder="Clinical Notes" className="w-full bg-transparent border border-[#2D302D]/10 p-4 outline-none focus:border-[#8DAA9D] h-32"
                  onChange={e => setPatient({...patient, notes: e.target.value})} />
              </div>
            </section>
          )}

          {/* SUCCESS PAGE */}
          {step === 5 && (
            <section className="text-center py-20 space-y-6">
              <div className="w-20 h-20 bg-[#8DAA9D]/10 rounded-full flex items-center justify-center mx-auto text-[#8DAA9D]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-4xl font-light uppercase">Protocol Validated</h2>
              <button onClick={() => navigate("/")} className="px-8 py-4 bg-[#2D302D] text-white text-[10px] uppercase tracking-widest">Return Home</button>
            </section>
          )}

          {step < 5 && (
            <div className="mt-12 flex items-center gap-6">
              <button disabled={!canProceed || isLoading.submit} onClick={() => step === 4 ? handleSubmission() : setStep(s => s + 1)}
                className="px-12 py-6 bg-[#2D302D] text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#8DAA9D] transition-all disabled:opacity-30 flex items-center gap-2">
                {isLoading.submit ? <Loader2 className="animate-spin" size={14} /> : (step === 4 ? "Initialize Protocol" : "Proceed")}
                <ChevronRight size={14} />
              </button>
              {error && <p className="text-[10px] text-red-500 uppercase tracking-widest">{error}</p>}
            </div>
          )}
        </div>

        {/* SIDEBAR SUMMARY */}
        <aside className="lg:col-span-5 h-fit sticky top-40 bg-white border border-[#2D302D]/5 p-10 space-y-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {selection.doctor ? <img src={selection.doctor.image} className="rounded-full grayscale" alt="" /> : <Stethoscope className="opacity-20" />}
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#8DAA9D] uppercase tracking-widest">Assigned Faculty</p>
              <p className="text-sm font-bold uppercase">{selection.doctor?.name || "Pending..."}</p>
            </div>
          </div>
          <div className="space-y-4 border-t pt-6 text-[11px] uppercase tracking-widest">
            <div className="flex justify-between"><span className="opacity-40">Facility</span><span>{selection.clinic?.name || "---"}</span></div>
            <div className="flex justify-between"><span className="opacity-40">Temporal Slot</span><span>{selection.slot || "---"}</span></div>
            <div className="flex justify-between border-t pt-4"><span className="opacity-40 font-bold">Total Fee</span><span className="text-lg">${selection.doctor?.fee || 0}</span></div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AppointmentPage;