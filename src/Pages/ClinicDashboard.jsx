import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Clock,
  Stethoscope,
  Search,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

import Appointments from "./clinicSide/clinicAppointments.jsx";
import Patients from "./clinicSide/clinicPatients.jsx";
import ClinicSettings from "./clinicSide/clinicSettings.jsx";
import Doctors from "./clinicSide/clinicDoctors.jsx";

/* ----------------------------- CONFIG ----------------------------- */
const API_BASE = "http://localhost:5000/api";

const MENU_ITEMS = [
  { id: "Overview", icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { id: "Appointments", icon: Calendar, label: "Appointments", path: "/dashboard/appointments" },
  { id: "Patients", icon: Users, label: "Patients", path: "/dashboard/patients" },
  { id: "Doctors", icon: Stethoscope, label: "Doctors", path: "/dashboard/doctors-management" },
  { id: "Settings", icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

/* ----------------------------- TOKEN HELPERS ----------------------------- */
const isValidToken = (t) => {
  if (!t || typeof t !== "string") return false;
  const x = t.trim();
  if (x === "undefined" || x === "null") return false;
  // basic JWT shape check
  return x.split(".").length === 3;
};

const getAuthToken = () => {
  // ✅ final login token should be stored here
  const t = localStorage.getItem("authToken");
  if (isValidToken(t)) return t;

  // optional fallback for older code
  const legacy = localStorage.getItem("token");
  if (isValidToken(legacy)) return legacy;

  return null;
};

/* ----------------------------- API CLIENT ----------------------------- */
const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// ✅ Attach token for every request safely
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // ensure we never send "Bearer undefined"
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ----------------------------- HELPERS ---------------------------- */
const normalizeList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.appointments)) return payload.appointments;
  if (Array.isArray(payload?.patients)) return payload.patients;
  if (Array.isArray(payload)) return payload;
  return [];
};

const safeDate = (d) => {
  const x = d ? new Date(d) : null;
  return x && !Number.isNaN(x.getTime()) ? x : null;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const fmtWeekday = (date) => new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
const fmtMonth = (date) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);

const resolvePatientName = (appt) => {
  if (appt?.patientInfo?.name) return appt.patientInfo.name;
  if (appt?.patientId && typeof appt.patientId === "object" && appt.patientId?.name) return appt.patientId.name;
  return appt?.patientName || "Patient";
};

const resolveStatus = (appt) => String(appt?.status || "PENDING").toUpperCase();

const resolveFee = (appt) => {
  const n = Number(appt?.fee ?? appt?.consultationFee ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const uniquePatientsFromAppointments = (appointments = []) => {
  const set = new Set();
  for (const a of appointments) {
    const pid = a?.patientId?._id || a?.patientId || a?.patientInfo?.email || a?.patientInfo?.contact;
    if (pid) set.add(String(pid));
  }
  return set.size;
};

const todayAppointmentsFromAppointments = (appointments = []) => {
  const today = startOfDay(new Date());
  return appointments.reduce((acc, a) => {
    const dt = safeDate(a?.dateTime || a?.date || a?.createdAt);
    if (!dt) return acc;
    return sameDay(startOfDay(dt), today) ? acc + 1 : acc;
  }, 0);
};

/* ----------------------------- UI: TOOLTIP ----------------------------- */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white p-3 text-[10px] uppercase tracking-widest shadow-xl border border-gray-800">
      <p className="mb-1 text-gray-500">{label}</p>
      <p className="font-bold">{payload[0].value}</p>
    </div>
  );
};

/* ----------------------------- OVERVIEW ----------------------------- */
const OverviewContent = React.memo(function OverviewContent({ stats, tenant, data }) {
  const flow = data?.flow || [];
  const revenue = data?.revenue || [];

  const revenueTotal = useMemo(
    () => revenue.reduce((acc, x) => acc + (Number(x.revenue) || 0), 0),
    [revenue]
  );

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-light tracking-tighter text-gray-900">
            Welcome back,{" "}
            <span className="italic font-serif">
              {tenant?.name ? tenant.name.split(" ")[0] : "Administrator"}.
            </span>
          </h2>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest border border-gray-200 px-4 py-2 hover:bg-black hover:text-white transition-all duration-300">
          Generate Report <ArrowUpRight size={14} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300 rounded-sm">
                <stat.Icon size={20} />
              </div>
              <span className="text-[9px] font-bold px-2 py-1 rounded-sm text-gray-500 bg-gray-50">
                {stat.change}
              </span>
            </div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1 relative z-10">
              {stat.label}
            </h3>
            <p className="text-2xl font-semibold tracking-tighter relative z-10">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-serif italic text-gray-800">Patient Flow</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Last 7 days overview</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flow}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="visits" stroke="#1a1a1a" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black text-white p-8 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-lg font-serif italic text-white mb-8">Revenue</h3>
            <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.revenue || []}>
                  <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
                    {(data?.revenue || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === (data?.revenue || []).length - 1 ? "#FFFFFF" : "#333333"} />
                    ))}
                  </Bar>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="text-3xl font-light tracking-tighter">${revenueTotal.toLocaleString()}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">Total (last 6 months)</p>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ----------------------------- MAIN DASHBOARD ----------------------------- */
const TenantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tenantData, setTenantData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [overviewData, setOverviewData] = useState({ flow: [], revenue: [], activity: [] });
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    // ✅ full cleanup
    localStorage.removeItem("authToken");
    localStorage.removeItem("paymentToken");
    localStorage.removeItem("token"); // legacy
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    navigate("/clinic-login", { replace: true });
  }, [navigate]);

  const isTabActive = useCallback(
    (itemPath) => {
      if (itemPath === "/dashboard") return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
      return location.pathname.startsWith(itemPath);
    },
    [location.pathname]
  );

  const computeFlowLast7Days = useCallback((appointments) => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => ({
      day: fmtWeekday(d),
      visits: appointments.reduce((acc, appt) => {
        const dt = safeDate(appt?.dateTime || appt?.date || appt?.createdAt);
        return dt && sameDay(startOfDay(dt), d) ? acc + 1 : acc;
      }, 0),
    }));
  }, []);

  const computeRevenueLast6Months = useCallback((appointments) => {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));
    return months.map((m) => ({
      month: fmtMonth(m),
      revenue: Math.round(
        appointments.reduce((acc, appt) => {
          const dt = safeDate(appt?.dateTime || appt?.date || appt?.createdAt);
          if (dt && dt.getFullYear() === m.getFullYear() && dt.getMonth() === m.getMonth()) {
            return acc + resolveFee(appt);
          }
          return acc;
        }, 0)
      ),
    }));
  }, []);

  const fetchDashboardData = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        // ✅ hard gate before calling API
        const token = getAuthToken();
        if (!token) {
          navigate("/clinic-login", { replace: true });
          return;
        }

        const [profileRes, statsRes, apptRes] = await Promise.all([
          api.get("/tenants/profile", { signal }),
          api.get("/tenants/stats", { signal }),
          api.get("/appointments/my-appointments", { signal }),
        ]);

        const tenant = profileRes.data?.data ?? profileRes.data;
        setTenantData(tenant);

        const appointments = normalizeList(apptRes.data);
        const rawStats = statsRes.data?.data ?? statsRes.data ?? {};

        setDashboardStats([
          { label: "Total Patients", value: rawStats.totalPatients ?? uniquePatientsFromAppointments(appointments), change: "Live", Icon: Users },
          { label: "Daily Appointments", value: rawStats.todayAppointments ?? todayAppointmentsFromAppointments(appointments), change: "Today", Icon: Calendar },
          { label: "Medical Faculty", value: rawStats.totalDoctors ?? 0, change: "Active", Icon: Stethoscope },
          { label: "Avg. Wait Time", value: `${rawStats.waitTime ?? 15} min`, change: "Est.", Icon: Clock },
        ]);

        setOverviewData({
          flow: computeFlowLast7Days(appointments),
          revenue: computeRevenueLast6Months(appointments),
          activity: [],
        });
      } catch (err) {
        if (err?.name === "CanceledError") return;
        console.error("Dashboard Sync Error:", err);
        if (err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    },
    [navigate, handleLogout, computeFlowLast7Days, computeRevenueLast6Months]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={30} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#1a1a1a] font-sans overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-8 shrink-0 hidden md:flex">
        <div>
          <div className="mb-12 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <h1 className="text-xl font-serif italic tracking-tighter">Sovereign</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400">Clinical Suite</p>
          </div>
          <nav className="space-y-2">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest transition-all duration-300 ${
                  isTabActive(item.path) ? "bg-black text-white shadow-lg" : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest text-red-400 hover:text-red-600">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="SEARCH PATIENTS..."
              className="w-full bg-transparent pl-8 text-[10px] tracking-widest uppercase focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-8 ml-auto">
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold uppercase">{tenantData?.name || "Clinic Admin"}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">{tenantData?.subscription?.plan || "—"} Plan</p>
              </div>
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-serif italic">
                {tenantData?.name?.charAt(0) || "S"}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#FDFDFD] scroll-smooth">
          <Routes>
            <Route index element={<OverviewContent stats={dashboardStats} tenant={tenantData} data={overviewData} />} />
            <Route path="appointments/*" element={<Appointments />} />
            <Route path="patients/*" element={<Patients />} />
            <Route path="doctors-management/*" element={<Doctors />} />
            <Route
              path="settings/*"
              element={<ClinicSettings data={tenantData} onProfileUpdate={(d) => setTenantData((prev) => ({ ...prev, ...d }))} />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;
