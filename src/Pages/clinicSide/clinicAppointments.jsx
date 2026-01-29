import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("AUTH_ERROR: No token found in local storage.");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/appointments/my-appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      console.log("RAW API RESPONSE:", response.data);

      // Expecting: { success: true, data: [...] }
      const dataToSet = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.appointments)
        ? response.data.appointments
        : [];

      console.table(dataToSet);
      setAppointments(dataToSet);
    } catch (err) {
      console.error("API Error Object:", err);
      setError(err.response?.data?.message || err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    const searchStr = searchTerm.trim().toLowerCase();

    return (appointments || []).filter((app) => {
      if (!app) return false;
      if (!searchStr) return true;

      const patientName = app.patientId?.name || "unknown";
      const doctorName = app.doctorId?.name || "unassigned";
      const idRef = app._id || "";

      return (
        patientName.toLowerCase().includes(searchStr) ||
        doctorName.toLowerCase().includes(searchStr) ||
        idRef.toLowerCase().includes(searchStr)
      );
    });
  }, [appointments, searchTerm]);

  const getStatusStyle = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "CONFIRMED") return "bg-green-50 text-green-700 border-green-200";
    if (s === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
    if (s === "COMPLETED") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const makeShortRef = (id) => {
    if (!id) return "APT";
    return `APT-${String(id).slice(-5).toUpperCase()}`;
  };

  const formatMoney = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="p-8 lg:p-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-light tracking-tighter uppercase">
            Appointments Registry
          </h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">
            {loading ? "Syncing..." : `Records found: ${filteredAppointments.length}`}
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-4 bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gray-800 transition-all shadow-xl"
          onClick={() => {
            // TODO: open create modal / navigate to create page
            console.log("Initialize new appointment");
          }}
        >
          <Plus size={14} /> Initialize New
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-100 flex items-center gap-3">
          <AlertCircle size={18} />
          <span className="text-[10px] uppercase font-bold">{error}</span>
          <button
            onClick={fetchAppointments}
            className="ml-auto underline text-[9px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-10">
        <div className="relative group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by patient / doctor / id..."
            className="w-full bg-white border border-gray-200 py-5 pl-14 pr-6 text-[10px] tracking-[0.2em] uppercase outline-none focus:border-black transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
                Reference / Patient
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
                Assigned Faculty
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
                Date & Time
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
                Status
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
                Fee
              </th>
              <th className="p-6"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-20 text-center">
                  <Loader2 className="animate-spin inline-block mb-2 opacity-20" size={30} />
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">
                    Fetching...
                  </p>
                </td>
              </tr>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((app) => {
                const ref = makeShortRef(app._id);
                const patientName = app.patientId?.name || "Unknown";
                const patientEmail = app.patientId?.email || "";
                const doctorName = app.doctorId?.name || "Unassigned";
                const specialization = app.doctorId?.specialization || "Faculty";
                const dateStr = app.dateTime
                  ? new Date(app.dateTime).toLocaleDateString()
                  : "N/A";
                const timeStr = app.dateTime
                  ? new Date(app.dateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--";

                return (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-[10px] font-bold">
                          {ref.slice(-2)}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase">
                            {patientName}
                          </p>
                          <p className="text-[9px] text-gray-400 font-mono">
                            {patientEmail ? patientEmail : ref}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-6">
                      <p className="text-[11px] uppercase text-gray-600">
                        Dr. {doctorName}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase">
                        {specialization}
                      </p>
                    </td>

                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] text-gray-900 font-medium">
                          <CalendarIcon size={12} className="text-gray-400" />
                          {dateStr}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase">
                          <Clock size={12} /> {timeStr}
                        </div>
                      </div>
                    </td>

                    <td className="p-6">
                      <span
                        className={`px-3 py-1 border text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(
                          app.status
                        )}`}
                      >
                        {app.status || "PENDING"}
                      </span>
                    </td>

                    <td className="p-6 font-mono text-xs">
                      ${formatMoney(app.consultationFee)}
                    </td>

                    <td className="p-6 text-right">
                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-black transition-colors"
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-20 text-center opacity-30 text-[10px] uppercase font-bold tracking-widest"
                >
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;