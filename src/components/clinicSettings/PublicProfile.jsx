import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Save, Camera, CheckCircle2, AlertCircle, Loader2, Globe, MapPin } from "lucide-react";

// Added default empty function to prevent "is not a function" crash
const PublicProfile = ({ data, onProfileUpdate = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    image: "",
    settings: { isPublic: true },
    description: "",
    tags: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  // Sync state with the Database Model
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        address: data.address || "",
        image: data.image || "",
        settings: {
          isPublic: data.settings?.isPublic ?? true
        },
        description: data.description || "",
        tags: data.tags || []
      });
    }
  }, [data]);

  // Helper to show/hide messages automatically
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // --- Image Upload Handler ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return showMessage("error", "File too large (Max 2MB)");
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");
      
      const res = await axios.post("http://localhost:5000/api/tenants/upload-image", uploadData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "multipart/form-data" 
        },
        withCredentials: true // Important for CORS matching your backend
      });

      if (res.data.success) {
        const newImageUrl = res.data.imageUrl;
        
        // 1. Update local form state
        setFormData(prev => ({ ...prev, image: newImageUrl }));
        
        // 2. Update parent state (with safety check)
        if (typeof onProfileUpdate === "function") {
            onProfileUpdate({ ...data, image: newImageUrl });
        }
        
        showMessage("success", "Identity Image Updated");
      }
    } catch (err) {
      console.error("Upload Error Details:", err);
      if (!axios.isCancel(err)) {
        showMessage("error", err.response?.data?.message || "Network or CORS error");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Save Handler ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/tenants/update`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      if (typeof onProfileUpdate === "function") {
          onProfileUpdate(res.data.data);
      }
      showMessage("success", "Profile Synchronized");
    } catch (err) {
      showMessage("error", "Cloud sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Dynamic Toast */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 border shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === "success" ? "bg-black text-white border-white/10" : "bg-red-600 text-white border-none"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={16} className="text-emerald-400"/> : <AlertCircle size={16}/>}
          <span className="text-[10px] uppercase font-bold tracking-widest">{message.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-10 items-start mb-16 border-b border-gray-50 pb-12">
        <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current.click()}>
          <div className="w-32 h-32 bg-gray-50 border border-gray-100 overflow-hidden rounded-sm transition-all group-hover:border-black">
            {isUploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
              </div>
            ) : (
              <img 
                src={formData.image || "/default-clinic.png"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt="Logo" 
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
              <Camera size={20} className="text-white mb-1" />
              <span className="text-[8px] text-white font-bold uppercase tracking-tighter">Replace</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
        </div>

        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-serif italic text-gray-900">{formData.name || "Clinic Identity"}</h2>
          <div className="flex items-center gap-4 text-gray-400 text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-1"><MapPin size={12}/> {data.registrationId}</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold tracking-normal underline underline-offset-4 cursor-help">
              <Globe size={12}/> /{data.slug}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md pt-2 italic">
            "Authorized personnel only may modify the clinical identity and public accessibility settings."
          </p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Legal Clinic Name</label>
          <input 
            className="w-full border-b border-gray-100 py-3 text-sm outline-none focus:border-black transition-all font-light"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Directory Visibility</label>
          <div className="flex items-center gap-4 py-3">
            <button 
              onClick={() => setFormData({
                ...formData, 
                settings: { ...formData.settings, isPublic: !formData.settings.isPublic }
              })}
              className={`w-12 h-6 rounded-full transition-all relative ${formData.settings.isPublic ? 'bg-black' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.settings.isPublic ? 'left-7' : 'left-1'}`} />
            </button>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              {formData.settings.isPublic ? 'Visible to Public' : 'Private Mode'}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Physical Location</label>
          <textarea 
            rows="2"
            className="w-full border-b border-gray-100 py-3 text-sm outline-none focus:border-black transition-all resize-none font-light"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Clinic Description (Max 500 chars)</label>
          <textarea 
            maxLength={500}
            rows="3"
            className="w-full border border-gray-100 p-4 text-sm outline-none focus:border-black transition-all bg-gray-50/30 font-light"
            placeholder="Describe your medical excellence..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>

      <div className="mt-16">
        <button 
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="w-full md:w-auto px-12 bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-bold transition-all hover:bg-zinc-800 disabled:bg-gray-200 flex items-center justify-center gap-4"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Synchronizing..." : "Commit Changes"}
        </button>
      </div>
    </div>
  );
};

export default PublicProfile;