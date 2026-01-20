import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, Camera, CheckCircle2, AlertCircle } from "lucide-react";

const PublicProfile = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [clinicData, setClinicData] = useState({ name: "", address: "", isPublic: true, image: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/tenants/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClinicData({
          name: res.data.data.name,
          address: res.data.data.address,
          isPublic: res.data.data.settings?.isPublic ?? true,
          image: res.data.data.image,
        });
      } catch (err) {
        setMessage({ type: "error", text: "Sync failed." });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/tenants/update`, clinicData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: "Profile Updated" });
    } catch (err) {
      setMessage({ type: "error", text: "Update failed" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) return <div className="animate-pulse text-[10px] uppercase tracking-widest">Syncing Profile...</div>;

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      {/* Toast Feedback */}
      {message.text && (
        <div className={`fixed top-8 right-8 flex items-center gap-3 px-6 py-4 border ${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
          {message.type === "success" ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
          <span className="text-[10px] uppercase font-bold tracking-widest">{message.text}</span>
        </div>
      )}

      <div className="flex items-center gap-8">
        <div className="w-24 h-24 bg-gray-50 border relative group overflow-hidden">
          <img src={clinicData.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt="Clinic" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
            <Camera size={18} className="text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest">Institution Identity</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Updates reflect on public directory</p>
        </div>
      </div>

      <div className="grid gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Clinic Name</label>
          <input 
            className="w-full border p-4 text-xs outline-none focus:border-black transition-all"
            value={clinicData.name}
            onChange={(e) => setClinicData({...clinicData, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Physical Address</label>
          <textarea 
            rows="3"
            className="w-full border p-4 text-xs outline-none focus:border-black transition-all resize-none"
            value={clinicData.address}
            onChange={(e) => setClinicData({...clinicData, address: e.target.value})}
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3 hover:bg-[#8DAA9D] transition-all"
      >
        {isSaving ? "Synchronizing..." : <><Save size={16}/> Save Profile</>}
      </button>
    </div>
  );
};

export default PublicProfile;