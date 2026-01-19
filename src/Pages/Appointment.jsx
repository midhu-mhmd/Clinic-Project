import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2,
  Lock,
  CreditCard
} from "lucide-react";

const AppointmentPage = () => {
  const [step, setStep] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(".step-content", 
      { opacity: 0, x: 20 }, 
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
    );
  }, [step]);

  // Mock data for the blueprint-style calendar
  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00"];

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] text-[#2D302D] min-h-screen">
      {/* HEADER: PROGRESS BAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-[#2D302D]/5 px-8 lg:px-16 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Protocol Stage</span>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-8 h-1 transition-all duration-500 ${step >= s ? "bg-[#8DAA9D]" : "bg-[#2D302D]/10"}`} 
              />
            ))}
          </div>
        </div>
        <button onClick={() => window.history.back()} className="text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 hover:opacity-50 transition-opacity">
          <ArrowLeft size={14} /> Abandon Entry
        </button>
      </nav>

      <main className="pt-32 pb-24 px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT: INTERACTIVE FORM */}
        <div className="lg:col-span-7 step-content">
          {step === 1 && (
            <section className="space-y-12">
              <div>
                <h2 className="text-5xl font-light tracking-tighter uppercase mb-6">Select Temporal Slot</h2>
                <p className="text-[#2D302D]/50 text-sm max-w-md">Initialize the consultation by selecting a certified opening in the physician's schedule.</p>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-7 gap-2">
                  {/* Simplistic Calendar View */}
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div key={i} className="text-center py-4 border border-[#2D302D]/5 bg-white group hover:border-[#8DAA9D] transition-all cursor-pointer">
                      <span className="block text-[10px] opacity-30 font-bold mb-2">{d}</span>
                      <span className="text-lg font-light">{18 + i}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {timeSlots.map((time, i) => (
                    <button key={i} className="py-6 border border-[#2D302D]/10 hover:border-[#8DAA9D] hover:bg-[#8DAA9D]/5 text-sm font-light transition-all">
                      {time} <span className="text-[10px] opacity-30 ml-2">EST</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-12">
              <div>
                <h2 className="text-5xl font-light tracking-tighter uppercase mb-6">Patient Dossier</h2>
                <p className="text-[#2D302D]/50 text-sm max-w-md">Input the primary medical identifiers for the session registry.</p>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">Legal Full Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 focus:border-[#8DAA9D] outline-none transition-all text-xl font-light" placeholder="Johnathan Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">Contact Identifier</label>
                  <input type="email" className="w-full bg-transparent border-b border-[#2D302D]/10 py-4 focus:border-[#8DAA9D] outline-none transition-all text-xl font-light" placeholder="j.doe@network.com" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">Symptoms/Notes (Optional)</label>
                  <textarea className="w-full bg-transparent border border-[#2D302D]/10 p-6 focus:border-[#8DAA9D] outline-none transition-all text-lg font-light min-h-[150px]" placeholder="Describe the current clinical state..." />
                </div>
              </form>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-12 text-center py-20 bg-white border border-[#2D302D]/5">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-[#8DAA9D]/10 flex items-center justify-center text-[#8DAA9D]">
                  <CheckCircle2 size={40} strokeWidth={1} />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-light tracking-tighter uppercase">Protocol Validated</h2>
                <p className="text-[#2D302D]/50 text-sm max-w-xs mx-auto italic">Your consultation with Dr. Jenkins has been synchronized. A secure entry link has been sent to your registry.</p>
              </div>
              <button onClick={() => window.location.href="/"} className="px-10 py-5 bg-[#2D302D] text-[#FAF9F6] text-[10px] uppercase tracking-[0.4em] font-bold">Return to Faculty</button>
            </section>
          )}

          {step < 3 && (
            <div className="mt-16 flex items-center gap-8">
              <button 
                onClick={() => setStep(prev => prev + 1)}
                className="px-12 py-8 bg-[#2D302D] text-[#FAF9F6] text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-[#8DAA9D] transition-all duration-700 flex items-center gap-4"
              >
                Proceed to {step === 1 ? "Dossier" : "Confirmation"} <ChevronRight size={14} />
              </button>
              <div className="flex items-center gap-3 opacity-20">
                <Lock size={12} />
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Encrypted Session</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: DOSSIER SUMMARY */}
        <div className="lg:col-span-5 relative">
          <aside className="sticky top-32 bg-white border border-[#2D302D]/5 p-12 space-y-10 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-20 h-24 bg-gray-100 grayscale">
                <img src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Dr. Jenkins" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[0.4em] text-[#8DAA9D] font-bold">Faculty Member</span>
                <h4 className="text-xl font-light tracking-tight uppercase">Dr. Sarah Jenkins</h4>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Preventive Cardiology</p>
              </div>
            </div>

            <div className="space-y-6 border-t border-[#2D302D]/5 pt-8">
              <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                <span className="opacity-40">Consultation Type</span>
                <span className="font-bold">Neural Consult (Video)</span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                <span className="opacity-40">Temporal Slot</span>
                <span className="font-bold">{step > 1 ? "Oct 18 // 10:30 AM" : "Not Selected"}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] uppercase tracking-widest border-t border-[#2D302D]/5 pt-6">
                <span className="opacity-40 font-bold text-[#8DAA9D]">Total Protocol Fee</span>
                <span className="text-xl font-light">$80.00</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AppointmentPage;