import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Bell,
  Building2,
  UserPlus,
  CalendarCheck,
  CreditCard,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Video,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
  const clean = t.replace(/['"]+/g, "").trim();
  if (clean && clean !== "null" && clean !== "undefined") {
    cfg.headers.Authorization = `Bearer ${clean}`;
  }
  return cfg;
});

/* ─── Notification type config ─── */
const TYPE_CONFIG = {
  NEW_CLINIC: {
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
    badge: "bg-blue-50 text-blue-700",
  },
  NEW_PATIENT: {
    icon: UserPlus,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700",
  },
  APPOINTMENT: {
    icon: CalendarCheck,
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
    badge: "bg-violet-50 text-violet-700",
  },
  SUBSCRIPTION: {
    icon: CreditCard,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
    badge: "bg-amber-50 text-amber-700",
  },
};

const FILTER_TABS = [
  { key: "ALL", label: "All" },
  { key: "NEW_CLINIC", label: "Clinics" },
  { key: "NEW_PATIENT", label: "Patients" },
  { key: "APPOINTMENT", label: "Appointments" },
  { key: "SUBSCRIPTION", label: "Billing" },
];

/* ─── Time formatting ─── */
const timeAgo = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fullDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchNotifications = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await api.get("/api/admin/notifications", { signal });
      if (res.success) {
        setNotifications(res.data || []);
      } else {
        setError(res.message || "Failed to load notifications.");
      }
    } catch (err) {
      if (err?.name === "CanceledError") return;
      setError(err?.response?.data?.message || "Unable to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchNotifications(ac.signal);
    return () => ac.abort();
  }, [fetchNotifications]);

  /* Filtered + searched list */
  const filtered = useMemo(() => {
    let list = notifications;
    if (filter !== "ALL") {
      list = list.filter((n) => n.type === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, filter, search]);

  /* Stats counters */
  const counts = useMemo(() => {
    const c = { ALL: notifications.length, NEW_CLINIC: 0, NEW_PATIENT: 0, APPOINTMENT: 0, SUBSCRIPTION: 0 };
    for (const n of notifications) {
      if (c[n.type] !== undefined) c[n.type]++;
    }
    return c;
  }, [notifications]);

  /* ─── Render ─── */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-400 gap-3">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 flex items-center gap-3">
            <Bell size={22} className="text-zinc-400" />
            Notifications
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Platform activity from the last 30 days • {notifications.length} events
          </p>
        </div>
        <button
          onClick={() => { const ac = new AbortController(); fetchNotifications(ac.signal); }}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg px-4 py-2 hover:bg-zinc-50 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="border border-red-100 bg-red-50 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 transition-shadow"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-zinc-400" />
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === tab.key
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">{counts[tab.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Bell size={32} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">No notifications found</p>
          <p className="text-xs mt-1">
            {filter !== "ALL" ? "Try a different filter." : "All quiet on the platform."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.NEW_CLINIC;
            const Icon = cfg.icon;

            return (
              <div
                key={n.id}
                className="flex items-start gap-4 bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-sm transition-shadow group"
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 h-10 w-10 rounded-xl ${cfg.bg} ring-1 ${cfg.ring} flex items-center justify-center`}
                >
                  <Icon size={18} className={cfg.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-zinc-900">{n.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {n.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">{n.description}</p>

                  {/* Meta tags */}
                  <div className="flex items-center gap-3 mt-2">
                    {n.meta?.consultationType && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                        {n.meta.consultationType === "video" ? <Video size={11} /> : <MapPin size={11} />}
                        {n.meta.consultationType === "video" ? "Video" : "In-Clinic"}
                      </span>
                    )}
                    {n.meta?.status && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                        <CheckCircle2 size={11} />
                        {n.meta.status}
                      </span>
                    )}
                    {n.meta?.plan && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                        <CreditCard size={11} />
                        {n.meta.plan}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-zinc-400">{timeAgo(n.timestamp)}</p>
                  <p className="text-[10px] text-zinc-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {fullDate(n.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
