import React, { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Filter, 
  ChevronRight, 
  FileText, 
  History, 
  MoreVertical,
  Activity
} from "lucide-react";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulated fetch - replace with: axios.get("/api/patients")
    const fetchPatients = () => {
      const dummyPatients = [
        { id: "PX-9921", name: "Eleanor Rigby", age: 28, lastVisit: "2025-12-12", status: "In Treatment", bloodType: "A+" },
        { id: "PX-9922", name: "Douglas Adams", age: 42, lastVisit: "2026-01-05", status: "Stable", bloodType: "O-" },
        { id: "PX-9923", name: "Clara Oswald", age: 31, lastVisit: "2026-01-07", status: "Critical", bloodType: "B+" },
        { id: "PX-9924", name: "Arthur Shelby", age: 35, lastVisit: "2025-11-20", status: "Discharged", bloodType: "AB+" },
      ];
      setPatients(dummyPatients);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Critical": return "text-red-500 bg-red-50";
      case "In Treatment": return "text-blue-500 bg-blue-50";
      case "Stable": return "text-[#8DAA9D] bg-[#8DAA9D]/10";
      default: return "text-gray-400 bg-gray-50";
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">Patient Registry</h2>
          <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">Comprehensive Clinical Health Records</p>
        </div>
        
        <button className="flex items-center gap-3 bg-black text-white px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8DAA9D] transition-all duration-500">
          <UserPlus size={16} />
          Register Patient
        </button>
      </div>

      {/* TOP METRICS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-gray-100 p-6 flex items-center justify-between">
            <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Active Cases</p>
                <p className="text-xl font-semibold">142</p>
            </div>
            <Activity className="text-[#8DAA9D] opacity-20" size={32} />
        </div>
        <div className="border border-gray-100 p-6 flex items-center justify-between">
            <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">New this month</p>
                <p className="text-xl font-semibold">+24</p>
            </div>
            <UserPlus className="text-black opacity-20" size={32} />
        </div>
        <div className="border border-gray-100 p-6 flex items-center justify-between">
            <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Records Pending</p>
                <p className="text-xl font-semibold">09</p>
            </div>
            <FileText className="text-amber-500 opacity-20" size={32} />
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or Blood group..." 
            className="w-full bg-white border border-gray-100 py-4 pl-12 pr-4 text-[10px] tracking-widest uppercase outline-none focus:border-black transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* PATIENT LIST */}
      <div className="space-y-4">
        {patients.map((patient) => (
          <div 
            key={patient.id} 
            className="group bg-white border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-2xl hover:border-black/5 transition-all duration-500 cursor-pointer"
          >
            <div className="flex items-center gap-6 lg:w-1/3">
              <div className="w-14 h-14 bg-gray-50 flex items-center justify-center font-serif italic text-lg text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight">{patient.name}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{patient.id} • {patient.age} years</p>
              </div>
            </div>

            <div className="flex items-center gap-12 text-[10px] uppercase tracking-widest font-bold">
              <div className="hidden sm:block">
                <p className="text-gray-300 mb-1 font-normal">Last Visit</p>
                <p>{patient.lastVisit}</p>
              </div>
              <div>
                <p className="text-gray-300 mb-1 font-normal">Blood Type</p>
                <p className="text-red-500">{patient.bloodType}</p>
              </div>
              <div>
                <p className="text-gray-300 mb-1 font-normal">Status</p>
                <span className={`px-3 py-1 text-[9px] ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:ml-auto">
              <button className="p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-full transition-all">
                <History size={18} />
              </button>
              <button className="flex items-center gap-2 bg-gray-50 px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold group-hover:bg-black group-hover:text-white transition-all">
                View File <ChevronRight size={14} />
              </button>
              <button className="text-gray-200 hover:text-black">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Patients;