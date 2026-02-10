import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  Users,
  Activity,
  ArrowRight,
  Loader2,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- API CONFIGURATION ---
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const rawToken = localStorage.getItem("token");
  if (rawToken) {
    // Clean token (removes extra quotes often added by JSON.stringify)
    const cleanToken = rawToken.replace(/['"]+/g, "");
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Force redirect on auth failure
    }
    return Promise.reject(error);
  }
);

// --- HELPERS ---
const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// --- COMPONENT ---
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  const [recentTenants, setRecentTenants] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  const formatCurrency = useMemo(() => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: "compact",
  }), []);

  const fetchDashboardData = useCallback(async (signal) => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const response = await api.get("/admin/stats", { signal });
      const payload = response.data?.data;
      
      if (response.data?.success === false) {
          throw new Error(response.data?.message || "Internal Server Error");
      }

      setStats(payload?.overview || {});
      setRecentTenants(payload?.recentTenants || []);
      setRevenueData(payload?.revenueChart || [
        { month: "Jan", amount: 32000 },
        { month: "Feb", amount: 45000 },
        { month: "Mar", amount: 41000 },
        { month: "Apr", amount: 52000 },
      ]);
    } catch (err) {
      if (err?.name !== "CanceledError") {
        const msg = err.response?.data?.message || err.message || "Failed to load metrics";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-zinc-300" size={32} />
      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Securing Session...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 px-4 py-8">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium tracking-tight text-zinc-900">Platform Overview</h1>
          <p className="text-sm text-zinc-500">Real-time health of your multi-tenant ecosystem.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">All Systems Operational</span>
        </div>
      </header>

      {/* --- ERROR STATE --- */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between text-sm text-red-600">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => fetchDashboardData()} 
            className="text-xs font-bold uppercase tracking-tighter underline underline-offset-4"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* --- KPI GRID --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clinics" value={stats?.totalClinics} icon={<Building2 size={18}/>} trend="+12%" />
        <StatCard label="Active Patients" value={stats?.totalPatients} icon={<Users size={18}/>} trend="+5%" />
        <StatCard label="Revenue" value={formatCurrency.format(safeNum(stats?.totalRevenue))} icon={<CreditCard size={18}/>} />
        <StatCard label="Premium Nodes" value={stats?.activeSubscriptions} icon={<Activity size={18}/>} />
      </section>

      {/* --- MAIN CONTENT --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900">Revenue Velocity</h3>
            <TrendingUp size={16} className="text-zinc-400" />
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#a1a1aa" }} 
                    dy={10} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#18181b" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tenants */}
        <div className="bg-white border border-zinc-200 rounded-2xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900">Recent Onboarding</h3>
            <Plus size={16} className="text-zinc-400 cursor-pointer hover:text-zinc-900 transition-colors" onClick={() => navigate("/admin/tenants")} />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {recentTenants.length > 0 ? recentTenants.map((tenant) => (
              <div 
                key={tenant._id} 
                className="flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 transition-all group cursor-pointer"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900 truncate">{tenant.name}</p>
                  <p className="text-xs text-zinc-400 truncate w-full lowercase">{tenant.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                   <span className={`h-1.5 w-1.5 rounded-full ${tenant.isActive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                   <ArrowRight size={14} className="text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                 <p className="text-xs text-zinc-400 italic">No recent registrations found.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate("/admin/tenants")}
            className="m-4 p-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-50 rounded-xl hover:bg-zinc-900 hover:text-white transition-all duration-300"
          >
            View Directory
          </button>
        </div>
      </section>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-6 border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-900">
        {icon}
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
           <ArrowUpRight size={10} /> {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <h4 className="text-2xl font-medium text-zinc-900 mt-1">{value || 0}</h4>
    </div>
  </div>
);

export default SuperAdminDashboard;