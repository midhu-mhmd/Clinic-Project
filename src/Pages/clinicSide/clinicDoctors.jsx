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

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API_DOCTORS = `${API_BASE}/api/doctors`;

/* =========================================================
    ✅ AUTH HELPERS
========================================================= */
const readAuthToken = () => {
  const t = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!t) return null;
  const clean = t.replace(/['"]+/g, "").trim();
  return clean && clean !== "undefined" ? clean : null;
};

const getAuthHeaders = () => {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
};

const normalizeApiError = (err) => {
  return err?.response?.data?.message || err?.message || "Protocol transaction failed.";
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  const fetchDoctors = useCallback(async (signal) => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers) throw new Error("Authentication required.");

      const { data } = await axios.get(API_DOCTORS, { signal, headers });
      if (data?.success) setDoctors(data.data || []);
    } catch (err) {
      if (err?.name !== "CanceledError") setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDoctors(controller.signal);
    return () => controller.abort();
  }, [fetchDoctors]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    setEditingId(doc._id);
    const [start, end] = (doc.availability || "09:00 - 17:00").split(" - ");
    setFormData({
      name: doc.name,
      specialization: doc.specialization,
      email: doc.email,
      education: doc.education || "",
      experience: doc.experience || "",
      availabilityStart: start,
      availabilityEnd: end,
      consultationFee: doc.consultationFee || "",
      status: doc.status || "On Duty",
    });
    setImagePreview(doc.image || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      const availabilityString = `${formData.availabilityStart} - ${formData.availabilityEnd}`;

      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (!['availabilityStart', 'availabilityEnd'].includes(key)) {
          fd.append(key, formData[key]);
        }
      });
      fd.append("availability", availabilityString);
      if (imageFile) fd.append("image", imageFile);

      const res = editingId 
        ? await axios.put(`${API_DOCTORS}/${editingId}`, fd, { headers })
        : await axios.post(API_DOCTORS, fd, { headers });

      if (res.data.success) {
        // ✅ Updated message to match backend invitation logic
        setSuccessMsg(editingId ? "Faculty record updated." : "Practitioner created & Invitation dispatched.");
        await fetchDoctors();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg("");
          resetForm();
        }, 1500);
      }
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this practitioner record?")) return;
    try {
      await axios.delete(`${API_DOCTORS}/${id}`, { headers: getAuthHeaders() });
      fetchDoctors();
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">Medical Faculty</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em]">
            Managing {doctors.length} Verified Clinical Specialists
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8DAA9D] transition-all"
        >
          <UserPlus size={16} /> Add Practitioner
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase tracking-widest flex items-center gap-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40">
          <div className="bg-white w-full max-w-md p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="absolute top-6 right-6 hover:rotate-90 transition-transform">
              <X size={20} />
            </button>

            {successMsg ? (
              <div className="py-12 flex flex-col items-center text-center">
                <CheckCircle2 size={48} className="text-[#8DAA9D] mb-4 animate-bounce" />
                <p className="text-[10px] uppercase tracking-widest font-bold">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden hover:border-black transition-colors"
                  >
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-300" />}
                  </div>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-2 font-bold">Profile Image</p>
                </div>

                {/* FORM FIELDS */}
                {[
                  { id: 'name', label: 'Full Name' },
                  { id: 'specialization', label: 'Specialization' },
                  { id: 'email', label: 'Professional Email' },
                  { id: 'education', label: 'Education' },
                ].map(field => (
                  <div key={field.id}>
                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">{field.label}</label>
                    <input
                      required={field.id !== 'education'}
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm"
                      value={formData[field.id]}
                      onChange={(e) => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">Experience (Yrs)</label>
                    <input
                      type="number"
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm"
                      value={formData.experience}
                      onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">Fee ($)</label>
                    <input
                      type="number"
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm font-mono"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData(p => ({ ...p, consultationFee: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">Duty Start</label>
                    <input type="time" className="w-full border-b border-gray-200 py-2 text-sm" value={formData.availabilityStart} onChange={(e) => setFormData(p => ({ ...p, availabilityStart: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">Duty End</label>
                    <input type="time" className="w-full border-b border-gray-200 py-2 text-sm" value={formData.availabilityEnd} onChange={(e) => setFormData(p => ({ ...p, availabilityEnd: e.target.value }))} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-5 mt-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#8DAA9D] disabled:bg-gray-400 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : (editingId ? "Update Faculty" : "Initialize Practitioner")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FACULTY GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white border border-gray-100 p-8 group hover:border-black transition-all duration-500 relative flex flex-col">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditInit(doc)} className="p-2 border border-gray-100 hover:border-black"><Edit3 size={14} /></button>
              <button onClick={() => handleDelete(doc._id)} className="p-2 border border-red-50 hover:bg-red-500 hover:text-white text-red-400"><Trash2 size={14} /></button>
            </div>

            <div className="flex gap-6 mb-6">
              <div className="w-20 h-20 bg-gray-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}`} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight">{doc.name}</h3>
                <p className="text-[10px] text-[#8DAA9D] uppercase tracking-widest font-bold mb-2">{doc.specialization}</p>
                <div className="flex flex-col gap-1 text-gray-400 text-[10px] uppercase tracking-tight">
                  <span className="flex items-center gap-2"><Clock size={12} /> {doc.availability}</span>
                  <span className="flex items-center gap-2"><DollarSign size={12} /> ${doc.consultationFee} Consultation</span>
                </div>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-3 gap-4 border-t border-gray-50 pt-6">
              <div className="text-[9px] uppercase tracking-widest text-gray-400">Exp <p className="text-sm font-semibold text-black">{doc.experience}Y</p></div>
              <div className="text-[9px] uppercase tracking-widest text-gray-400">Rating <div className="flex items-center gap-1 text-black"><Star size={12} className="fill-black" /> {doc.rating || "5.0"}</div></div>
              <div className="flex justify-end gap-2">
                <button onClick={() => window.location.href=`mailto:${doc.email}`} className="p-2 border hover:bg-black hover:text-white transition-colors"><Mail size={14} /></button>
                <button className="p-2 border hover:bg-black hover:text-white transition-colors"><ShieldCheck size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;