import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  UserPlus,
  Star,
  ShieldCheck,
  Mail,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Edit3,
  Trash2,
  Camera,
  Clock,
  DollarSign,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const API_DOCTORS = `${API_BASE}/api/doctors`;

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

  const t2 = cleanToken(localStorage.getItem("token")); // legacy
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
    "Request failed. Please try again.";

  if (status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    return "Session expired. Please login again.";
  }

  return msg;
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ✅ Matches schema
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    email: "",
    education: "",
    experience: "",
    availabilityStart: "09:00",
    availabilityEnd: "17:00",
    consultationFee: "",
    status: "On Duty",
  });

  /* =========================================================
     ✅ Fetch Doctors
  ========================================================= */
  const fetchDoctors = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        setDoctors([]);
        setError("AUTH_ERROR: Session missing. Please login again.");
        return;
      }

      const { data } = await axios.get(API_DOCTORS, {
        signal,
        headers,
      });

      if (data?.success) setDoctors(Array.isArray(data.data) ? data.data : []);
      else setDoctors([]);
    } catch (err) {
      if (err?.name === "CanceledError") return;
      setError(normalizeApiError(err));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDoctors(controller.signal);
    return () => controller.abort();
  }, [fetchDoctors]);

  /* =========================================================
     ✅ Image preview (fix memory leak)
  ========================================================= */
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // cleanup previous blob URL
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      specialization: "",
      email: "",
      education: "",
      experience: "",
      availabilityStart: "09:00",
      availabilityEnd: "17:00",
      consultationFee: "",
      status: "On Duty",
    });
    setImageFile(null);

    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);

    setError(null);
  };

  const handleEditInit = (doc) => {
    setError(null);
    setSuccessMsg("");
    setEditingId(doc?._id);

    const [start, end] = doc?.availability
      ? String(doc.availability).split(" - ")
      : ["09:00", "17:00"];

    setFormData({
      name: doc?.name || "",
      specialization: doc?.specialization || "",
      email: doc?.email || "",
      education: doc?.education || "",
      experience: doc?.experience ?? "",
      availabilityStart: start || "09:00",
      availabilityEnd: end || "17:00",
      consultationFee: doc?.consultationFee ?? "",
      status: doc?.status || "On Duty",
    });

    // existing image URL (not blob)
    setImageFile(null);
    setImagePreview(doc?.image || null);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSuccessMsg("");
    resetForm();
  };

  /* =========================================================
     ✅ Delete
  ========================================================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this practitioner?")) return;

    try {
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        setError("AUTH_ERROR: Session missing. Please login again.");
        return;
      }

      await axios.delete(`${API_DOCTORS}/${id}`, { headers });
      await fetchDoctors();
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  /* =========================================================
     ✅ Submit (Create / Update)
  ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("AUTH_ERROR: Session missing. Please login again.");

      // basic validation
      if (!String(formData.name || "").trim()) throw new Error("Name is required.");
      if (!String(formData.specialization || "").trim()) throw new Error("Specialization is required.");
      if (!String(formData.email || "").trim()) throw new Error("Email is required.");

      const availabilityString = `${formData.availabilityStart} - ${formData.availabilityEnd}`;

      const fd = new FormData();
      fd.append("name", String(formData.name).trim());
      fd.append("specialization", String(formData.specialization).trim());
      fd.append("email", String(formData.email).trim().toLowerCase());
      fd.append("education", String(formData.education || "").trim());
      fd.append("experience", String(Number(formData.experience || 0)));
      fd.append("availability", availabilityString);
      fd.append("consultationFee", String(Number(formData.consultationFee || 0)));
      fd.append("status", String(formData.status || "On Duty"));

      if (imageFile) fd.append("image", imageFile);

      const config = {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = editingId
        ? await axios.put(`${API_DOCTORS}/${editingId}`, fd, config)
        : await axios.post(API_DOCTORS, fd, config);

      if (response.data?.success) {
        setSuccessMsg(editingId ? "Record updated." : "Record initialized.");
        await fetchDoctors();

        window.setTimeout(() => {
          closeModal();
        }, 900);
      } else {
        throw new Error(response.data?.message || "Transaction failed.");
      }
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "on duty":
        return "border-green-100 text-green-600 bg-green-50";
      case "on break":
        return "border-amber-100 text-amber-600 bg-amber-50";
      case "off duty":
        return "border-gray-100 text-gray-500 bg-gray-50";
      default:
        return "border-gray-100 text-gray-400 bg-gray-50";
    }
  };

  const fieldLabels = useMemo(
    () => ({
      name: "Name",
      specialization: "Specialization",
      email: "Email",
      education: "Education",
      experience: "Experience (Years)",
    }),
    []
  );

  if (loading)
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#8DAA9D]" size={32} />
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
          Syncing Faculty Records...
        </p>
      </div>
    );

  return (
    <div className="p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">
            Medical Faculty
          </h2>
          <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">
            Manage clinical practitioners for {doctors.length} active staff
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 bg-black text-white px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8DAA9D] transition-all shadow-xl"
        >
          <UserPlus size={16} /> Add Practitioner
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-8 p-4 border border-red-100 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest flex items-center gap-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 hover:rotate-90 transition-transform p-2"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>

            {successMsg ? (
              <div className="py-12 flex flex-col items-center text-center">
                <CheckCircle2 size={48} className="text-[#8DAA9D] mb-4" />
                <p className="text-[10px] uppercase tracking-widest font-bold">
                  {successMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-black"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera
                        size={24}
                        className="text-gray-300 group-hover:text-black"
                      />
                    )}
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-2 font-bold">
                    Profile Image
                  </p>
                </div>

                {["name", "specialization", "email", "education", "experience"].map(
                  (key) => (
                    <div key={key}>
                      <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">
                        {fieldLabels[key] || key}
                      </label>
                      <input
                        type={key === "experience" ? "number" : "text"}
                        required={key !== "education"} // education optional
                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm"
                        value={formData[key]}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, [key]: e.target.value }))
                        }
                      />
                    </div>
                  )
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">
                      Duty Start
                    </label>
                    <input
                      type="time"
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm"
                      value={formData.availabilityStart}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          availabilityStart: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">
                      Duty End
                    </label>
                    <input
                      type="time"
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm"
                      value={formData.availabilityEnd}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          availabilityEnd: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">
                    Consultation Fee ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm font-mono"
                    placeholder="0"
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        consultationFee: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">
                    Status
                  </label>
                  <select
                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="On Break">On Break</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-5 mt-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#8DAA9D] disabled:bg-gray-400 flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Initialize Record"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc._id}
            className="bg-white border border-gray-100 p-8 group hover:border-black transition-all duration-500 relative flex flex-col justify-between"
          >
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleEditInit(doc)}
                className="p-2 border border-gray-100 hover:border-black shadow-sm"
                title="Edit"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => handleDelete(doc._id)}
                className="p-2 border border-red-50 hover:bg-red-500 hover:text-white text-red-400"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex gap-6 mb-6">
              <div className="w-20 h-20 bg-gray-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img
                  src={doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || "Doctor")}`}
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight">
                  {doc.name}
                </h3>
                <p className="text-[10px] text-[#8DAA9D] uppercase tracking-widest font-bold mb-2">
                  {doc.specialization}
                </p>

                <div className="flex flex-col gap-1 text-gray-400 text-[10px] uppercase tracking-tight">
                  <span className="flex items-center gap-2">
                    <Clock size={12} /> {doc.availability || "09:00 - 17:00"}
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign size={12} /> ${doc.consultationFee || "0"} Consultation
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`px-3 py-1 text-[8px] uppercase tracking-tighter font-bold border self-start mb-4 ${getStatusStyles(
                doc.status
              )}`}
            >
              {doc.status}
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6 mt-auto">
              <div className="text-[9px] uppercase tracking-widest text-gray-400">
                Experience
                <p className="text-sm font-semibold text-black">
                  {Number(doc.experience || 0)}Y
                </p>
              </div>

              <div className="text-[9px] uppercase tracking-widest text-gray-400">
                Rating
                <div className="flex items-center gap-1 text-black">
                  <Star size={12} className="fill-black" /> {doc.rating || "5.0"}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => (window.location.href = `mailto:${doc.email}`)}
                  className="p-2 border hover:bg-black hover:text-white transition-colors"
                  title="Email"
                >
                  <Mail size={14} />
                </button>

                <button
                  className="p-2 border hover:bg-black hover:text-white transition-colors"
                  title="Verify"
                >
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
