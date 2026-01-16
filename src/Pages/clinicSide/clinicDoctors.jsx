import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Star, 
  ShieldCheck, 
  Clock, 
  Mail 
} from "lucide-react";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - replace with: axios.get("/api/tenants/doctors")
    const fetchDoctors = () => {
      const dummyDoctors = [
        { id: "DOC-01", name: "Dr. Sarah Jenkins", specialty: "Orthodontics", status: "On Duty", patients: 12, rating: 4.9 },
        { id: "DOC-02", name: "Dr. Marcus Vane", specialty: "Implantology", status: "On Break", patients: 8, rating: 4.8 },
        { id: "DOC-03", name: "Dr. Elena Rossi", specialty: "Cosmetic Dentistry", status: "Off Duty", patients: 0, rating: 5.0 },
      ];
      setDoctors(dummyDoctors);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">Medical Faculty</h2>
          <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">Manage clinical practitioners and credentials</p>
        </div>
        
        <button className="flex items-center gap-3 bg-black text-white px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8DAA9D] transition-all">
          <UserPlus size={16} />
          Add Practitioner
        </button>
      </div>

      {/* DOCTOR CARDS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-white border border-gray-100 p-8 group hover:border-black transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-gray-50 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img src={`https://ui-avatars.com/api/?name=${doc.name}&background=f3f4f6&color=000`} alt={doc.name} />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">{doc.name}</h3>
                  <p className="text-[10px] text-[#8DAA9D] uppercase tracking-widest font-bold">{doc.specialty}</p>
                </div>
              </div>
              <div className={`px-3 py-1 text-[8px] uppercase tracking-tighter font-bold border ${
                doc.status === "On Duty" ? "border-green-100 text-green-600 bg-green-50" : "border-gray-100 text-gray-400"
              }`}>
                {doc.status}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6">
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Active Patients</p>
                <p className="text-sm font-semibold">{doc.patients}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Satisfaction</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-black" />
                  <p className="text-sm font-semibold">{doc.rating}</p>
                </div>
              </div>
              <div className="flex justify-end items-end gap-2">
                <button className="p-2 border border-gray-100 hover:bg-black hover:text-white transition-colors">
                  <Mail size={14} />
                </button>
                <button className="p-2 border border-gray-100 hover:bg-black hover:text-white transition-colors">
                  <ShieldCheck size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;