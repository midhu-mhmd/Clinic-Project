import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Activity, Users, HardDrive, Calendar, Zap, AlertTriangle, ShieldAlert, Download, RefreshCw, LogIn, Trash2, ShieldCheck } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

const TenantProfileModal = ({ tenantId, onClose, onStatusChange }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTenantDetails();
    }, [tenantId]);

    const fetchTenantDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE_URL}/api/admin/tenants/${tenantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            setError("Failed to load tenant details.");
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
                await axios.patch(`${API_BASE_URL}/api/admin/tenants/${tenantId}/status`, { isActive: newStatus }, { headers });
                setData({ ...data, isActive: newStatus });
                if (onStatusChange) onStatusChange(tenantId, newStatus);
            }

            if (actionType === "delete") {
                if (!window.confirm("Are you sure you want to soft delete this tenant? This suspends all their users.")) {
                    setActionLoading(null);
                    return;
                }
                await axios.delete(`${API_BASE_URL}/api/admin/tenants/${tenantId}`, { headers });
                onClose(); // Close modal on delete
            }

            if (actionType === "impersonate") {
                const res = await axios.post(`${API_BASE_URL}/api/admin/tenants/${tenantId}/impersonate`, {}, { headers });
                if (res.data.success) {
                    // In a real scenario, this might open a new tab and inject the token
                    alert(`Impersonation token retrieved for ${res.data.user.email}. Check console.`);
                    console.log("IMPERSONATION TOKEN:", res.data.token);
                }
            }

            if (actionType === "clear-cache") {
                await axios.post(`${API_BASE_URL}/api/admin/tenants/${tenantId}/clear-cache`, {}, { headers });
                alert("Tenant configuration cache cleared.");
            }

            if (actionType === "export") {
                // Simulate export
                alert("Tenant data export initiated. You will receive an email shortly.");
            }

        } catch (err) {
            alert(`Action failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (!tenantId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-zinc-900/40 backdrop-blur-sm">
            <div className="w-[800px] bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-[13px] font-bold text-zinc-900 uppercase tracking-widest">
                            Tenant Profile
                        </h2>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">ID: {tenantId}</p>
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
                                <img src={data.image || "https://images.unsplash.com/photo-1629909613654-2871b886daa4"} alt="Clinic" className="w-20 h-20 rounded-md object-cover border border-zinc-200" />
                                <div>
                                    <h1 className="text-xl font-bold text-zinc-900">{data.name}</h1>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <Activity size={12} /> {data.subscription?.plan || "BASIC"} Plan
                                    </p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm ${data.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                            }`}>
                                            {data.isActive ? "Active Account" : "Suspended"}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm ${data.subscription?.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                            }`}>
                                            Billing: {data.subscription?.status || "PENDING"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div>
                                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Core Metrics</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <MetricCard icon={<Users />} label="Total Users" value={data.metrics?.totalUsers || 0} />
                                    <MetricCard icon={<Activity />} label="Active Users" value={data.metrics?.activeUsers || 0} />
                                    <MetricCard icon={<HardDrive />} label="Storage Used" value="1.2 GB" />
                                    <MetricCard
                                        icon={<Calendar />}
                                        label="Last Active"
                                        value={
                                            data.metrics?.lastActive
                                                ? new Date(data.metrics.lastActive).toLocaleDateString()
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
                                            <p className="text-[11px] font-bold uppercase tracking-widest">Platform Access</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Suspend or reactivate global platform login capabilities.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("toggle-status")}
                                            disabled={actionLoading === "toggle-status"}
                                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white rounded transition-colors ${data.isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-500 hover:bg-emerald-600"
                                                }`}
                                        >
                                            {actionLoading === "toggle-status" ? "..." : data.isActive ? "Suspend Tenant" : "Activate Tenant"}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest">Impersonate Admin</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Generate a secure session token acting as clinic admin.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("impersonate")}
                                            disabled={actionLoading === "impersonate"}
                                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 rounded transition-colors flex items-center gap-2"
                                        >
                                            <LogIn size={12} /> {actionLoading === "impersonate" ? "Authenticating..." : "Impersonate"}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest">Maintenance Mode</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Clear tenant configuration caches and force data recreation.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction("clear-cache")}
                                                disabled={actionLoading === "clear-cache"}
                                                className="p-2 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors flex items-center gap-2"
                                                title="Clear Cache"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleAction("export")}
                                                disabled={actionLoading === "export"}
                                                className="p-2 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors flex items-center gap-2"
                                                title="Export Data"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-2"><AlertTriangle size={12} /> Danger Zone</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Irreversibly flag this entire tenant identity for deletion.</p>
                                        </div>
                                        <button
                                            onClick={() => handleAction("delete")}
                                            disabled={actionLoading === "delete"}
                                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={12} /> Delete Tenant
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
        <p className="text-xl font-bold text-zinc-900">{value}</p>
        <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

export default TenantProfileModal;
