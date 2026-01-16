import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Save, Globe, Lock, Palette, BellRing, 
  CreditCard, Camera, AlertCircle, CheckCircle2 
} from "lucide-react";

const ClinicSettings = () => {
  const [activeSection, setActiveSection] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State for clinic data
  const [clinicData, setClinicData] = useState({
    name: "",
    address: "",
    email: "", // User contact email
    registrationId: "",
    isPublic: true,
    image: ""
  });

  const sections = [
    { id: "Profile", icon: <Globe size={16} />, label: "Public Profile" },
    { id: "Branding", icon: <Palette size={16} />, label: "Visual Identity" },
    { id: "Security", icon: <Lock size={16} />, label: "Security & Login" },
    { id: "Notifications", icon: <BellRing size={16} />, label: "Alerts" },
    { id: "Billing", icon: <CreditCard size={16} />, label: "Subscription" },
  ];

  // 1. Fetch Clinic Data on Mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        
        // Assuming your backend has this endpoint to get tenant by owner
        const res = await axios.get(`http://localhost:5000/api/tenants/owner/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setClinicData({
          name: res.data.name,
          address: res.data.address,
          registrationId: res.data.registrationId,
          isPublic: res.data.settings?.isPublic ?? true,
          image: res.data.image,
          email: user.email // From user record
        });
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load clinic settings." });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClinicData(prev => ({ ...prev, [name]: value }));
  };

  const togglePublic = () => {
    setClinicData(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  // 3. Handle Save to Backend
  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      const payload = {
        name: clinicData.name,
        address: clinicData.address,
        settings: { isPublic: clinicData.isPublic },
        image: clinicData.image
      };

      await axios.put(`http://localhost:5000/api/tenants/settings/${user.tenantId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: "Settings updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) return <div className="p-20 text-center uppercase tracking-widest text-xs animate-pulse">Initializing Environment...</div>;

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      {/* FEEDBACK OVERLAY */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 border animate-in slide-in-from-top-4 duration-300 ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="text-[10px] uppercase tracking-widest font-bold">{message.text}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-12 border-b border-gray-100">
        <div>
          <h2 className="text-3xl font-light tracking-tighter uppercase mb-2">Clinic Settings</h2>
          <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em]">Configure your clinical environment and branding</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8DAA9D] disabled:bg-gray-400 transition-all duration-500"
        >
          {isSaving ? <span className="animate-pulse">Processing...</span> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* SUB-NAVIGATION */}
        <aside className="lg:w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 text-[10px] uppercase tracking-widest transition-all ${
                activeSection === section.id 
                ? "bg-gray-50 text-black font-bold border-l-2 border-black" 
                : "text-gray-400 hover:text-black"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 max-w-2xl">
          {activeSection === "Profile" && (
            <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
              {/* Profile Image Section */}
              <div className="flex items-center gap-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 bg-gray-100 rounded-sm overflow-hidden border border-gray-100">
                    <img 
                      src={clinicData.image || "https://via.placeholder.com/200"} 
                      alt="Clinic" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1">Clinic Image</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                    This image will appear on the <br /> live directory list.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Clinic Display Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={clinicData.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-100 p-4 text-xs outline-none focus:border-black transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Clinical Address</label>
                  <textarea 
                    rows="3" 
                    name="address"
                    value={clinicData.address}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-100 p-4 text-xs outline-none focus:border-black transition-all resize-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Contact Email</label>
                    <input 
                      type="email" 
                      value={clinicData.email}
                      disabled
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-xs text-gray-400 outline-none cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Medical ID</label>
                    <input 
                      type="text" 
                      disabled 
                      value={clinicData.registrationId}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-xs text-gray-400" 
                    />
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1">Public Visibility</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Show your clinic in the public directory.</p>
                    </div>
                    <button 
                      onClick={togglePublic}
                      className={`w-12 h-6 rounded-full p-1 flex transition-all duration-300 ${clinicData.isPublic ? "bg-black justify-end" : "bg-gray-200 justify-start"}`}
                    >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                </div>
              </div>
            </div>
          )}

          {activeSection !== "Profile" && (
            <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-50 opacity-50 animate-in fade-in duration-500">
                <Palette className="mb-4 text-gray-300" size={32} />
                <p className="text-[10px] uppercase tracking-widest">The {activeSection} module <br />is currently being initialized.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicSettings;