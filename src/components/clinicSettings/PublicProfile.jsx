import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import {
  Save,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  MapPin,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const PROFILE_URL = `${API_BASE}/api/tenants/profile`;
const UPLOAD_URL = `${API_BASE}/api/tenants/upload-image`;

/* =========================================================
   AUTH HELPERS (authToken-first)
========================================================= */
const cleanToken = (t) => {
  if (!t || typeof t !== "string") return null;
  const x = t.replace(/['"]+/g, "").trim();
  if (!x || x === "undefined" || x === "null") return null;
  return x;
};

const isValidJwt = (t) => {
  const x = cleanToken(t);
  return Boolean(x && x.split(".").length === 3);
};

const readAuthToken = () => {
  const t1 = cleanToken(localStorage.getItem("authToken"));
  if (isValidJwt(t1)) return t1;

  const t2 = cleanToken(localStorage.getItem("token")); // legacy fallback
  if (isValidJwt(t2)) return t2;

  return null;
};

const authHeadersOrThrow = () => {
  const token = readAuthToken();
  if (!token) throw new Error("Session missing. Please login again.");
  return { Authorization: `Bearer ${token}` };
};

/* =========================================================
   COMPONENT
   - supports BOTH: onUpdate (from parent) and onProfileUpdate (legacy)
========================================================= */
const PublicProfile = ({ data, onUpdate, onProfileUpdate }) => {
  const notifyParent =
    typeof onUpdate === "function"
      ? onUpdate
      : typeof onProfileUpdate === "function"
        ? onProfileUpdate
        : () => {};

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    image: "",
    settings: { isPublic: true },
    description: "",
    tags: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(
      () => setMessage({ type: "", text: "" }),
      4000
    );
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Sync state with DB model
  useEffect(() => {
    if (!data) return;
    setFormData({
      name: data.name || "",
      address: data.address || "",
      image: data.image || "",
      settings: {
        isPublic: data.settings?.isPublic ?? true,
      },
      description: data.description || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
    });
  }, [data]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 2 * 1024 * 1024) {
        showMessage("error", "File too large (Max 2MB)");
        return;
      }

      setIsUploading(true);

      const uploadData = new FormData();
      uploadData.append("image", file);

      const res = await axios.post(UPLOAD_URL, uploadData, {
        headers: {
          ...authHeadersOrThrow(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        const newImageUrl = res.data?.imageUrl || "";

        setFormData((prev) => ({ ...prev, image: newImageUrl }));

        // update parent state immediately (UI sync)
        notifyParent({ ...(data || {}), image: newImageUrl });

        showMessage("success", "Identity Image Updated");
      } else {
        showMessage("error", res.data?.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload Error Details:", err);
      showMessage(
        "error",
        err?.response?.data?.message || err?.message || "Upload failed."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [data, notifyParent, showMessage]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);

      // Build payload clean (optional, but safer)
      const payload = {
        name: String(formData.name || "").trim(),
        address: String(formData.address || "").trim(),
        image: formData.image || "",
        settings: {
          isPublic: Boolean(formData.settings?.isPublic),
        },
        description: String(formData.description || "").slice(0, 500),
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };

      // ✅ Preferred: use parent onUpdate if it exists (keeps all pages consistent)
      if (typeof onUpdate === "function") {
        const result = await onUpdate(payload);
        if (result?.success === false) {
          showMessage("error", result?.message || "Cloud sync failed");
          return;
        }
        showMessage("success", "Profile Synchronized");
        return;
      }

      // Fallback: direct API update
      const res = await axios.put(PROFILE_URL, payload, {
        headers: authHeadersOrThrow(),
      });

      const updated = res.data?.data?.data ?? res.data?.data ?? null;
      if (updated) notifyParent(updated);

      showMessage("success", "Profile Synchronized");
    } catch (err) {
      console.error("Save Error:", err);
      showMessage(
        "error",
        err?.response?.data?.message || err?.message || "Cloud sync failed"
      );
    } finally {
      setIsSaving(false);
    }
  }, [formData, notifyParent, onUpdate, showMessage]);

  if (!data) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Toast */}
      {message.text && (
        <div
          className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 border shadow-2xl transition-all animate-in slide-in-from-right-10 ${
            message.type === "success"
              ? "bg-black text-white border-white/10"
              : "bg-red-600 text-white border-none"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="text-[10px] uppercase font-bold tracking-widest">
            {message.text}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-10 items-start mb-16 border-b border-gray-50 pb-12">
        <div
          className="relative group cursor-pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
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
              <span className="text-[8px] text-white font-bold uppercase tracking-tighter">
                Replace
              </span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
            accept="image/*"
          />
        </div>

        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-serif italic text-gray-900">
            {formData.name || "Clinic Identity"}
          </h2>
          <div className="flex items-center gap-4 text-gray-400 text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {data.registrationId}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold tracking-normal underline underline-offset-4 cursor-help">
              <Globe size={12} /> /{data.slug}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md pt-2 italic">
            "Authorized personnel only may modify the clinical identity and public
            accessibility settings."
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
            Legal Clinic Name
          </label>
          <input
            className="w-full border-b border-gray-100 py-3 text-sm outline-none focus:border-black transition-all font-light"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
            Directory Visibility
          </label>
          <div className="flex items-center gap-4 py-3">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    isPublic: !formData.settings.isPublic,
                  },
                })
              }
              className={`w-12 h-6 rounded-full transition-all relative ${
                formData.settings.isPublic ? "bg-black" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  formData.settings.isPublic ? "left-7" : "left-1"
                }`}
              />
            </button>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              {formData.settings.isPublic ? "Visible to Public" : "Private Mode"}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
            Physical Location
          </label>
          <textarea
            rows="2"
            className="w-full border-b border-gray-100 py-3 text-sm outline-none focus:border-black transition-all resize-none font-light"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
            Clinic Description (Max 500 chars)
          </label>
          <textarea
            maxLength={500}
            rows="3"
            className="w-full border border-gray-100 p-4 text-sm outline-none focus:border-black transition-all bg-gray-50/30 font-light"
            placeholder="Describe your medical excellence..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mt-16">
        <button
          type="button"
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
