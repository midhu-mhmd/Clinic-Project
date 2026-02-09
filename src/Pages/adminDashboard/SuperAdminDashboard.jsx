import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  Users,
  Activity,
  TrendingUp,
  ArrowRight,
  Loader2,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")?.replace(/['"]+/g, "");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const safeStr = (v, fallback = "") => {
  const s = String(v ?? "").trim();
  return s || fallback;
};

const normalizeRevenueChart = (raw) => {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((x) => ({
    month: safeStr(x.month || x.label || x.name, "—"),
    amount: safeNum(x.amount ?? x.value ?? 0),
  }));
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({}); 
  const [recentTenants, setRecentTenants] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  const formatCurrency = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        notation: "compact",
        compactDisplay: "short",
      });
    } catch (e) {
      return { format: (v) => `₹${v}` };
    }
  }, []);

  const formatNumber = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-IN", {
        notation: "compact",
        compactDisplay: "short",
      });
    } catch (e) {
      return { format: (v) => v };
    }
  }, []);

  const fetchDashboardData = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/stats", { signal });
      const payload = response.data?.data;
      
      if (!payload) throw new Error("Invalid response format from server");

      setStats(payload.overview || {});
      setRecentTenants(payload.recentTenants || []);
      setRevenueData(payload.revenueChart ? normalizeRevenueChart(payload.revenueChart) : [
        { month: "Jan", amount: 45000 },
        { month: "Feb", amount: 52000 },
        { month: "Mar", amount: 48000 }
      ]);
    } catch (err) {
      if (err?.name === "CanceledError") return;
      const msg = err?.response?.data?.message || err.message || "Failed to fetch metrics.";
      setError(`Server Error: ${msg}`);
      setStats({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#8DAA9D]" size={40} />
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">
          Synchronizing Platform Metrics
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-12 max-w-400 mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-[#2D302D]">Platform Overview</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-2 flex items-center gap-2">
            <ShieldCheck size={12} className="text-[#8DAA9D]" /> Super Admin Command Center
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-gray-400 uppercase">
            System Status: <span className="text-green-600 font-bold underline underline-offset-4">Optimal</span>
          </p>
        </div>
      </header>

      {error && (
        <div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-xs text-red-700 font-mono">
          ⚠️ {error}
          <p className="mt-1 opacity-70 italic">Check backend middleware for Intl.NumberFormat issues.</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Building2 size={20} />}
          label="Global Clinics"
          value={formatNumber.format(safeNum(stats?.totalClinics))}
          trend="+12% MoM"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Total Patients"
          value={formatNumber.format(safeNum(stats?.totalPatients))}
          trend="+5.4% MoM"
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Estimated Revenue"
          value={formatCurrency.format(safeNum(stats?.totalRevenue))}
          trend="INR Context"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Premium Nodes"
          value={formatNumber.format(safeNum(stats?.activeSubscriptions))}
          trend="Live"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 border border-[#2D302D]/5 rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-800">Growth Velocity</h3>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Platform Revenue (INR)</p>
            </div>
            <TrendingUp size={16} className="text-[#8DAA9D]" />
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#999" }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#999" }} 
                  tickFormatter={(val) => formatCurrency.format(val)}
                />
                <Tooltip 
                   cursor={{ fill: "#f8f9fa" }}
                   contentStyle={{ borderRadius: "0px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                   formatter={(val) => [formatCurrency.format(val), "Revenue"]}
                />
                <Bar dataKey="amount" fill="#8DAA9D" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-8 text-[#FAF9F6] rounded-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              New Clinic Onboarding
            </h3>
            <div className="space-y-7 mb-8">
              {recentTenants.length > 0 ? (
                recentTenants.map((tenant) => (
                  <RecentEntry
                    key={tenant._id}
                    name={tenant.name}
                    sub={tenant.email}
                    status={tenant.isActive}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-500 italic text-center py-10">No recent signups.</p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/tenants")}
            className="group w-full py-4 border border-[#FAF9F6]/10 text-[9px] uppercase tracking-widest hover:bg-[#FAF9F6] hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-3"
          >
            Open Tenant Directory <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-8 border border-[#2D302D]/5 rounded-sm hover:border-[#8DAA9D]/30 transition-all duration-500 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[#F5F7F6] text-[#2D302D] rounded-sm group-hover:bg-[#8DAA9D] group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-green-600">{trend}</span>
    </div>
    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">{label}</p>
    <h4 className="text-3xl font-light tracking-tight text-[#2D302D]">{value}</h4>
  </div>
);

const RecentEntry = ({ name, sub, status }) => (
  <div className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-3 last:border-0 last:pb-0">
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-200 group-hover:text-[#8DAA9D] transition-colors">{name}</p>
      <p className="text-[9px] text-gray-500 lowercase tracking-wider mt-1">{sub}</p>
    </div>
    <span className={`text-[8px] uppercase px-2 py-1 rounded-full border ${status ? 'border-green-900 text-green-500' : 'border-red-900 text-red-500'}`}>
      {status ? 'Active' : 'Pending'}
    </span>
  </div>
);

export default SuperAdminDashboard;