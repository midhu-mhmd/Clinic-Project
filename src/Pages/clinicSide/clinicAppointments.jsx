import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  ChevronRight,
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  Stethoscope,
  Save,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const API = `${API_BASE}/api`;

/* =========================================================
   ✅ AUTH HELPERS (fix: uses authToken, not token)
========================================================= */
const cleanToken = (t) => {
  if (!t || typeof t !== "string") return null;
  const x = t.replace(/['"]+/g, "").trim(); // removes accidental quotes
  if (!x || x === "undefined" || x === "null") return null;
  return x;
};

const isValidJwt = (t) => {
  const x = cleanToken(t);
  if (!x) return false;
  return x.split(".").length === 3;
};

const readAuthToken = () => {
  // ✅ final session token
  const t1 = cleanToken(localStorage.getItem("authToken"));
  if (isValidJwt(t1)) return t1;

  // fallback (legacy)
  const t2 = cleanToken(localStorage.getItem("token"));
  if (isValidJwt(t2)) return t2;

  return null;
};

const getAuthHeaders = () => {
  const token = readAuthToken();
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // modal state
  const [activeRow, setActiveRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // modal edit state (UI only for now except status)
  const [editForm, setEditForm] = useState({
    status: "PENDING",
    dateTimeLocal: "",
    consultationFee: "",
    symptoms: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    window.setTimeout(() => {
      setActiveRow(null);
      setSaveError("");
      setSaving(false);
    }, 160);
  }, []);

  // close on ESC
  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, closeModal]);

  const makeShortRef = useCallback((id) => {
    if (!id) return "APT";
    return `APT-${String(id).slice(-5).toUpperCase()}`;
  }, []);

  const formatMoney = useCallback((n) => {
    const num = Number(n);
    if (Number.isNaN(num) || num < 0) return "0.00";
    return num.toFixed(2);
  }, []);

  const getStatusStyle = useCallback((status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "CONFIRMED") return "bg-green-50 text-green-700 border-green-200";
    if (s === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
    if (s === "COMPLETED") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  }, []);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    []
  );

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const normalizeAppointments = useCallback((payload) => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.appointments)) return payload.appointments;
    if (Array.isArray(payload)) return payload;
    return [];
  }, []);

  const fetchAppointments = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);

        const headers = getAuthHeaders();
        if (!headers) {
          setError("AUTH_ERROR: Session missing. Please login again.");
          setAppointments([]);
          return;
        }

        const res = await axios.get(`${API}/appointments/my-appointments`, {
          signal,
          headers: {
            ...headers,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const list = normalizeAppointments(res.data);

        const sorted = [...list].sort((a, b) => {
          const ta = a?.dateTime ? new Date(a.dateTime).getTime() : 0;
          const tb = b?.dateTime ? new Date(b.dateTime).getTime() : 0;
          return tb - ta;
        });

        setAppointments(sorted);
      } catch (err) {
        if (err?.name === "CanceledError") return;

        console.error("Appointments fetch error:", err);

        const status = err?.response?.status;
        if (status === 401) {
          // optional: clean expired token keys
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          setError("Session expired. Please login again.");
        } else {
          setError(err.response?.data?.message || err.message || "Network Error");
        }

        setAppointments([]);
      } finally {
        setLoading(false);
      }
    },
    [normalizeAppointments]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAppointments(controller.signal);
    return () => controller.abort();
  }, [fetchAppointments]);

  // patient resolver
  const resolvePatient = useCallback((app) => {
    const snapshot =
      app?.patientInfo && typeof app.patientInfo === "object"
        ? app.patientInfo
        : null;

    const fromPopulate =
      app?.patientId && typeof app.patientId === "object" ? app.patientId : null;

    const name =
      snapshot?.name ||
      fromPopulate?.name ||
      app?.patientName ||
      app?.name ||
      "Unknown";

    const email =
      snapshot?.email ||
      fromPopulate?.email ||
      app?.patientEmail ||
      app?.email ||
      "";

    const contact =
      snapshot?.contact ||
      fromPopulate?.phone ||
      fromPopulate?.contact ||
      app?.patientContact ||
      app?.contact ||
      "";

    const symptoms =
      snapshot?.symptoms ||
      app?.symptoms ||
      app?.notes ||
      app?.patientNotes ||
      "";

    return {
      name,
      email,
      contact,
      symptoms,
      patientId: fromPopulate?._id || app?.patientId || null,
    };
  }, []);

  const viewRows = useMemo(() => {
    return (appointments || []).map((app) => {
      const id = app?._id || "";
      const ref = makeShortRef(id);

      const patient = resolvePatient(app);

      const doctorName = app?.doctorId?.name || "Unassigned";
      const specialization =
        app?.doctorId?.specialization || app?.doctorId?.specialty || "Faculty";

      const rawDate = app?.dateTime ? new Date(app.dateTime) : null;
      const validDate = rawDate && !Number.isNaN(rawDate.getTime());

      const dateStr = validDate ? dateFmt.format(rawDate) : "N/A";
      const timeStr = validDate ? timeFmt.format(rawDate) : "--:--";

      const status = (app?.status || "PENDING").toUpperCase();
      const fee = formatMoney(app?.consultationFee);

      const searchBlob = [
        patient.name,
        patient.email,
        patient.contact,
        patient.symptoms,
        doctorName,
        specialization,
        id,
        ref,
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return {
        app,
        id,
        ref,
        patient,
        doctorName,
        specialization,
        dateStr,
        timeStr,
        status,
        fee,
        searchBlob,
      };
    });
  }, [appointments, makeShortRef, resolvePatient, dateFmt, timeFmt, formatMoney]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return viewRows;
    return viewRows.filter((row) => row.searchBlob.includes(q));
  }, [viewRows, searchTerm]);

  // helper to set datetime-local
  const toDatetimeLocal = useCallback((iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, []);

  const openPatientModal = useCallback(
    (row) => {
      setActiveRow(row);
      setIsModalOpen(true);
      setSaveError("");

      const app = row?.app || {};
      const patient = row?.patient || {};

      setEditForm({
        status: (app?.status || "PENDING").toUpperCase(),
        dateTimeLocal: toDatetimeLocal(app?.dateTime),
        consultationFee:
          app?.consultationFee !== undefined && app?.consultationFee !== null
            ? String(app.consultationFee)
            : "",
        symptoms: String(patient?.symptoms || ""),
      });
    },
    [toDatetimeLocal]
  );

  /**
   * ✅ FIX: use authToken + sanitize header
   * PATCH /appointments/:id/status
   */
  const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("AUTH_ERROR: Session missing. Please login again.");

    const res = await axios.patch(
      `${API}/appointments/${appointmentId}/status`,
      { status },
      { headers }
    );

    return res.data?.data; // updated appointment
  }, []);

  const onSave = useCallback(async () => {
    if (!activeRow?.id) return;

    try {
      setSaving(true);
      setSaveError("");

      const status = (editForm.status || "PENDING").toUpperCase();
      const allowed = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
      if (!allowed.includes(status)) {
        setSaveError("Invalid status value.");
        return;
      }

      const updated = await updateAppointmentStatus(activeRow.id, status);

      setAppointments((prev) =>
        prev.map((a) =>
          String(a?._id) === String(activeRow.id)
            ? { ...a, ...(updated || {}), status }
            : a
        )
      );

      setActiveRow((prev) =>
        prev
          ? {
              ...prev,
              status,
              app: { ...prev.app, ...(updated || {}), status },
            }
          : prev
      );

      closeModal();
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
      }
      setSaveError(e?.response?.data?.message || e.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }, [activeRow, editForm.status, updateAppointmentStatus, closeModal]);

  return (
    <div className="p-8 lg:p-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-light tracking-tighter uppercase">
            Appointments Registry
          </h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">
            {loading ? "Syncing..." : `Records found: ${filteredRows.length}`}
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-4 bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gray-800 transition-all shadow-xl"
          onClick={() => console.log("Initialize new appointment")}
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
            onClick={() => {
              const controller = new AbortController();
              fetchAppointments(controller.signal);
            }}
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
            placeholder="Search by patient / doctor / email / status / symptoms / id..."
            className="w-full bg-white border border-gray-200 py-5 pl-14 pr-6 text-[10px] tracking-[0.2em] uppercase outline-none focus:border-black transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
                Reference / Patient
              </th>
              <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
                Contact
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
                <td colSpan="7" className="p-20 text-center">
                  <Loader2
                    className="animate-spin inline-block mb-2 opacity-20"
                    size={30}
                  />
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">
                    Fetching...
                  </p>
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr
                  key={row.id || row.ref}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td
                    className="p-6 cursor-pointer"
                    onClick={() => openPatientModal(row)}
                    title="View / Edit appointment"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-[10px] font-bold">
                        {row.ref.slice(-2)}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase">
                          {row.patient.name}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono">
                          {row.patient.email ? row.patient.email : row.ref}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-6">
                    <p className="text-[11px] uppercase text-gray-700">
                      {row.patient.contact || "---"}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase">
                      {row.patient.symptoms
                        ? row.patient.symptoms.slice(0, 28) +
                          (row.patient.symptoms.length > 28 ? "..." : "")
                        : "No notes"}
                    </p>
                  </td>

                  <td className="p-6">
                    <p className="text-[11px] uppercase text-gray-600">
                      Dr. {row.doctorName}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase">
                      {row.specialization}
                    </p>
                  </td>

                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] text-gray-900 font-medium">
                        <CalendarIcon size={12} className="text-gray-400" />
                        {row.dateStr}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase">
                        <Clock size={12} /> {row.timeStr}
                      </div>
                    </div>
                  </td>

                  <td className="p-6">
                    <span
                      className={`px-3 py-1 border text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="p-6 font-mono text-xs">${row.fee}</td>

                  <td className="p-6 text-right">
                    <button
                      className="inline-flex items-center justify-center p-2 hover:bg-gray-50"
                      onClick={() => openPatientModal(row)}
                      title="Open details"
                    >
                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-black transition-colors"
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="p-20 text-center opacity-30 text-[10px] uppercase font-bold tracking-widest"
                >
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && activeRow && (
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
                  Appointment Editor
                </p>
                <h3 className="text-2xl font-light tracking-tight uppercase">
                  {activeRow.patient.name}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
                  {activeRow.ref} • ID: {activeRow.id}
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

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LEFT */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Patient
                    </p>
                    <p className="text-sm font-medium">{activeRow.patient.name || "---"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Email
                    </p>
                    <p className="text-sm font-medium">{activeRow.patient.email || "---"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Contact
                    </p>
                    <p className="text-sm font-medium">{activeRow.patient.contact || "---"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Stethoscope size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                      Doctor
                    </p>
                    <p className="text-sm font-medium">
                      Dr. {activeRow.doctorName} • {activeRow.specialization}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-5">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Status (Only this saves now)
                  </p>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-200 px-4 py-3 text-[10px] uppercase tracking-widest outline-none focus:border-black"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Date & Time (UI only)
                  </p>
                  <input
                    type="datetime-local"
                    value={editForm.dateTimeLocal}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, dateTimeLocal: e.target.value }))
                    }
                    className="w-full border border-gray-200 px-4 py-3 text-[10px] tracking-widest outline-none focus:border-black"
                  />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Consultation Fee (UI only)
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editForm.consultationFee}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, consultationFee: e.target.value }))
                    }
                    className="w-full border border-gray-200 px-4 py-3 text-[10px] tracking-widest outline-none focus:border-black"
                    placeholder="150"
                  />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Symptoms / Notes (UI only)
                  </p>
                  <textarea
                    rows={4}
                    value={editForm.symptoms}
                    onChange={(e) => setEditForm((p) => ({ ...p, symptoms: e.target.value }))}
                    className="w-full border border-gray-200 px-4 py-3 text-[10px] tracking-widest outline-none focus:border-black"
                    placeholder="Enter symptoms..."
                  />
                </div>

                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] uppercase tracking-widest font-bold">
                    {saveError}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <span
                className={`px-3 py-1 border text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(
                  editForm.status
                )}`}
              >
                {editForm.status}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-3 bg-gray-50 text-black text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-gray-100 transition"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  onClick={onSave}
                  className="px-6 py-3 bg-black text-white text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-gray-800 transition inline-flex items-center gap-2 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Saving
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
