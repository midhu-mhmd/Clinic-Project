import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Filter, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for initial UI - replace with your API call
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // const { data } = await axios.get("http://localhost:5000/api/appointments/tenant");
        // setAppointments(data);
        
        // Temporary dummy data to see the UI
        setAppointments([
          { id: "APP-001", patient: "Julianne Moore", type: "First Consultation", date: "2026-01-08", time: "10:30 AM", status: "Confirmed" },
          { id: "APP-002", patient: "Arthur Dent", type: "Follow-up", date: "2026-01-08", time: "11:15 AM", status: "Pending" },
          { id: "APP-003", patient: "Sarah Connor", type: "Dental Surgery", date: "2026-01-09", time: "09:00 AM", status: "Completed" },
          { id: "APP-004", patient: "Thomas Shelby", type: "Check-up", date: "2026-01-10", time: "02:00 PM", status: "Cancelled" },
        ]);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed": return "bg-green-50 text-green-700 border-green-100";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Completed": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">Schedule</h2>
          <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">Manage and monitor clinical consultations</p>
        </div>
        
        <button className="flex items-center gap-3 bg-black text-white px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8DAA9D] transition-colors duration-500 shadow-xl">
          <Plus size={16} />
          New Appointment
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH PATIENT OR ID..." 
            className="w-full bg-white border border-gray-100 py-4 pl-12 pr-4 text-[10px] tracking-widest uppercase outline-none focus:border-black transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-4 border border-gray-100 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all">
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Patient</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Consultation Type</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Date & Time</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Status</th>
              <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {app.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{app.patient}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-tighter">{app.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <p className="text-xs text-gray-600">{app.type}</p>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-900">
                      <CalendarIcon size={12} className="text-gray-300" /> {app.date}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <Clock size={12} /> {app.time}
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button className="text-gray-300 hover:text-black transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;