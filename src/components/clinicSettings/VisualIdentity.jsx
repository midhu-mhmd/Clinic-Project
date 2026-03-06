import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Palette, Camera, Layout, CheckCircle2,
  AlertCircle, Eye, Loader2,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const UPLOAD_URL = `${API_BASE}/api/tenants/upload-image`;

const cleanToken = (t) => {
  if (!t || typeof t !== "string") return null;
  const x = t.replace(/['"]+/g, "").trim();
  if (!x || x === "undefined" || x === "null") return null;
  return x;
};
const readAuthToken = () => {
  const t1 = cleanToken(localStorage.getItem("authToken"));
  if (t1 && t1.split(".").length === 3) return t1;
  const t2 = cleanToken(localStorage.getItem("token"));
  if (t2 && t2.split(".").length === 3) return t2;
  return null;
};
const authHeaders = () => {
  const token = readAuthToken();
  if (!token) throw new Error("Session missing. Please login again.");
  return { Authorization: `Bearer ${token}` };
};

const VisualIdentity = ({ data, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const timerRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [branding, setBranding] = useState({
    primaryColor: "#000000",
    accentColor: "#0F766E",
    bannerImage: "",
    fontPreference: "Serif",
  });

  const showMsg = useCallback((type, text) => {
    setMessage({ type, text });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Seed from parent data
  useEffect(() => {
    if (!data?.settings?.branding) return;
    const b = data.settings.branding;
    setBranding({
      primaryColor: b.primaryColor || "#000000",
      accentColor: b.accentColor || "#0F766E",
      bannerImage: b.bannerImage || "",
      fontPreference: b.fontPreference || "Serif",
    });
  }, [data]);

  const handleBannerUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showMsg("error", "File too large (Max 2MB)");
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.post(UPLOAD_URL, fd, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        const url = res.data.imageUrl || "";
        setBranding((prev) => ({ ...prev, bannerImage: url }));
        showMsg("success", "Banner Uploaded");
      } else {
        showMsg("error", res.data?.message || "Upload failed.");
      }
    } catch (err) {
      showMsg("error", err?.response?.data?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }, [showMsg]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = { settings: { branding } };
      if (typeof onUpdate === "function") {
        const result = await onUpdate(payload);
        if (result?.success === false) {
          showMsg("error", result?.message || "Save failed");
          return;
        }
      } else {
        await axios.patch(`${API_BASE}/api/tenants/profile`, payload, {
          headers: authHeaders(),
        });
      }
      showMsg("success", "Identity Synchronized");
    } catch (err) {
      showMsg("error", err?.response?.data?.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  }, [branding, onUpdate, showMsg]);

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      {message.text && (
        <div className={`fixed top-8 right-8 flex items-center gap-3 px-6 py-4 border z-50 ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span className="text-[10px] uppercase font-bold tracking-widest">{message.text}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Layout size={14} /> Hero Banner
          </h4>
          <button
            onClick={() => !isUploading && bannerInputRef.current?.click()}
            disabled={isUploading}
            className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-1 disabled:opacity-40"
          >
            {isUploading ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
            {isUploading ? "Uploading..." : "Change Image"}
          </button>
          <input
            type="file"
            ref={bannerInputRef}
            className="hidden"
            onChange={handleBannerUpload}
            accept="image/*"
          />
        </div>
        <div
          className="w-full h-48 bg-gray-100 border relative group overflow-hidden cursor-pointer"
          onClick={() => !isUploading && bannerInputRef.current?.click()}
        >
          {branding.bannerImage ? (
            <img src={branding.bannerImage} className="w-full h-full object-cover" alt="Banner" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Camera size={24} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <p className="text-white text-[10px] uppercase tracking-widest font-bold">Upload High-Res Banner</p>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-50">
        <div className="space-y-6">
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Palette size={14} /> Color System
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
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
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
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                className="w-8 h-8 rounded-full border-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-gray-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400">Live Component Preview</p>
          <div className="bg-white p-6 shadow-sm border w-full max-w-[200px]">
            <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ backgroundColor: branding.primaryColor }} />
            <div className="h-2 w-16 bg-gray-100 mx-auto mb-4" />
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

      {/* Typography */}
      <section className="pt-8 border-t border-gray-50">
        <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6">Interface Typography</h4>
        <div className="grid grid-cols-2 gap-4">
          {["Serif", "Sans-Serif"].map((font) => (
            <button
              key={font}
              onClick={() => setBranding({ ...branding, fontPreference: font })}
              className={`p-6 border text-left transition-all ${
                branding.fontPreference === font ? "border-black bg-gray-50" : "border-gray-100 text-gray-400"
              }`}
            >
              <p className={`text-xl mb-2 ${font === "Serif" ? "font-serif italic" : "font-sans"}`}>Aa</p>
              <p className="text-[10px] uppercase tracking-widest">{font} Interface</p>
            </button>
          ))}
        </div>
      </section>

      <div className="pt-12">
        <button
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3 hover:opacity-80 transition-all disabled:bg-gray-300"
        >
          {isSaving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving Identity...</>
          ) : (
            <><Eye size={16} /> Preview & Publish</>
          )}
        </button>
      </div>
    </div>
  );
};

export default VisualIdentity;