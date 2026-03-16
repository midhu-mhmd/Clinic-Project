import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Activity, User, Calendar, AlertTriangle, ShieldCheck, Mail, Phone, MapPin, Trash2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

const UserProfileModal = ({ userId, onClose, onUpdate }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (userId) fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            // Assuming admin endpoint for user details
            const res = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.success) {
                setData(res.data.data);
            } else {
                setError("User data not found.");
            }
        } catch (err) {
            setError("Failed to load user details.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType) => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        setActionLoading(actionType);

        try {
            if (actionType === "toggle-status") {
                const newStatus = !data.isActive;
                await axios.patch(`${API_BASE_URL}/api/admin/users/${userId}/status`, { isActive: newStatus }, { headers });
                setData({ ...data, isActive: newStatus });
                if (onUpdate) onUpdate();
            }

            if (actionType === "delete") {
                if (!window.confirm("Are you sure you want to suspend this user?")) {
                    setActionLoading(null);
                    return;
                }
                await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, { headers });
                onClose();
                if (onUpdate) onUpdate();
            }

        } catch (err) {
            alert(`Action failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-zinc-900/40 backdrop-blur-sm">
            <div className="w-[800px] bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-[13px] font-bold text-zinc-900 uppercase tracking-widest">
                            User Identity Profile
                        </h2>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">UID: {userId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                        <X size={16} className="text-zinc-500" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-500 text-xs font-bold uppercase tracking-widest">{error}</div>
                    ) : data ? (
                        <div className="space-y-8 animate-in fade-in">

                            {/* Profile Header */}
                            <div className="flex items-center gap-6 pb-6 border-b border-zinc-100">
                                <img src={data.image || `https://api.dicebear.com/7.x/micah/svg?seed=${data.email}`} alt="User" className="w-20 h-20 rounded-full object-cover border border-zinc-200" />
                                <div>
                                    <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                        {data.name}
                                        {data.isVerified && <ShieldCheck size={20} className="text-emerald-500" />}
                                    </h1>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-2 mt-1 lowercase font-mono">
                                        {data.email}
                                    </p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm ${data.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                            }`}>
                                            {data.isActive ? "Active Account" : "Suspended"}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm bg-zinc-50 text-zinc-600 border-zinc-100`}>
                                            Role: {data.role?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div>
                                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Account Metadata</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <MetricCard icon={<Mail />} label="Email Address" value={data.email} />
                                    <MetricCard icon={<Phone />} label="Phone" value={data.phone || "N/A"} />
                                    <MetricCard icon={<MapPin />} label="Affiliation" value={data.tenantId?.name || "Platform"} />
                                    <MetricCard
                                        icon={<Calendar />}
                                        label="Registered"
                                        value={new Date(data.createdAt).toLocaleDateString()}
                                    />
                                </div>
                            </div>

                            {/* Administrative Actions */}
                            <div>
                                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Administrative Overrides</h3>
                                <div className="bg-zinc-50 p-6 rounded border border-zinc-100 space-y-4">

                                    <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest">Platform Access</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Toggle global login capabilities for this user account.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("toggle-status")}
                                            disabled={actionLoading === "toggle-status"}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white rounded transition-colors ${data.isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                        >
                                            {actionLoading === "toggle-status" ? "..." : data.isActive ? "Suspend User" : "Activate User"}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-2"><AlertTriangle size={12} /> Security Hazard</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Irreversibly flag this user identity for deletion.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("delete")}
                                            disabled={actionLoading === "delete"}
                                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={12} /> Delete User
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value }) => (
    <div className="p-4 border border-zinc-100 rounded bg-white overflow-hidden">
        <div className="text-zinc-300 mb-2">{React.cloneElement(icon, { size: 16 })}</div>
        <p className="text-[11px] font-bold text-zinc-900 truncate" title={value}>{value || "N/A"}</p>
        <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

export default UserProfileModal;
