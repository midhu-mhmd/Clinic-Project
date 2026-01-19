import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  UserPlus, Star, ShieldCheck, Mail, 
  Loader2, AlertCircle, X, CheckCircle2,
  Clock, GraduationCap, Briefcase, Edit3, Trash2 
} from "lucide-react";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null); // Track if we are editing
  
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    email: "",
    education: "",
    experience: "",
    availability: "", 
    status: "On Duty"
  });

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/tenants/doctors", {
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

  // --- NEW: EDIT INITIALIZATION ---
  const handleEditInit = (doc) => {
    setEditingId(doc._id);
    setFormData({
      name: doc.name,
      specialization: doc.specialization,
      email: doc.email,
      education: doc.education || "",
      experience: doc.experience || "",
      availability: doc.availability || "",
      status: doc.status || "On Duty"
    });
    setIsModalOpen(true);
  };

  // --- NEW: SOFT DELETE (OPTIMISTIC UI) ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this practitioner?")) return;
    
    const previousDoctors = [...doctors];
    // Optimistic Update: Remove from UI immediately
    setDoctors(doctors.filter(d => d._id !== id));

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tenants/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setError("Failed to archive record. Rolling back.");
      setDoctors(previousDoctors); // Rollback if server fails
    }
  };

  // --- UPDATED: HANDLE FORM SUBMISSION (ADD & EDIT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const baseUrl = "http://localhost:5000/api/tenants/doctors";
      
      let response;
      if (editingId) {
        // UPDATE MODE
        response = await axios.put(`${baseUrl}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // CREATE MODE
        response = await axios.post(baseUrl, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        setSuccessMsg(editingId ? "Record updated successfully." : "Practitioner record initialized.");
        setFormData({ name: "", specialization: "", email: "", education: "", experience: "", availability: "", status: "On Duty" });
        setEditingId(null);
        fetchDoctors(); 
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err) {
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
            setEditingId(null);
            setFormData({ name: "", specialization: "", email: "", education: "", experience: "", availability: "", status: "On Duty" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 bg-black text-white px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8DAA9D] transition-all shadow-xl hover:shadow-[#8DAA9D]/20"
        >
          <UserPlus size={16} /> Add Practitioner
        </button>
      </div>

      {/* MODAL (ADD & EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => !isSubmitting && setIsModalOpen(false)} 
          />
          
          <div className="relative bg-white w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 hover:rotate-90 transition-transform p-2"
            >
              <X size={20} />
            </button>

            {successMsg ? (
              <div className="py-12 flex flex-col items-center text-center">
                <CheckCircle2 size={48} className="text-[#8DAA9D] mb-4" />
                <p className="text-[10px] uppercase tracking-widest font-bold">{successMsg}</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-light tracking-tighter uppercase mb-8">
                  {editingId ? "Update Practitioner" : "Register Practitioner"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Full Name</label>
                    <input required className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm" placeholder="Dr. Sarah Jenkins" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Specialization</label>
                      <input required className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm" placeholder="Cardiology" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Status</label>
                      <select 
                        className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="On Duty">On Duty</option>
                        <option value="On Break">On Break</option>
                        <option value="Off Duty">Off Duty</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Education / Credentials</label>
                    <input className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm" placeholder="MD - Johns Hopkins University" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Years Experience</label>
                      <input type="number" className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm" placeholder="12" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Schedule</label>
                      <input required className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm" placeholder="09:00 AM - 05:00 PM" value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-bold mb-1 block text-gray-400">Professional Email</label>
                    <input required type="email" className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm" placeholder="doctor@clinic.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 mt-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#8DAA9D] disabled:bg-gray-400 transition-all flex justify-center items-center" >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : editingId ? "Save Changes" : "Initialize Record"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 border border-red-100 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest flex items-center gap-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* DOCTOR CARDS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white border border-gray-100 p-8 group hover:border-black transition-all duration-500 relative overflow-hidden flex flex-col justify-between">
            
            {/* HOVER ACTIONS (EDIT/DELETE) */}
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEditInit(doc)}
                className="p-2 bg-white border border-gray-100 hover:border-black shadow-sm transition-all"
              >
                <Edit3 size={14} className="text-gray-600" />
              </button>
              <button 
                onClick={() => handleDelete(doc._id)}
                className="p-2 bg-white border border-red-50 hover:bg-red-500 hover:text-white text-red-400 shadow-sm transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Top Section: Profile */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-gray-100 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img 
                    src={doc.image || `https://ui-avatars.com/api/?name=${doc.name}&background=f3f4f6&color=000`} 
                    alt={doc.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">{doc.name}</h3>
                  <p className="text-[10px] text-[#8DAA9D] uppercase tracking-widest font-bold mb-2">
                    {doc.specialization}
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-400">
                        <GraduationCap size={12} />
                        <span className="text-[10px] italic">{doc.education || "Medical Credentials"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Briefcase size={12} />
                        <span className="text-[10px] uppercase tracking-tighter font-bold">{doc.experience || "0"} Years Experience</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 text-[8px] uppercase tracking-tighter font-bold border ${getStatusStyles(doc.status)}`}>
                {doc.status || "Active"}
              </div>
            </div>

            {/* Middle Section: Availability */}
            <div className="mb-6 flex items-center gap-3 bg-[#FAF9F6] p-3 border border-gray-100">
              <Clock size={14} className="text-[#8DAA9D]" />
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-gray-400 font-bold">Clinical Hours</span>
                <span className="text-[11px] font-medium tracking-wide">
                  {doc.availability || "Standard Shift"}
                </span>
              </div>
            </div>

            {/* Bottom Section: Stats & Actions */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6 mt-auto">
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Queue Count</p>
                <p className="text-sm font-semibold">{doc.patientsCount || 0}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-black" />
                  <p className="text-sm font-semibold">{doc.rating || "5.0"}</p>
                </div>
              </div>
              <div className="flex justify-end items-end gap-2">
                <button 
                  onClick={() => window.location.href = `mailto:${doc.email}`}
                  className="p-2 border border-gray-100 hover:bg-black hover:text-white transition-colors"
                >
                  <Mail size={14} />
                </button>
                <button className="p-2 border border-gray-100 hover:bg-black hover:text-white transition-colors">
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