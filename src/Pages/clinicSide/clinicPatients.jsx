import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  UserPlus,
  ChevronRight,
  Activity,
  Loader2,
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Hash,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // modal
  const [activePatient, setActivePatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setActivePatient(null), 150);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, closeModal]);

  const normalizePatients = useCallback((payload) => {
    // accepts: { success, data: [...] } OR { data: [...] } OR [...]
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.patients)) return payload.patients;
    if (Array.isArray(payload)) return payload;
    return [];
  }, []);

  const fetchPatients = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setPatients([]);
        setError("AUTH_ERROR: No token found in local storage.");
        return;
      }

      const res = await axios.get(`${API_BASE}/patients`, {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = normalizePatients(res.data);

      // optional: show only PATIENT role (in case API returns mixed users)
      const onlyPatients = (list || []).filter(
        (u) => String(u?.role || "").toUpperCase() === "PATIENT"
      );

      // sort by newest
      onlyPatients.sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      setPatients(onlyPatients);
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === "CanceledError") return;
      console.error("Fetch Patients Error:", err);
      setPatients([]);
      setError(err.response?.data?.message || "Failed to synchronize patient database.");
    } finally {
      setLoading(false);
    }
  }, [normalizePatients]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPatients(controller.signal);
    return () => controller.abort();
  }, [fetchPatients]);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    []
  );

  const viewRows = useMemo(() => {
    return (patients || []).map((p) => {
      const id = p?._id || "";
      const name = p?.name || "Unknown";
      const email = p?.email || "";
      const role = p?.role || "PATIENT";
      const tenantId = p?.tenantId || null;

      // optional fields if you add later
      const contact = p?.phone || p?.contact || "";

      const isVerified = Boolean(p?.isVerified);
      const isActive = p?.isActive !== false;

      const createdAtStr = p?.createdAt ? dateFmt.format(new Date(p.createdAt)) : "N/A";

      const searchBlob = [name, email, id, String(tenantId || "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return {
        p,
        id,
        name,
        email,
        role,
        tenantId,
        contact,
        isVerified,
        isActive,
        createdAtStr,
        searchBlob,
      };
    });
  }, [patients, dateFmt]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return viewRows;
    return viewRows.filter((row) => row.searchBlob.includes(q));
  }, [searchQuery, viewRows]);

  const totals = useMemo(() => {
    const total = viewRows.length;
    const verified = viewRows.filter((x) => x.isVerified).length;
    const active = viewRows.filter((x) => x.isActive).length;
    return { total, verified, active };
  }, [viewRows]);

  const openModal = useCallback((row) => {
    setActivePatient(row);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">
            Patient Registry
          </h2>
          <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">
            Comprehensive patient accounts (tenant scoped)
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-3 bg-black text-white px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-800 transition-all duration-500"
          onClick={() => console.log("Register Patient (open modal / navigate)")}
        >
          <UserPlus size={16} />
          Register Patient
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest">
          <AlertCircle size={18} /> {error}
          <button
            onClick={() => {
              const controller = new AbortController();
              fetchPatients(controller.signal);
            }}
            className="ml-auto underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">
              Total Registry
            </p>
            <p className="text-xl font-semibold">{totals.total}</p>
          </div>
          <Activity className="text-black opacity-10" size={32} />
        </div>

        <div className="border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">
              Verified
            </p>
            <p className="text-xl font-semibold">{totals.verified}</p>
          </div>
          <ShieldCheck className="text-black opacity-10" size={32} />
        </div>

        <div className="border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">
              Active
            </p>
            <p className="text-xl font-semibold">{totals.active}</p>
          </div>
          <ShieldAlert className="text-black opacity-10" size={32} />
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, email, id..."
            className="w-full bg-white border border-gray-100 py-4 pl-12 pr-4 text-[10px] tracking-widest uppercase outline-none focus:border-black transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center opacity-20 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold">
              Synchronizing Registry...
            </p>
          </div>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((row) => (
            <div
              key={row.id}
              className="group bg-white border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-2xl hover:border-black/5 transition-all duration-500 cursor-pointer"
              onClick={() => openModal(row)}
            >
              <div className="flex items-center gap-6 lg:w-1/3">
                <div className="w-14 h-14 bg-gray-50 flex items-center justify-center font-serif italic text-lg text-gray-400 group-hover:bg-black group-hover:text-white transition-colors uppercase">
                  {row.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">
                    {row.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {row.email || "—"} • {row.createdAtStr}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-12 text-[10px] uppercase tracking-widest font-bold">
                <div className="hidden sm:block">
                  <p className="text-gray-300 mb-1 font-normal">Verified</p>
                  <p>{row.isVerified ? "YES" : "NO"}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-gray-300 mb-1 font-normal">Active</p>
                  <p>{row.isActive ? "YES" : "NO"}</p>
                </div>
                <div>
                  <p className="text-gray-300 mb-1 font-normal">User ID</p>
                  <p className="font-mono">{row.id.slice(-8)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:ml-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(row);
                  }}
                  className="flex items-center gap-2 bg-gray-50 px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold group-hover:bg-black group-hover:text-white transition-all"
                >
                  View File <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border border-dashed border-gray-100">
            <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">
              No records match your inquiry.
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && activePatient && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={closeModal}
        >
          <div
            className="w-full max-w-2xl bg-white border border-gray-200 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-gray-400">
                  Patient Profile
                </p>
                <h3 className="text-2xl font-light tracking-tight uppercase">
                  {activePatient.name}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
                  ID: {activePatient.id}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-50 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Full Name
                    </p>
                    <p className="text-sm font-medium">{activePatient.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Email
                    </p>
                    <p className="text-sm font-medium">
                      {activePatient.email || "---"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Contact
                    </p>
                    <p className="text-sm font-medium">
                      {activePatient.contact || "---"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Verified
                    </p>
                    <p className="text-sm font-medium">
                      {activePatient.isVerified ? "YES" : "NO"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ShieldAlert size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Active
                    </p>
                    <p className="text-sm font-medium">
                      {activePatient.isActive ? "YES" : "NO"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Created At
                    </p>
                    <p className="text-sm font-medium">{activePatient.createdAtStr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Tenant
                    </p>
                    <p className="text-sm font-medium font-mono">
                      {activePatient.tenantId ? String(activePatient.tenantId) : "NULL"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                Role: {activePatient.role}
              </span>
              <button
                onClick={closeModal}
                className="px-5 py-3 bg-black text-white text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
