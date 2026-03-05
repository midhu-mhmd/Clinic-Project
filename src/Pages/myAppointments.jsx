import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { Calendar, Clock, User, Building2, ChevronRight, ArrowLeft, Loader2, AlertCircle, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null); // Modal state
    const containerRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const { data } = await axios.get("http://localhost:5000/api/appointments/my-appointments", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setAppointments(data.data || []);
                }
            } catch (err) {
                console.error("Fetch Appointments Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [navigate]);

    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.from(".appointment-card", {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out"
                });

                gsap.from(".header-reveal", {
                    x: -20,
                    opacity: 0,
                    duration: 1,
                    ease: "expo.out"
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    // --- MODAL ANIMATION ---
    useEffect(() => {
        if (selectedAppointment) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.5, ease: "power4.out" }
            );
            gsap.fromTo(".modal-backdrop",
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );
        }
    }, [selectedAppointment]);

    const closeModal = () => {
        gsap.to(modalRef.current, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: "power4.in",
            onComplete: () => setSelectedAppointment(null)
        });
        gsap.to(".modal-backdrop", { opacity: 0, duration: 0.2 });
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-[#8DAA9D] animate-spin" />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-[#2D302D]/40 font-bold">Retrieving Protocols...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#FAF9F6] text-[#2D302D] pt-32 pb-20 px-6 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 header-reveal">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate("/")}
                            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-[#2D302D]/40 hover:text-[#2D302D] transition-all"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Terminal
                        </button>
                        <h1 className="text-6xl font-light tracking-tighter uppercase leading-none">
                            My <span className="italic font-serif text-[#8DAA9D]">Appointments</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white border border-[#2D302D]/5 rounded-full shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-[#8DAA9D] animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">
                            {appointments.length} Active Records
                        </span>
                    </div>
                </div>

                {/* APPOINTMENTS LIST */}
                {appointments.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white border border-[#2D302D]/5 rounded-[40px] shadow-sm appointment-card">
                        <div className="w-20 h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#2D302D]/10">
                            <Calendar size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-light uppercase tracking-tight">No Appointments Found</h3>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 px-10">Your clinical schedule is currently vacant. Initialize a booking to see records here.</p>
                        </div>
                        <button
                            onClick={() => navigate("/clinics")}
                            className="mt-4 px-10 py-4 bg-[#2D302D] text-white text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#8DAA9D] transition-all duration-500 shadow-xl"
                        >
                            Book New Protocol
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {appointments.map((apt) => (
                            <div
                                key={apt._id}
                                className="appointment-card group bg-white border border-[#2D302D]/5 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-2xl hover:border-[#8DAA9D]/20 transition-all duration-700"
                            >
                                <div className="flex items-start gap-8">
                                    {/* DOCTOR ICON/IMAGE */}
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-[#FAF9F6] rounded-2xl flex items-center justify-center overflow-hidden border border-[#2D302D]/5 group-hover:scale-105 transition-transform duration-700">
                                            {apt.doctorId?.image ? (
                                                <img src={apt.doctorId.image} alt={apt.doctorId.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            ) : (
                                                <User size={32} className="text-[#2D302D]/10" />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-4 border-white flex items-center justify-center shadow-sm ${apt.status === "CONFIRMED" ? "bg-[#8DAA9D]" :
                                            apt.status === "PENDING" ? "bg-amber-400" : "bg-red-400"
                                            }`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8DAA9D] mb-1">Assigned Specialist</p>
                                            <h3 className="text-2xl font-light tracking-tight uppercase group-hover:translate-x-1 transition-transform duration-500">{apt.doctorId?.name || "Global Faculty"}</h3>
                                        </div>

                                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                                            <div className="flex items-center gap-2 text-[#2D302D]/40">
                                                <Building2 size={14} className="group-hover:text-[#8DAA9D] transition-colors" />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">
                                                    {apt.tenantId?.name || "General Clinic"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#2D302D]/40">
                                                <Calendar size={14} className="group-hover:text-[#8DAA9D] transition-colors" />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">
                                                    {new Date(apt.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#2D302D]/40">
                                                <Clock size={14} className="group-hover:text-[#8DAA9D] transition-colors" />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">
                                                    {new Date(apt.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex md:flex-col items-center md:items-end justify-between gap-4 md:border-l md:border-[#2D302D]/5 md:pl-10">
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-30 mb-1">Status Protocol</p>
                                        <span className={`text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full ${apt.status === "CONFIRMED" ? "bg-[#8DAA9D]/10 text-[#8DAA9D]" :
                                            apt.status === "PENDING" ? "bg-amber-400/10 text-amber-600" :
                                                "bg-red-500/10 text-red-500"
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAppointment(apt)}
                                        className="flex md:w-full items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-[#2D302D]/40 hover:text-[#2D302D] transition-colors group/btn"
                                    >
                                        Details <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                    {apt.consultationType === "video" && apt.meetingLink && ["PENDING", "CONFIRMED"].includes(apt.status) && (
                                        <button
                                            onClick={() => {
                                                const token = apt.meetingLink.split("/consultation/")[1];
                                                if (token) navigate(`/consultation/${token}`);
                                            }}
                                            className="flex md:w-full items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-white bg-[#8DAA9D] px-4 py-2.5 rounded-full hover:bg-[#2D302D] transition-all duration-500"
                                        >
                                            <Video size={12} /> Join Video Call
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SECURITY INFO */}
                <div className="mt-24 p-10 bg-[#2D302D] text-white rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 appointment-card overflow-hidden relative group">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <AlertCircle size={18} className="text-[#8DAA9D]" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Patient Security Notice</h3>
                        </div>
                        <p className="max-w-xl text-[10px] leading-relaxed opacity-50 uppercase tracking-widest">Your clinical appointments are under end-to-end encryption. Only the assigned faculty and clinic administrator have access to these booking protocols.</p>
                    </div>
                    <div className="relative z-10">
                        <div className="text-[60px] font-serif italic text-white/5 absolute -right-10 -bottom-10 select-none">SCHEDULE</div>
                        <button className="px-8 py-4 bg-white text-[#2D302D] text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#8DAA9D] hover:text-white transition-all duration-500">
                            Clinical Support
                        </button>
                    </div>
                </div>

                {/* APPOINTMENT DETAILS MODAL */}
                {selectedAppointment && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                        <div
                            className="modal-backdrop absolute inset-0 bg-[#2D302D]/60 backdrop-blur-sm"
                            onClick={closeModal}
                        />
                        <div
                            ref={modalRef}
                            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            {/* MODAL HEADER */}
                            <div className="bg-[#2D302D] p-8 md:p-12 text-white relative">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8DAA9D] transition-all"
                                >
                                    <ArrowLeft size={16} className="rotate-90 md:rotate-0 md:-rotate-45" />
                                </button>
                                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8DAA9D] mb-4">Protocol Record</p>
                                <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tighter">
                                    Clinical <span className="italic font-serif text-[#8DAA9D]">Snapshot</span>
                                </h2>
                            </div>

                            {/* MODAL CONTENT */}
                            <div className="p-8 md:p-12 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">

                                {/* SECTION: FACULTY & FACILITY */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[9px] uppercase tracking-widest font-bold opacity-30">Assigned Faculty</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#FAF9F6] rounded-xl flex items-center justify-center border border-[#2D302D]/5">
                                                <User size={18} className="text-[#8DAA9D]" />
                                            </div>
                                            <p className="text-sm font-bold uppercase">{selectedAppointment.doctorId?.name}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] uppercase tracking-widest font-bold opacity-30">Medical Facility</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#FAF9F6] rounded-xl flex items-center justify-center border border-[#2D302D]/5">
                                                <Building2 size={18} className="text-[#8DAA9D]" />
                                            </div>
                                            <p className="text-sm font-bold uppercase">{selectedAppointment.tenantId?.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-[#2D302D]/5" />

                                {/* SECTION: PATIENT DATA */}
                                <div className="space-y-6">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-[#8DAA9D]">Patient Dossier</p>
                                    <div className="grid md:grid-cols-2 gap-6 bg-[#FAF9F6] p-8 rounded-3xl border border-[#2D302D]/5">
                                        <div className="space-y-1">
                                            <p className="text-[8px] uppercase tracking-widest font-bold opacity-40">Registration Name</p>
                                            <p className="text-sm font-medium">{selectedAppointment.patientInfo?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] uppercase tracking-widest font-bold opacity-40">Primary Contact</p>
                                            <p className="text-sm font-medium">{selectedAppointment.patientInfo?.contact}</p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-[8px] uppercase tracking-widest font-bold opacity-40">Email Protocol</p>
                                            <p className="text-sm font-medium">{selectedAppointment.patientInfo?.email || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: CLINICAL NOTES */}
                                <div className="space-y-4">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-[#8DAA9D]">Subjective Symptoms / Notes</p>
                                    <div className="p-8 border border-[#2D302D]/10 rounded-3xl italic text-sm text-[#2D302D]/70 leading-relaxed">
                                        {selectedAppointment.patientInfo?.symptoms || "No additional clinical notes provided for this protocol."}
                                    </div>
                                </div>

                                {/* SECTION: TEMPORAL DATA */}
                                <div className="flex flex-wrap gap-8 pt-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-[#8DAA9D]" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">
                                            {new Date(selectedAppointment.dateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-[#8DAA9D]" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">
                                            {new Date(selectedAppointment.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* MODAL FOOTER */}
                            <div className="p-8 bg-[#FAF9F6] border-t border-[#2D302D]/5 flex justify-end gap-4">
                                {selectedAppointment.consultationType === "video" && selectedAppointment.meetingLink && ["PENDING", "CONFIRMED"].includes(selectedAppointment.status) && (
                                    <button
                                        onClick={() => {
                                            const token = selectedAppointment.meetingLink.split("/consultation/")[1];
                                            if (token) navigate(`/consultation/${token}`);
                                        }}
                                        className="px-10 py-4 bg-[#8DAA9D] text-white text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#2D302D] transition-all flex items-center gap-2"
                                    >
                                        <Video size={14} /> Join Video Call
                                    </button>
                                )}
                                <button
                                    onClick={closeModal}
                                    className="px-10 py-4 bg-[#2D302D] text-white text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#8DAA9D] transition-all"
                                >
                                    Close Record
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #8DAA9D; border-radius: 10px; }
            `}} />
            </div>
        </div>
    );
};

export default MyAppointments;
