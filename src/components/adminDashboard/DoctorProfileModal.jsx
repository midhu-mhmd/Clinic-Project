import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X, Activity, User, HardDrive, Calendar, Zap, AlertTriangle, ShieldCheck, Download, RefreshCw, LogIn, Trash2, CheckCircle, ShieldAlert, ExternalLink } from "lucide-react";

/**
 * Since superadmin might need to access doctors directly, 
 * ensure the API endpoint and authorization are correct.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

const DoctorProfileModal = ({ doctorId, onClose, onUpdate }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (doctorId) fetchDoctorDetails();
    }, [doctorId]);

    const fetchDoctorDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            // Using the public directory info or specific admin fetch if available
            // For now, mirroring TenantProfileModal's fetch logic
            const res = await axios.get(`${API_BASE_URL}/api/doctors/public/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.success) {
                setData(res.data.data);
            } else {
                setError("Practitioner data not found.");
            }
        } catch (err) {
            setError("Failed to load practitioner details.");
            console.error(err);
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
                await axios.post(`${API_BASE_URL}/api/doctors/bulk-status`, { 
                    doctorIds: [doctorId], 
                    isActive: newStatus 
                }, { headers });
                
                setData({ ...data, isActive: newStatus });
                if (onUpdate) onUpdate();
            }

            if (actionType === "verify") {
                await axios.post(`${API_BASE_URL}/api/doctors/bulk-status`, { 
                    doctorIds: [doctorId], 
                    verificationStatus: "VERIFIED" 
                }, { headers });
                
                setData({ ...data, verificationStatus: "VERIFIED" });
                if (onUpdate) onUpdate();
            }

            if (actionType === "delete") {
                if (!window.confirm("Are you sure you want to remove this practitioner entry from the system?")) {
                    setActionLoading(null);
                    return;
                }
                // Placeholder for delete
                alert("Soft delete endpoint for global directory practitioners not fully implemented yet.");
            }

        } catch (err) {
            alert(`Action failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (!doctorId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-zinc-900/40 backdrop-blur-sm">
            <div className="w-[800px] bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-[13px] font-bold text-zinc-900 uppercase tracking-widest">
                            Practitioner Profile
                        </h2>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">ID: {doctorId}</p>
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
                                <img 
                                    src={data.image || `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`} 
                                    alt="Doctor" 
                                    className="w-20 h-20 rounded-md object-cover border border-zinc-200" 
                                />
                                <div className="flex-1">
                                    <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                        {data.name}
                                        {data.verificationStatus === 'VERIFIED' && <ShieldCheck size={20} className="text-blue-500" />}
                                    </h1>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <Zap size={12} className="text-zinc-400" /> {data.specialization}
                                    </p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm ${data.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                            }`}>
                                            {data.isActive ? "Active Status" : "N/A/Inactive"}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm ${data.verificationStatus === 'VERIFIED' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                            }`}>
                                            Account: {data.verificationStatus || "PENDING"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div>
                                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Registry Details</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <MetricCard icon={<Activity />} label="Consultation Fee" value={`₹${data.consultationFee || 0}`} />
                                    <MetricCard icon={<User />} label="Registration No" value={data.regNo || "N/A"} />
                                    <MetricCard icon={<HardDrive />} label="Organization" value={data.tenantId?.name || "Protocol Hub"} />
                                    <MetricCard
                                        icon={<Calendar />}
                                        label="Joined Date"
                                        value={
                                            data.createdAt
                                                ? new Date(data.createdAt).toLocaleDateString()
                                                : "N/A"
                                        }
                                    />
                                </div>
                            </div>

                            {/* Administrative Actions */}
                            <div>
                                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Administrative Overrides</h3>
                                <div className="bg-zinc-50 p-6 rounded border border-zinc-100 space-y-4">

                                    <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest">Directory Visibility</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Toggle practitioner visibility in public search registry.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("toggle-status")}
                                            disabled={actionLoading === "toggle-status"}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white rounded transition-colors ${data.isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                        >
                                            {actionLoading === "toggle-status" ? "..." : data.isActive ? "Suspend Entry" : "Activate Entry"}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest">Verification Badge</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Manually verify credentials and add trust badge.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("verify")}
                                            disabled={actionLoading === "verify" || data.verificationStatus === 'VERIFIED'}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white rounded transition-colors ${data.verificationStatus === 'VERIFIED' ? "bg-zinc-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={12} /> {data.verificationStatus === 'VERIFIED' ? "Verified" : "Verify Doctor"}
                                            </div>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest">Platform Integrity</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Explore the cross-platform public footprint for this registry.</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/doctor/${doctorId}`)}
                                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                                        >
                                            <ExternalLink size={12} /> View Public Profile
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-2"><AlertTriangle size={12} /> Danger Zone</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Flag this entry for removal from Global Directory.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("delete")}
                                            disabled={actionLoading === "delete"}
                                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={12} /> Remove Entries
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
    <div className="p-4 border border-zinc-100 rounded bg-white">
        <div className="text-zinc-300 mb-2">{React.cloneElement(icon, { size: 16 })}</div>
        <p className="text-[12px] font-bold text-zinc-900 truncate">{value}</p>
        <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

export default DoctorProfileModal;
