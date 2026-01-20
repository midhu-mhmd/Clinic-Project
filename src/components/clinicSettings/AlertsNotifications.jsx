import React, { useState } from "react";
import axios from "axios";
import { 
  BellRing, Mail, Smartphone, BellOff, 
  Stethoscope, Calendar, CreditCard, ShieldAlert,
  Save, CheckCircle2
} from "lucide-react";

const AlertsNotifications = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Grouped notification settings
  const [prefs, setPrefs] = useState({
    patientBookings: { email: true, push: true },
    appointmentReminders: { email: true, push: false },
    billingAlerts: { email: true, push: true },
    securityLogs: { email: true, push: true },
    marketingUpdates: { email: false, push: false }
  });

  const togglePref = (category, channel) => {
    setPrefs(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      // Persist to tenant settings
      await axios.put("http://localhost:5000/api/tenants/update", 
        { settings: { notifications: prefs } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: "Preferences Synchronized" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update notification logic." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const NotificationRow = ({ icon: Icon, title, desc, category }) => (
    <div className="flex items-center justify-between py-6 border-b border-gray-50 group hover:bg-gray-50/50 px-4 transition-colors">
      <div className="flex items-center gap-6">
        <div className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
          <Icon size={18} />
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest">{title}</h4>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{desc}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        {/* Email Toggle */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[8px] uppercase tracking-tighter text-gray-300">Email</span>
          <button 
            onClick={() => togglePref(category, 'email')}
            className={`w-10 h-5 rounded-full p-1 flex transition-all ${prefs[category].email ? "bg-black justify-end" : "bg-gray-100 justify-start"}`}
          >
            <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
          </button>
        </div>
        
        {/* Push/SMS Toggle */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[8px] uppercase tracking-tighter text-gray-300">Push</span>
          <button 
            onClick={() => togglePref(category, 'push')}
            className={`w-10 h-5 rounded-full p-1 flex transition-all ${prefs[category].push ? "bg-black justify-end" : "bg-gray-100 justify-start"}`}
          >
            <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      {/* Toast Feedback */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 border animate-in slide-in-from-top-4 ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          <CheckCircle2 size={14} />
          <span className="text-[10px] uppercase font-bold tracking-widest">{message.text}</span>
        </div>
      )}

      {/* CLINICAL NOTIFICATIONS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Stethoscope size={16} className="text-gray-400" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Clinical & Patient Care</h3>
        </div>
        <div className="bg-white border border-gray-100">
          <NotificationRow 
            category="patientBookings"
            icon={Calendar}
            title="New Patient Bookings"
            desc="Alerts when a patient requests a new slot."
          />
          <NotificationRow 
            category="appointmentReminders"
            icon={BellRing}
            title="Daily Schedule Summaries"
            desc="Morning briefing of all confirmed practitioners."
          />
        </div>
      </section>

      {/* ADMINISTRATIVE NOTIFICATIONS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <CreditCard size={16} className="text-gray-400" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Billing & Security</h3>
        </div>
        <div className="bg-white border border-gray-100">
          <NotificationRow 
            category="billingAlerts"
            icon={CreditCard}
            title="Subscription & Invoices"
            desc="Renewal notices and successful payment receipts."
          />
          <NotificationRow 
            category="securityLogs"
            icon={ShieldAlert}
            title="Critical Security Alerts"
            desc="Login attempts from new devices or IP changes."
          />
        </div>
      </section>

      {/* DO NOT DISTURB MODE */}
      <section className="p-8 bg-gray-50 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-full text-gray-300">
            <BellOff size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest">Global Mute Mode</h4>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Silence all non-critical administrative alerts.</p>
          </div>
        </div>
        <button className="px-6 py-2 border border-black text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
          Enable
        </button>
      </section>

      <div className="pt-8">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3 hover:opacity-80 transition-all disabled:bg-gray-200"
        >
          {isSaving ? "Updating Logic..." : <><Save size={16}/> Save Preferences</>}
        </button>
      </div>
    </div>
  );
};

export default AlertsNotifications;