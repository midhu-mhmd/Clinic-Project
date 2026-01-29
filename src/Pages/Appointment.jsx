import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Building2,
  Stethoscope,
  MapPin,
  Loader2,
} from "lucide-react";

const AppointmentPage = () => {
  const [step, setStep] = useState(1);
  const containerRef = useRef(null);

  // --- DATA STATE ---
  const [clinics, setClinics] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- SELECTION STATE ---
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // --- PATIENT DOSSIER STATE ---
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    notes: "",
  });

  // --- GENERATE DYNAMIC DATES ---
  const dynamicDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      fullDate: date.toISOString().split("T")[0],
      dayName: ["S", "M", "T", "W", "T", "F", "S"][date.getDay()],
      dayNumber: date.getDate(),
      monthName: date.toLocaleString("default", { month: "short" }),
    };
  });

  // --- 1. FETCH ALL CLINICS ---
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/tenants/all");
        if (response.data.success) {
          // Normalize ID to id for easier frontend usage
          const formattedClinics = response.data.data.map((clinic) => ({
            ...clinic,
            id: clinic._id || clinic.id,
          }));
          setClinics(formattedClinics);
        }
      } catch (err) {
        setError("Failed to load facilities.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // --- 2. FETCH DOCTORS BASED ON SELECTED CLINIC ---
 // --- 2. FETCH DOCTORS BASED ON SELECTED CLINIC ---
useEffect(() => {
  const fetchDoctors = async () => {
    // Check for selectedClinic.id explicitly
    const clinicId = selectedClinic?._id || selectedClinic?.id;
    if (!clinicId) return;
    
    try {
      setIsDoctorsLoading(true);
      setError(null);
      setSelectedDoctor(null); 
      
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/doctors/clinic/${clinicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const formattedDoctors = response.data.data.map((doc) => ({
          ...doc,
          // Ensure we have a string ID for the payload
          id: doc._id?.toString() || doc.id?.toString(), 
          fee: doc.consultationFee || doc.fee // Standardize fee key
        }));
        setAvailableDoctors(formattedDoctors);
      }
    } catch (err) {
      setError("Failed to load faculty.");
      setAvailableDoctors([]);
    } finally {
      setIsDoctorsLoading(false);
    }
  };
  fetchDoctors();
}, [selectedClinic]);

// --- 3. FINAL SUBMISSION HANDLER ---
const handleConfirmProtocol = async () => {
  try {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    
    // Ensure we are grabbing the raw IDs
    const clinicId = selectedClinic?._id || selectedClinic?.id;
    const doctorId = selectedDoctor?._id || selectedDoctor?.id;

    const payload = {
      tenantId: clinicId, 
      doctorId: doctorId,
      date: selectedDate.fullDate,
      slot: selectedSlot,
      patientName: patientData.name,
      patientEmail: patientData.email,
      notes: patientData.notes,
      fee: selectedDoctor.fee
    };

    const response = await axios.post(
      "http://localhost:5000/api/appointments",
      payload,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        } 
      }
    );

    if (response.data.success) {
      setStep(5);
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Failed to synchronize protocol.";
    console.error("Submission Error:", err.response?.data);
    alert(errorMsg);
  } finally {
    setIsSubmitting(false);
  }
};
  useEffect(() => {
    gsap.fromTo(
      ".step-content",
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [step]);

  const canProceed = () => {
    if (step === 1) return selectedClinic !== null;
    if (step === 2) return selectedDoctor !== null && !isDoctorsLoading;
    if (step === 3) return selectedDate !== null && selectedSlot !== null;
    if (step === 4) return patientData.name && patientData.email.includes("@");
    return true;
  };

  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00"];

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] text-[#2D302D] min-h-screen font-sans selection:bg-[#8DAA9D] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#2D302D]/5 px-8 lg:px-16 py-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 hidden md:block">Protocol Sequence</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`w-8 h-1 transition-all duration-500 ${step >= s ? "bg-[#8DAA9D]" : "bg-[#2D302D]/10"}`} />
            ))}
          </div>
        </div>
        <button onClick={() => window.history.back()} className="text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 hover:text-[#8DAA9D] transition-colors">
          <ArrowLeft size={14} /> Abandon Entry
        </button>
      </nav>

      <main className="pt-40 pb-24 px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 min-h-[60vh] flex flex-col justify-between">
          <div className="step-content">
            {step === 1 && (
              <section className="space-y-12">
                <div>
                  <h2 className="text-5xl font-light tracking-tighter uppercase mb-6">Select Facility</h2>
                  <p className="text-[#2D302D]/50 text-sm max-w-md">Identify the certified medical establishment for your protocol initialization.</p>
                </div>
                <div className="grid gap-6">
                  {isLoading ? (
                    <div className="flex items-center gap-4 py-10 opacity-40">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Synchronizing Registry...</span>
                    </div>
                  ) : (
                    clinics.map((clinic) => (
                      <button
                        key={clinic.id}
                        onClick={() => setSelectedClinic(clinic)}
                        className={`group p-8 text-left border transition-all duration-500 flex items-center justify-between
                          ${selectedClinic?.id === clinic.id ? "border-[#8DAA9D] bg-[#8DAA9D]/5" : "border-[#2D302D]/10 hover:border-[#8DAA9D]/50"}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-full ${selectedClinic?.id === clinic.id ? "bg-[#8DAA9D] text-white" : "bg-[#2D302D]/5 text-[#2D302D]/40"}`}>
                            <Building2 size={20} />
                          </div>
                          <div>
                            <h3 className="text-xl font-light uppercase tracking-tight mb-2">{clinic.name}</h3>
                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest opacity-50">
                              <MapPin size={12} /> {clinic.location}
                            </div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border border-[#2D302D]/20 flex items-center justify-center ${selectedClinic?.id === clinic.id ? "bg-[#8DAA9D] border-[#8DAA9D]" : ""}`}>
                          {selectedClinic?.id === clinic.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-12">
                <div>
                  <h2 className="text-5xl font-light tracking-tighter uppercase mb-6">Select Faculty</h2>
                  <p className="text-[#2D302D]/50 text-sm max-w-md">Choose a verified specialist from the {selectedClinic?.name} registry.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isDoctorsLoading ? (
                    <div className="col-span-2 flex items-center gap-4 py-10 opacity-40">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Fetching Faculty Registry...</span>
                    </div>
                  ) : availableDoctors.length > 0 ? (
                    availableDoctors.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`group relative p-6 text-left border transition-all duration-500 overflow-hidden
                          ${selectedDoctor?.id === doc.id ? "border-[#8DAA9D]" : "border-[#2D302D]/10 hover:border-[#8DAA9D]/50"}`}
                      >
                        {selectedDoctor?.id === doc.id && (
                          <div className="absolute top-0 right-0 p-2 bg-[#8DAA9D] text-white">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <div className="flex items-start gap-4 mb-6">
                          <img src={doc.image || "https://via.placeholder.com/400"} alt={doc.name} className="w-16 h-16 object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all" />
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8DAA9D] block mb-1">{doc.specialty}</span>
                            <h3 className="text-lg font-bold uppercase tracking-tight leading-none">{doc.name}</h3>
                          </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-[#2D302D]/5 pt-4">
                          <span className="text-[10px] uppercase tracking-widest opacity-40">Consultation Fee</span>
                          <span className="font-mono text-sm">${doc.fee}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-[10px] uppercase tracking-widest opacity-40 col-span-2">No faculty members found for this facility.</p>
                  )}
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-12">
                <div>
                  <h2 className="text-5xl font-light tracking-tighter uppercase mb-6">Temporal Slot</h2>
                  <p className="text-[#2D302D]/50 text-sm max-w-md">Initialize the consultation by selecting a opening in the physician's schedule.</p>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-7 gap-2">
                    {dynamicDays.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={`text-center py-4 border transition-all cursor-pointer group 
                          ${selectedDate?.fullDate === d.fullDate ? "border-[#8DAA9D] bg-[#8DAA9D]/5" : "border-[#2D302D]/5 bg-white hover:border-[#8DAA9D]"}`}
                      >
                        <span className="block text-[10px] opacity-30 font-bold mb-2">{d.dayName}</span>
                        <span className="text-lg font-light">{d.dayNumber}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${!selectedDate && "opacity-20 pointer-events-none"}`}>
                    {timeSlots.map((time, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(time)}
                        className={`py-6 border text-sm font-light transition-all flex justify-center items-center gap-2
                          ${selectedSlot === time ? "bg-[#2D302D] text-white border-[#2D302D]" : "border-[#2D302D]/10 hover:border-[#8DAA9D] hover:bg-[#8DAA9D]/5"}`}
                      >
                        {time} <span className="text-[10px] opacity-30">EST</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-12">
                <div>
                  <h2 className="text-5xl font-light tracking-tighter uppercase mb-6">Patient Dossier</h2>
                  <p className="text-[#2D302D]/50 text-sm max-w-md">Input the primary medical identifiers for the session registry.</p>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">Legal Full Name</label>
                    <input 
                      type="text" 
                      value={patientData.name}
                      onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                      className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 focus:border-[#8DAA9D] outline-none transition-all text-xl font-light" 
                      placeholder="Johnathan Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">Contact Identifier</label>
                    <input 
                      type="email" 
                      value={patientData.email}
                      onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                      className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 focus:border-[#8DAA9D] outline-none transition-all text-xl font-light" 
                      placeholder="j.doe@network.com" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">Symptoms/Notes (Optional)</label>
                    <textarea 
                      value={patientData.notes}
                      onChange={(e) => setPatientData({...patientData, notes: e.target.value})}
                      className="w-full bg-transparent border border-[#2D302D]/10 p-6 focus:border-[#8DAA9D] outline-none transition-all text-lg font-light min-h-[150px]" 
                      placeholder="Describe the current clinical state..." 
                    />
                  </div>
                </form>
              </section>
            )}

            {step === 5 && (
              <section className="space-y-12 text-center py-20 bg-white border border-[#2D302D]/5">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#8DAA9D]/10 flex items-center justify-center text-[#8DAA9D] animate-in zoom-in duration-500">
                    <CheckCircle2 size={40} strokeWidth={1} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-light tracking-tighter uppercase">Protocol Validated</h2>
                  <p className="text-[#2D302D]/50 text-sm max-w-xs mx-auto italic">Your consultation with {selectedDoctor?.name} at {selectedClinic?.name} has been synchronized.</p>
                </div>
                <button onClick={() => (window.location.href = "/")} className="px-10 py-5 bg-[#2D302D] text-[#FAF9F6] text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#8DAA9D] transition-colors">Return to Dashboard</button>
              </section>
            )}
          </div>

          {step < 5 && (
            <div className="mt-16 flex items-center gap-8">
              <button
                onClick={() => {
                  if (step === 4) handleConfirmProtocol();
                  else setStep((prev) => prev + 1);
                }}
                disabled={!canProceed() || isSubmitting}
                className="group px-12 py-8 bg-[#2D302D] text-[#FAF9F6] text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[#8DAA9D] transition-all duration-700 flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : (step === 4 ? "Confirm Protocol" : "Proceed")}
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-3 opacity-20">
                <Lock size={12} />
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Encrypted Session</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <aside className="sticky top-40 bg-white border border-[#2D302D]/5 p-12 space-y-10 shadow-sm transition-all duration-500">
            {selectedDoctor ? (
              <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="w-20 h-24 bg-gray-100 grayscale overflow-hidden">
                  <img src={selectedDoctor.image || "https://via.placeholder.com/400"} className="w-full h-full object-cover" alt="Doctor" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-[#8DAA9D] font-bold">Assigned Faculty</span>
                  <h4 className="text-xl font-light tracking-tight uppercase">{selectedDoctor.name}</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">{selectedDoctor.specialty}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6 opacity-30">
                <div className="w-20 h-24 bg-gray-100 flex items-center justify-center"><Stethoscope size={24} /></div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Faculty Member</span>
                  <h4 className="text-xl font-light tracking-tight uppercase">Pending Selection...</h4>
                </div>
              </div>
            )}

            <div className="space-y-6 border-t border-[#2D302D]/5 pt-8">
              <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                <span className="opacity-40">Medical Facility</span>
                <span className={`font-bold ${selectedClinic ? "text-[#2D302D]" : "opacity-30"}`}>{selectedClinic?.name || "---"}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                <span className="opacity-40">Consultation Type</span>
                <span className="font-bold">Neural Consult (Video)</span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                <span className="opacity-40">Temporal Slot</span>
                <span className={`font-bold ${selectedSlot && selectedDate ? "text-[#2D302D]" : "opacity-30"}`}>
                  {selectedSlot && selectedDate ? `${selectedDate.monthName} ${selectedDate.dayNumber} // ${selectedSlot}` : "---"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-widest border-t border-[#2D302D]/5 pt-6">
                <span className="opacity-40 font-bold text-[#8DAA9D]">Total Protocol Fee</span>
                <span className="text-xl font-light">{selectedDoctor ? `$${selectedDoctor.fee}.00` : "---"}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AppointmentPage;