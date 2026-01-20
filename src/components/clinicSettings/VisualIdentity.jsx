import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Palette, Camera, Layout, CheckCircle2, 
  AlertCircle, RefreshCcw, Eye 
} from "lucide-react";

const VisualIdentity = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State for visual settings
  const [branding, setBranding] = useState({
    primaryColor: "#000000",
    accentColor: "#8DAA9D",
    bannerImage: "",
    logo: "",
    fontPreference: "Serif"
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/tenants/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Map backend settings to state
        if (res.data.data.settings?.branding) {
          setBranding(res.data.data.settings.branding);
        }
      } catch (err) {
        console.error("Branding sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/tenants/update", 
        { settings: { branding } }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: "Identity Synchronized" });
    } catch (err) {
      setMessage({ type: "error", text: "Update failed" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) return <div className="animate-pulse text-[10px] uppercase tracking-widest">Loading Palette...</div>;

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      {/* Toast Feedback */}
      {message.text && (
        <div className={`fixed top-8 right-8 flex items-center gap-3 px-6 py-4 border z-50 ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
          <span className="text-[10px] uppercase font-bold tracking-widest">{message.text}</span>
        </div>
      )}

      {/* Hero Banner Preview */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Layout size={14}/> Hero Banner
          </h4>
          <button className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-1">
            <RefreshCcw size={10}/> Change Image
          </button>
        </div>
        <div className="w-full h-48 bg-gray-100 border relative group overflow-hidden">
          {branding.bannerImage ? (
            <img src={branding.bannerImage} className="w-full h-full object-cover" alt="Banner" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Camera size={24} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
            <p className="text-white text-[10px] uppercase tracking-widest font-bold">Upload High-Res Banner</p>
          </div>
        </div>
      </section>

      {/* Color Palette Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-50">
        <div className="space-y-6">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Palette size={14}/> Color System
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tight">Primary Brand Color</p>
                <p className="text-[9px] text-gray-400 uppercase">Used for headers and buttons</p>
              </div>
              <input 
                type="color" 
                value={branding.primaryColor}
                onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                className="w-8 h-8 rounded-full border-none cursor-pointer" 
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tight">Accent Tone</p>
                <p className="text-[9px] text-gray-400 uppercase">Used for highlights and badges</p>
              </div>
              <input 
                type="color" 
                value={branding.accentColor}
                onChange={(e) => setBranding({...branding, accentColor: e.target.value})}
                className="w-8 h-8 rounded-full border-none cursor-pointer" 
              />
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-gray-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400">Live Component Preview</p>
          <div className="bg-white p-6 shadow-sm border w-full max-w-[200px]">
            <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ backgroundColor: branding.primaryColor }}></div>
            <div className="h-2 w-16 bg-gray-100 mx-auto mb-4"></div>
            <button 
              className="w-full py-2 text-[8px] uppercase tracking-widest font-bold text-white transition-colors"
              style={{ backgroundColor: branding.accentColor }}
            >
              Book Now
            </button>
          </div>
          <p className="text-[9px] text-gray-400 italic">How your clinic appears to patients.</p>
        </div>
      </section>

      {/* Typography Preference */}
      <section className="pt-8 border-t border-gray-50">
         <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6">Interface Typography</h4>
         <div className="grid grid-cols-2 gap-4">
            {['Serif', 'Sans-Serif'].map((font) => (
              <button
                key={font}
                onClick={() => setBranding({...branding, fontPreference: font})}
                className={`p-6 border text-left transition-all ${
                  branding.fontPreference === font ? "border-black bg-gray-50" : "border-gray-100 text-gray-400"
                }`}
              >
                <p className={`text-xl mb-2 ${font === 'Serif' ? 'font-serif italic' : 'font-sans'}`}>Aa</p>
                <p className="text-[10px] uppercase tracking-widest">{font} Interface</p>
              </button>
            ))}
         </div>
      </section>

      <div className="pt-12">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3 hover:opacity-80 transition-all disabled:bg-gray-300"
        >
          {isSaving ? "Saving Identity..." : <><Eye size={16}/> Preview & Publish</>}
        </button>
      </div>
    </div>
  );
};

export default VisualIdentity;