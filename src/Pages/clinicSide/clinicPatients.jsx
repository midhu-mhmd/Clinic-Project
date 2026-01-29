import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Search, 
  UserPlus, 
  Filter, 
  ChevronRight, 
  FileText, 
  History, 
  MoreVertical,
  Activity,
  Loader2,
  AlertCircle
} from "lucide-react";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA FROM API ---
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token"); // Assuming JWT auth
      const response = await axios.get("http://localhost:5000/api/patients", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle common API response wrappers
      const data = response.data.data || response.data;
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to synchronize patient database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- DYNAMIC SEARCH FILTER ---
  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return patients;

    return patients.filter((patient) => {
      return (
        patient.name?.toLowerCase().includes(query) ||
        patient.id?.toLowerCase().includes(query) ||
        patient.bloodType?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, patients]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "CRITICAL": return "text-red-500 bg-red-50";
      case "IN TREATMENT": return "text-blue-500 bg-blue-50";
      case "STABLE": return "text-[#8DAA9D] bg-[#8DAA9D]/10";
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

      {/* ERROR STATE */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest">
          <AlertCircle size={18} /> {error}
          <button onClick={fetchPatients} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* METRICS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Total Registry</p>
            <p className="text-xl font-semibold">{patients.length}</p>
          </div>
          <Activity className="text-[#8DAA9D] opacity-20" size={32} />
        </div>
        {/* Additional metrics can be made dynamic based on patient status counts */}
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or Blood group..." 
            className="w-full bg-white border border-gray-100 py-4 pl-12 pr-4 text-[10px] tracking-widest uppercase outline-none focus:border-black transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* PATIENT LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center opacity-20 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Synchronizing Registry...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div 
              key={patient._id || patient.id} 
              className="group bg-white border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-2xl hover:border-black/5 transition-all duration-500 cursor-pointer"
            >
              <div className="flex items-center gap-6 lg:w-1/3">
                <div className="w-14 h-14 bg-gray-50 flex items-center justify-center font-serif italic text-lg text-gray-400 group-hover:bg-black group-hover:text-white transition-colors uppercase">
                  {patient.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">{patient.name}</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{patient.id || patient.patientId} • {patient.age} years</p>
                </div>
              </div>

              <div className="flex items-center gap-12 text-[10px] uppercase tracking-widest font-bold">
                <div className="hidden sm:block">
                  <p className="text-gray-300 mb-1 font-normal">Last Visit</p>
                  <p>{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-300 mb-1 font-normal">Blood Type</p>
                  <p className="text-red-500">{patient.bloodType || "--"}</p>
                </div>
                <div>
                  <p className="text-gray-300 mb-1 font-normal">Status</p>
                  <span className={`px-3 py-1 text-[9px] ${getStatusColor(patient.status)}`}>
                    {patient.status || "UNKNOWN"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:ml-auto">
                <button className="flex items-center gap-2 bg-gray-50 px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold group-hover:bg-black group-hover:text-white transition-all">
                  View File <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border border-dashed border-gray-100">
            <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">No records match your inquiry.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;