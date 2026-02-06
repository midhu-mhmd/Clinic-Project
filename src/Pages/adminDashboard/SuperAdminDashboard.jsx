import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  ArrowRight,
  Loader2,
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

/* ----------------------------- API CONFIG ----------------------------- */
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

/* ----------------------------- HELPERS ----------------------------- */
const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const safeStr = (v, fallback = "") => {
  const s = String(v ?? "").trim();
  return s || fallback;
};

/**
 * Normalizes revenue chart data from backend into:
 * [{ month: "Jan", amount: 12000 }, ...]
 *
 * Supports common shapes:
 * - stats.revenueChart
 * - stats.data.revenueChart
 * - { labels:[], values:[] }
 * - { months:[], amounts:[] }
 */
const normalizeRevenueChart = (raw) => {
  if (!raw) return [];

  // already in expected array shape
  if (Array.isArray(raw)) {
    return raw
      .map((x) => ({
        month: safeStr(x.month || x.label || x.name, "—"),
        amount: safeNum(x.amount ?? x.value ?? 0),
      }))
      .filter((x) => x.month);
  }

  // object shapes: labels+values, months+amounts etc
  const labels = raw.labels || raw.months || raw.x || [];
  const values = raw.values || raw.amounts || raw.y || [];

  if (Array.isArray(labels) && Array.isArray(values)) {
    return labels.map((m, idx) => ({
      month: safeStr(m, "—"),
      amount: safeNum(values[idx] ?? 0),
    }));
  }

  return [];
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [recentTenants, setRecentTenants] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  // ✅ Currency (defaults to INR)
  const currencyCode = "INR";

  const formatCurrency = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    });
  }, [currencyCode]);

  const formatNumber = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      notation: "compact",
      compactDisplay: "short",
    });
  }, []);

  /* ----------------------------- FETCH ----------------------------- */
  const fetchDashboardData = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      // ✅ fetch in parallel
      const [tenantsRes, statsRes] = await Promise.all([
        api.get("/tenants/public", {
          params: { limit: 5, sort: "-createdAt" },
          signal,
        }),
        api.get("/admin/stats", { signal }),
      ]);

      const tenants = Array.isArray(tenantsRes.data?.data) ? tenantsRes.data.data : [];
      const statsPayload = statsRes.data?.data || null;

      setRecentTenants(tenants);
      setStats(statsPayload);

      // ✅ normalize revenue chart from various backend shapes
      const rawChart =
        statsRes.data?.revenueChart ||
        statsPayload?.revenueChart ||
        statsRes.data?.data?.revenueChart ||
        null;

      const normalizedChart = normalizeRevenueChart(rawChart);

      setRevenueData(
        normalizedChart.length ? normalizedChart : [{ month: "No Data", amount: 0 }]
      );
    } catch (err) {
      if (err?.name === "CanceledError") return;

      console.error("Dashboard Sync Error:", err);
      setError(err?.response?.data?.message || err.message || "Dashboard sync failed.");

      // Safe fallback UI data
      setStats((prev) => prev || { totalTenants: 0, totalRevenue: 0, totalPatients: 0, uptime: 0 });
      setRecentTenants([]);
      setRevenueData([{ month: "No Data", amount: 0 }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);

  /* ----------------------------- DERIVED (DYNAMIC TRENDS) ----------------------------- */
  // Backend should ideally return:
  // stats.trends = { tenantsMoM: 12, revenueYoY: 8.4, patientsMoM: 0, health: "Optimal" }
  const trends = stats?.trends || {};

  const tenantsTrend = Number.isFinite(Number(trends.tenantsMoM))
    ? `${Number(trends.tenantsMoM) >= 0 ? "+" : ""}${safeNum(trends.tenantsMoM)}% MoM`
    : "—";

  const revenueTrend = Number.isFinite(Number(trends.revenueYoY))
    ? `${Number(trends.revenueYoY) >= 0 ? "+" : ""}${safeNum(trends.revenueYoY)}% YoY`
    : "—";

  const patientsTrend = trends.patients
    ? safeStr(trends.patients, "—")
    : Number.isFinite(Number(trends.patientsMoM))
      ? `${Number(trends.patientsMoM) >= 0 ? "+" : ""}${safeNum(trends.patientsMoM)}% MoM`
      : "—";

  const healthTrend = safeStr(trends.health, "—");

  // Chart subtitle
  const chartWindowLabel = safeStr(stats?.chartWindowLabel, "Last 6 Months");

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#8DAA9D]" size={32} />
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
          Aggregating Global Metrics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* 1) KEY METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Building2 size={20} />}
          label="Active Clinics"
          value={formatNumber.format(stats?.totalTenants || 0)}
          trend={tenantsTrend}
        />

        <StatCard
          icon={<DollarSign size={20} />}
          label="Total Revenue"
          value={formatCurrency.format(stats?.totalRevenue || 0)}
          trend={revenueTrend}
        />

        <StatCard
          icon={<Users size={20} />}
          label="Total Patients"
          value={formatNumber.format(stats?.totalPatients || 0)}
          trend={patientsTrend}
        />

        <StatCard
          icon={<Activity size={20} />}
          label="System Health"
          value={`${safeNum(stats?.uptime, 0)}%`}
          trend={healthTrend}
        />
      </section>

      {/* 2) ANALYTICS & RECENT ACTIVITY */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART */}
        <div className="lg:col-span-2 bg-white p-8 border border-[#2D302D]/5 rounded-sm shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-800">
                Revenue Velocity
              </h3>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
                {chartWindowLabel}
              </p>
            </div>
            <TrendingUp size={16} className="text-[#8DAA9D]" />
          </div>

          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                  tickFormatter={(value) => formatCurrency.format(value)}
                />

                <Tooltip
                  cursor={{ fill: "#f8f9fa" }}
                  contentStyle={{
                    borderRadius: "0px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                  itemStyle={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#2D302D",
                  }}
                  formatter={(value) => [formatCurrency.format(value), "Revenue"]}
                />

                <Bar
                  dataKey="amount"
                  fill="#8DAA9D"
                  radius={[2, 2, 0, 0]}
                  barSize={40}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT TENANTS */}
        <div className="bg-[#1A1A1A] p-8 text-[#FAF9F6] rounded-sm flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Onboarding
            </h3>

            <div className="space-y-7 mb-8">
              {recentTenants.length > 0 ? (
                recentTenants.map((tenant) => (
                  <RecentEntry
                    key={tenant._id}
                    name={tenant.name}
                    sub={tenant.address ? tenant.address.split(",")[0] : "Remote"}
                    time={new Date(tenant.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">No recent activity found.</p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/tenants")}
            className="group w-full py-4 border border-[#FAF9F6]/10 text-[9px] uppercase tracking-widest hover:bg-[#FAF9F6] hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-3"
          >
            Manage Directory{" "}
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

/* ----------------------------- SUBCOMPONENTS ----------------------------- */

const StatCard = ({ icon, label, value, trend }) => {
  const isPositive = String(trend || "").includes("+");

  return (
    <div className="bg-white p-8 border border-[#2D302D]/5 rounded-sm hover:border-[#8DAA9D]/30 transition-all duration-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-[#F5F7F6] text-[#2D302D] rounded-sm group-hover:bg-[#8DAA9D] group-hover:text-white transition-colors">
          {icon}
        </div>

        <span className={`text-[10px] font-bold ${isPositive ? "text-green-600" : "text-gray-400"}`}>
          {trend || "—"}
        </span>
      </div>

      <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">{label}</p>
      <h4 className="text-3xl font-light tracking-tight text-[#2D302D]">{value}</h4>
    </div>
  );
};

const RecentEntry = ({ name, sub, time }) => (
  <div className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-3 last:border-0 last:pb-0">
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-200 group-hover:text-[#8DAA9D] transition-colors">
        {name}
      </p>
      <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{sub}</p>
    </div>
    <span className="text-[9px] text-gray-600 font-mono border border-gray-800 px-2 py-1 rounded-sm">
      {time}
    </span>
  </div>
);

export default SuperAdminDashboard;
