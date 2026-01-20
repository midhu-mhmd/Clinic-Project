import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  UserPlus, Star, ShieldCheck, Mail, 
  Loader2, AlertCircle, X, CheckCircle2,
  GraduationCap, Briefcase, Edit3, Trash2,
  Camera
} from "lucide-react";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null); 

  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    email: "",
    education: "",
    experience: "",
    availability: "", 
    status: "On Duty"
  });

  // FIX: Updated URL to match app.js mounting point (/api/doctors)
  const API_BASE_URL = "http://localhost:5000/api/doctors";

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setDoctors(data.data);
    } catch (err) {
      setError("Failed to synchronize medical faculty data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      name: "", specialization: "", email: "", 
      education: "", experience: "", availability: "", status: "On Duty" 
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError(null);
  };

  const handleEditInit = (doc) => {
    setError(null);
    setEditingId(doc._id); // Ensure MongoDB _id is used
    setFormData({
      name: doc.name || "",
      specialization: doc.specialization || "",
      email: doc.email || "",
      education: doc.education || "",
      experience: doc.experience || "",
      availability: doc.availability || "",
      status: doc.status || "On Duty"
    });
    setImagePreview(doc.image || null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this practitioner?")) return;
    const previousDoctors = [...doctors];
    setDoctors(doctors.filter(d => d._id !== id));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setError("Failed to archive record. Rolling back.");
      setDoctors(previousDoctors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      
      // Append fields and ensure correct types
      Object.keys(formData).forEach((key) => {
        const value = key === "experience" ? Number(formData[key]) : formData[key];
        data.append(key, value);
      });

      if (imageFile) {
        data.append("image", imageFile);
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      };

      let response;
      if (editingId) {
        // PUT request to /api/doctors/:id
        response = await axios.put(`${API_BASE_URL}/${editingId}`, data, config);
      } else {
        // POST request to /api/doctors
        response = await axios.post(API_BASE_URL, data, config);
      }

      if (response.data.success) {
        setSuccessMsg(editingId ? "Record updated successfully." : "Practitioner record initialized.");
        await fetchDoctors();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg("");
          resetForm();
        }, 1500);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setError(err.response?.data?.message || "Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "on duty": return "border-green-100 text-green-600 bg-green-50";
      case "on break": return "border-amber-100 text-amber-600 bg-amber-50";
      default: return "border-gray-100 text-gray-400 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#8DAA9D]" size={32} />
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Syncing Faculty Records...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">Medical Faculty</h2>
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 hover:rotate-90 transition-transform p-2">
              <X size={20} />
            </button>

            {successMsg ? (
              <div className="py-12 flex flex-col items-center text-center">
                <CheckCircle2 size={48} className="text-[#8DAA9D] mb-4" />
                <p className="text-[10px] uppercase tracking-widest font-bold">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="group relative w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-black"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-gray-300 group-hover:text-black" />
                    )}
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-2 font-bold">Profile Image</p>
                </div>

                {Object.keys(formData).filter(k => k !== 'status').map((key) => (
                  <div key={key}>
                    <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">{key}</label>
                    <input 
                      type={key === "experience" ? "number" : "text"} 
                      required={["name", "specialization", "email"].includes(key)}
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm" 
                      value={formData[key]} 
                      onChange={(e) => setFormData({...formData, [key]: e.target.value})} 
                    />
                  </div>
                ))}

                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Status</label>
                  <select className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="On Duty">On Duty</option>
                    <option value="On Break">On Break</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 mt-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#8DAA9D] disabled:bg-gray-400 flex justify-center items-center" >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : editingId ? "Save Changes" : "Initialize Record"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-8 p-4 border border-red-100 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest flex items-center gap-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white border border-gray-100 p-8 group hover:border-black transition-all duration-500 relative flex flex-col justify-between">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => handleEditInit(doc)} className="p-2 border border-gray-100 hover:border-black shadow-sm">
                <Edit3 size={14} className="text-gray-600" />
              </button>
              <button onClick={() => handleDelete(doc._id)} className="p-2 border border-red-50 hover:bg-red-500 hover:text-white text-red-400">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex gap-6 mb-6">
              <div className="w-20 h-20 bg-gray-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={doc.image || `https://ui-avatars.com/api/?name=${doc.name}`} alt={doc.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight">{doc.name}</h3>
                <p className="text-[10px] text-[#8DAA9D] uppercase tracking-widest font-bold mb-2">{doc.specialization}</p>
                <div className="flex flex-col gap-1 text-gray-400 text-[10px]">
                  <span className="flex items-center gap-2"><GraduationCap size={12}/> {doc.education}</span>
                  <span className="flex items-center gap-2"><Briefcase size={12}/> {doc.experience} Years</span>
                </div>
              </div>
            </div>

            <div className={`px-3 py-1 text-[8px] uppercase tracking-tighter font-bold border self-start mb-4 ${getStatusStyles(doc.status)}`}>
              {doc.status}
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6 mt-auto">
              <div className="text-[9px] uppercase tracking-widest text-gray-400">Queue <p className="text-sm font-semibold text-black">{doc.patientsCount || 0}</p></div>
              <div className="text-[9px] uppercase tracking-widest text-gray-400">Rating <div className="flex items-center gap-1 text-black"><Star size={12} className="fill-black"/> {doc.rating || "5.0"}</div></div>
              <div className="flex justify-end gap-2">
                <button onClick={() => window.location.href = `mailto:${doc.email}`} className="p-2 border hover:bg-black hover:text-white transition-colors"><Mail size={14} /></button>
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