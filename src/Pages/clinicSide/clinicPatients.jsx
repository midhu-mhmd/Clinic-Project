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
  Calendar,
  FileText,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const API_APPOINTMENTS = `${API_BASE}/api/appointments/my-appointments`;

/* =========================================================
   ✅ AUTH HELPERS (authToken-first)
========================================================= */
const cleanToken = (t) => {
  if (!t || typeof t !== "string") return null;
  const x = t.replace(/['"]+/g, "").trim();
  if (!x || x === "undefined" || x === "null") return null;
  return x;
};

const isValidJwt = (t) => {
  const x = cleanToken(t);
  if (!x) return false;
  return x.split(".").length === 3;
};

const readAuthToken = () => {
  const t1 = cleanToken(localStorage.getItem("authToken"));
  if (isValidJwt(t1)) return t1;

  const t2 = cleanToken(localStorage.getItem("token")); // legacy fallback
  if (isValidJwt(t2)) return t2;

  return null;
};

const getAuthHeaders = () => {
  const token = readAuthToken();
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
};

const normalizeApiError = (err) => {
  const status = err?.response?.status;
  const msg =
    err?.response?.data?.message ||
    err?.message ||
    "Failed to synchronize patient database.";

  if (status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    return "Session expired. Please login again.";
  }

  return msg;
};

const Patients = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // modal
  const [activePatient, setActivePatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    window.setTimeout(() => setActivePatient(null), 150);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, closeModal]);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    []
  );

  const normalizeAppointments = useCallback((payload) => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.appointments)) return payload.appointments;
    if (Array.isArray(payload)) return payload;
    return [];
  }, []);

  /**
   * ✅ We treat patientInfo snapshot as patient identity
   * because your patientId is the booking account (often same for all).
   */
  const resolvePatientFromAppointment = useCallback((app) => {
    const snap =
      app?.patientInfo && typeof app.patientInfo === "object"
        ? app.patientInfo
        : null;

    const name = (snap?.name || "").trim() || "Unknown";
    const email = (snap?.email || "").trim().toLowerCase() || "";
    const contact = (snap?.contact || snap?.phone || "").trim() || "";

    const symptoms =
      (snap?.symptoms || "").trim() ||
      String(app?.symptoms || app?.notes || app?.patientNotes || "").trim() ||
      "";

    return {
      name,
      email,
      contact,
      symptoms,
      hasSnapshot: Boolean(snap),
    };
  }, []);

  /**
   * ✅ Unique patient rows derived from patientInfo snapshot
   * Key priority: email > phone > name
   * If snapshot missing, keep unique per appointment to avoid collapsing.
   */
  const buildPatientRowsFromAppointments = useCallback(
    (appointments) => {
      const map = new Map();

      for (const app of appointments || []) {
        const patient = resolvePatientFromAppointment(app);

        const key = patient.hasSnapshot
          ? patient.email
            ? `email:${patient.email}`
            : patient.contact
            ? `phone:${patient.contact}`
            : `name:${patient.name}`
          : `missing:${app?._id || Math.random()}`;

        const createdAt = app?.createdAt ? new Date(app.createdAt).getTime() : 0;
        const dateTime = app?.dateTime ? new Date(app.dateTime).getTime() : 0;
        const seenAt = Math.max(createdAt, dateTime);

        const existing = map.get(key);

        if (!existing) {
          map.set(key, {
            id: key,
            name: patient.hasSnapshot ? patient.name : "Unknown (missing patientInfo)",
            email: patient.hasSnapshot ? patient.email : "",
            contact: patient.hasSnapshot ? patient.contact : "",
            symptoms: patient.symptoms || "",
            tenantId: app?.tenantId || null,
            firstSeenAt: seenAt || 0,
            lastSeenAt: seenAt || 0,
            createdAtStr: seenAt ? dateFmt.format(new Date(seenAt)) : "N/A",
          });
          continue;
        }

        const isNewer = seenAt > (existing.lastSeenAt || 0);

        map.set(key, {
          ...existing,
          contact: isNewer
            ? patient.contact || existing.contact
            : existing.contact || patient.contact,
          symptoms: isNewer
            ? patient.symptoms || existing.symptoms
            : existing.symptoms || patient.symptoms,
          tenantId: existing.tenantId || app?.tenantId || null,
          firstSeenAt: Math.min(existing.firstSeenAt || seenAt, seenAt || existing.firstSeenAt || 0),
          lastSeenAt: Math.max(existing.lastSeenAt || 0, seenAt || 0),
          createdAtStr:
            existing.firstSeenAt || seenAt
              ? dateFmt.format(
                  new Date(
                    Math.min(existing.firstSeenAt || seenAt, seenAt || existing.firstSeenAt || 0)
                  )
                )
              : "N/A",
        });
      }

      return Array.from(map.values()).sort(
        (a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0)
      );
    },
    [resolvePatientFromAppointment, dateFmt]
  );

  const fetchPatients = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);

        const headers = getAuthHeaders();
        if (!headers) {
          setRows([]);
          setError("AUTH_ERROR: Session missing. Please login again.");
          return;
        }

        const res = await axios.get(API_APPOINTMENTS, {
          signal,
          headers,
        });

        const appts = normalizeAppointments(res.data);
        const patientRows = buildPatientRowsFromAppointments(appts);
        setRows(patientRows);
      } catch (err) {
        if (axios.isCancel?.(err) || err?.name === "CanceledError") return;
        console.error("Fetch Patients Error:", err);
        setRows([]);
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [normalizeAppointments, buildPatientRowsFromAppointments]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPatients(controller.signal);
    return () => controller.abort();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rows;

    return rows.filter((p) => {
      const blob = [p.name, p.email, p.contact, p.id, p.tenantId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, searchQuery]);

  const totals = useMemo(() => {
    const total = rows.length;
    const withContact = rows.filter((x) => x.contact).length;
    const withSymptoms = rows.filter((x) => x.symptoms).length;
    return { total, withContact, withSymptoms };
  }, [rows]);

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
            Derived from appointment.patientInfo (snapshot)
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-3 bg-black text-white px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-800 transition-all duration-500"
          onClick={() => console.log("Register Patient")}
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
              Total Patients
            </p>
            <p className="text-xl font-semibold">{totals.total}</p>
          </div>
          <Activity className="text-black opacity-10" size={32} />
        </div>

        <div className="border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">
              With Contact
            </p>
            <p className="text-xl font-semibold">{totals.withContact}</p>
          </div>
          <Phone className="text-black opacity-10" size={32} />
        </div>

        <div className="border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">
              With Symptoms
            </p>
            <p className="text-xl font-semibold">{totals.withSymptoms}</p>
          </div>
          <FileText className="text-black opacity-10" size={32} />
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
            placeholder="Search by name, email, contact..."
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
          filteredPatients.map((p) => (
            <div
              key={p.id}
              className="group bg-white border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-2xl hover:border-black/5 transition-all duration-500 cursor-pointer"
              onClick={() => openModal(p)}
            >
              <div className="flex items-center gap-6 lg:w-1/3">
                <div className="w-14 h-14 bg-gray-50 flex items-center justify-center font-serif italic text-lg text-gray-400 group-hover:bg-black group-hover:text-white transition-colors uppercase">
                  {p.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {p.email || "—"} {p.contact ? `• ${p.contact}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-12 text-[10px] uppercase tracking-widest font-bold">
                <div className="hidden sm:block">
                  <p className="text-gray-300 mb-1 font-normal">First Seen</p>
                  <p className="font-mono">{p.createdAtStr || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:ml-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(p);
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
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-gray-400">
                  Patient Profile
                </p>
                <h3 className="text-2xl font-light tracking-tight uppercase">
                  {activePatient.name}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
                  Key: {String(activePatient.id)}
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
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      First Seen
                    </p>
                    <p className="text-sm font-medium">
                      {activePatient.createdAtStr || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Symptoms / Notes
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {activePatient.symptoms || "---"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                Source: patientInfo snapshot
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
