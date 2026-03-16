import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Search,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Send,
  LifeBuoy,
  Clock,
  MessageSquare,
  CheckCircle2,
  Filter,
  AlertTriangle,
  Users,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

/* =========================================================
   API
========================================================= */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use((cfg) => {
  const raw = localStorage.getItem("token");
  if (raw) {
    const clean = raw.replace(/['"]+/g, "").trim();
    if (clean && clean !== "null" && clean !== "undefined") {
      cfg.headers.Authorization = `Bearer ${clean}`;
    }
  }
  return cfg;
});

/* =========================================================
   CONSTANTS
========================================================= */
const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "AWAITING_REPLY", label: "Awaiting" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

const STATUS_STYLES = {
  OPEN: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  AWAITING_REPLY: "bg-purple-50 text-purple-600",
  RESOLVED: "bg-emerald-50 text-emerald-600",
  CLOSED: "bg-zinc-100 text-zinc-500",
};

const PRIORITY_STYLES = {
  LOW: "text-zinc-400",
  MEDIUM: "text-blue-500",
  HIGH: "text-amber-500",
  URGENT: "text-red-500",
};

const ROUTING_STYLES = {
  SUPER_ADMIN: "bg-zinc-900 text-white",
  TENANT: "bg-zinc-100 text-zinc-600",
};

const CATEGORIES = ["BILLING", "TECHNICAL", "APPOINTMENT", "ACCOUNT", "GENERAL", "FEEDBACK"];
const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "AWAITING_REPLY", "RESOLVED", "CLOSED"];

const timeAgo = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/* =========================================================
   COMPONENT
========================================================= */
const AdminTickets = () => {
  const [view, setView] = useState("list"); // list | detail
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");

  // Detail
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  /* ── Fetch ── */
  const fetchTickets = useCallback(async () => {
    try {
      setError("");
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (routeFilter) params.routedTo = routeFilter;
      const { data } = await api.get("/api/tickets/all", { params });
      if (data.success) setTickets(data.tickets || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, routeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/api/tickets/stats");
      if (data.success) setStats(data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets, fetchStats]);

  /* ── Filtered ── */
  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (activeTab !== "ALL") list = list.filter((t) => t.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject?.toLowerCase().includes(q) ||
          t.ticketNumber?.toLowerCase().includes(q) ||
          t.createdBy?.name?.toLowerCase().includes(q) ||
          t.createdBy?.email?.toLowerCase().includes(q) ||
          t.tenantId?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, activeTab, searchQuery]);

  /* ── Open detail ── */
  const openDetail = useCallback(async (ticketId) => {
    setDetailLoading(true);
    setView("detail");
    try {
      const { data } = await api.get(`/api/tickets/${ticketId}`);
      if (data.success) setSelectedTicket(data.data || data.ticket);
    } catch {
      setError("Failed to load ticket.");
      setView("list");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* ── Reply ── */
  const handleReply = useCallback(async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      const { data } = await api.post(`/api/tickets/${selectedTicket._id}/reply`, {
        content: replyText.trim(),
      });
      if (data.success) {
        setReplyText("");
        // Refresh detail
        const refresh = await api.get(`/api/tickets/${selectedTicket._id}`);
        if (refresh.data.success) setSelectedTicket(refresh.data.data || refresh.data.ticket);
        fetchTickets();
      }
    } catch {
      setError("Failed to send reply.");
    } finally {
      setReplying(false);
    }
  }, [replyText, selectedTicket, fetchTickets]);

  /* ── Status update ── */
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!selectedTicket) return;
      setStatusUpdating(true);
      try {
        const { data } = await api.patch(`/api/tickets/${selectedTicket._id}/status`, {
          status: newStatus,
        });
        if (data.success) {
          setSelectedTicket((prev) => ({
            ...prev,
            status: newStatus,
            ...(newStatus === "RESOLVED" ? { resolvedAt: new Date().toISOString() } : {}),
            ...(newStatus === "CLOSED" ? { closedAt: new Date().toISOString() } : {}),
          }));
          fetchTickets();
          fetchStats();
        }
      } catch {
        setError("Failed to update status.");
      } finally {
        setStatusUpdating(false);
      }
    },
    [selectedTicket, fetchTickets, fetchStats]
  );

  /* =========================================================
     RENDER — DETAIL
  ========================================================= */
  if (view === "detail") {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      );
    }
    if (!selectedTicket) return null;

    const st = STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.OPEN;
    const pr = PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.MEDIUM;
    const rt = ROUTING_STYLES[selectedTicket.routedTo] || ROUTING_STYLES.SUPER_ADMIN;
    const slaBreached = selectedTicket.slaBreached;
    const slaDeadline = selectedTicket.slaDeadline ? new Date(selectedTicket.slaDeadline) : null;
    const firstResponseDeadline = selectedTicket.firstResponseDeadline ? new Date(selectedTicket.firstResponseDeadline) : null;
    const firstRespondedAt = selectedTicket.firstRespondedAt ? new Date(selectedTicket.firstRespondedAt) : null;
    const firstResponseBreached = selectedTicket.firstResponseBreached;
    const escalationLevel = selectedTicket.escalationLevel || 0;
    const isPaused = !!selectedTicket.slaPausedAt;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
        {/* Back */}
        <button
          onClick={() => { setView("list"); setSelectedTicket(null); }}
          className="group flex items-center gap-2 text-[11px] uppercase tracking-widest font-medium text-zinc-400 hover:text-zinc-900 transition-colors mb-8"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          All Tickets
        </button>

        {/* Ticket Header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400">
                  {selectedTicket.ticketNumber}
                </span>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md ${st}`}>
                  {selectedTicket.status?.replace(/_/g, " ")}
                </span>
                <span className={`text-[9px] uppercase tracking-widest font-bold ${pr}`}>
                  ● {selectedTicket.priority}
                </span>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md ${rt}`}>
                  {selectedTicket.routedTo === "TENANT" ? "Tenant" : "Platform"}
                </span>
                {slaBreached && (
                  <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md bg-red-50 text-red-500 flex items-center gap-1">
                    <AlertTriangle size={10} /> SLA Breached
                  </span>
                )}
                {firstResponseBreached && (
                  <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md bg-orange-50 text-orange-500 flex items-center gap-1">
                    <Clock size={10} /> Response SLA Missed
                  </span>
                )}
                {isPaused && (
                  <span className="text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-500">
                    SLA Paused
                  </span>
                )}
                {escalationLevel > 0 && (
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md ${
                    escalationLevel >= 2 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    Escalation L{escalationLevel}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                {selectedTicket.subject}
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                {selectedTicket.description}
              </p>

              {/* SLA Timeline */}
              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <div className="text-[10px]">
                  <span className="text-zinc-400 uppercase tracking-widest block mb-0.5">First Response</span>
                  {firstRespondedAt ? (
                    <span className={firstResponseBreached ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                      {firstRespondedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                      {firstResponseBreached ? " (Late)" : " ✓"}
                    </span>
                  ) : firstResponseDeadline ? (
                    <span className={firstResponseDeadline < new Date() ? "text-red-500 font-bold" : "text-zinc-600"}>
                      Due: {firstResponseDeadline.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </div>
                <div className="text-[10px]">
                  <span className="text-zinc-400 uppercase tracking-widest block mb-0.5">Resolution Deadline</span>
                  {slaDeadline ? (
                    <span className={slaBreached || slaDeadline < new Date() ? "text-red-500 font-bold" : "text-zinc-600"}>
                      {slaDeadline.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                      {slaBreached ? " (Breached)" : ""}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </div>
                {selectedTicket.resolvedAt && (
                  <div className="text-[10px]">
                    <span className="text-zinc-400 uppercase tracking-widest block mb-0.5">Resolved At</span>
                    <span className="text-emerald-600 font-bold">
                      {new Date(selectedTicket.resolvedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-[10px] text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {timeAgo(selectedTicket.createdAt)}
                </span>
                <span>
                  {selectedTicket.category?.charAt(0) + selectedTicket.category?.slice(1).toLowerCase()}
                </span>
                {selectedTicket.createdBy && (
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {selectedTicket.createdBy.name || selectedTicket.createdBy.email}
                    {selectedTicket.createdByRole ? ` (${selectedTicket.createdByRole.replace("_", " ")})` : ""}
                  </span>
                )}
                {selectedTicket.tenantId?.name && (
                  <span>Clinic: {selectedTicket.tenantId.name}</span>
                )}
                {selectedTicket.assignedTo && (
                  <span>Assigned: {selectedTicket.assignedTo.name || selectedTicket.assignedTo.email}</span>
                )}
              </div>
            </div>

            {/* Status actions */}
            {!["RESOLVED", "CLOSED"].includes(selectedTicket.status) && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {STATUS_OPTIONS.filter((s) => s !== selectedTicket.status && s !== "OPEN").map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusUpdating}
                    className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-zinc-200 rounded-md hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30"
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h3 className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold mb-6 flex items-center gap-2">
            <MessageSquare size={13} />
            Conversation ({selectedTicket.messages?.length || 0})
          </h3>

          <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto">
            {(selectedTicket.messages || []).map((msg, i) => {
              const isAdmin = msg.senderRole === "SUPER_ADMIN";
              const isClinic = msg.senderRole === "CLINIC_ADMIN";
              const senderLabel = isAdmin
                ? "You (Platform)"
                : isClinic
                ? `Clinic Admin${msg.sender?.name ? ` — ${msg.sender.name}` : ""}`
                : msg.sender?.name || "Patient";
              return (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    isAdmin
                      ? "border-zinc-200 bg-zinc-50"
                      : isClinic
                      ? "border-amber-100 bg-amber-50/30"
                      : "border-zinc-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                      {senderLabel}
                    </span>
                    <span className="text-[10px] text-zinc-400">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">{msg.content}</p>
                </div>
              );
            })}

            {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
              <p className="text-sm text-zinc-400 italic py-4">No replies yet.</p>
            )}
          </div>

          {/* Reply */}
          {!["CLOSED"].includes(selectedTicket.status) && (
            <div className="flex gap-3 border-t border-zinc-100 pt-4">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
                placeholder="Type your reply..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                className="px-5 bg-zinc-900 text-white rounded-lg text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 disabled:opacity-30 transition-colors flex items-center gap-2"
              >
                {replying ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Reply
              </button>
            </div>
          )}

          {selectedTicket.status === "CLOSED" && (
            <div className="flex items-center gap-2 p-4 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              <CheckCircle2 size={14} />
              This ticket has been closed.
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER — LIST
  ========================================================= */
  const openCount = stats?.byStatus?.OPEN || 0;
  const inProgressCount = stats?.byStatus?.IN_PROGRESS || 0;
  const breachedCount = stats?.sla?.true || 0;
  const frBreachedCount = stats?.firstResponse?.true || 0;
  const totalCount = stats?.total || tickets.length;
  const avgFirstResp = stats?.avgFirstResponseMin;
  const avgResolution = stats?.avgResolutionMin;

  const formatDuration = (mins) => {
    if (mins == null) return "—";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Support Tickets
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage and respond to support requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1">Total</div>
            <div className="text-2xl font-semibold text-zinc-900">{totalCount}</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1">Open</div>
            <div className="text-2xl font-semibold text-blue-600">{openCount}</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1">In Progress</div>
            <div className="text-2xl font-semibold text-amber-600">{inProgressCount}</div>
          </div>
          <div className={`bg-white border rounded-xl p-5 ${breachedCount > 0 ? "border-red-200" : "border-zinc-200"}`}>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1 flex items-center gap-1">
              {breachedCount > 0 && <AlertTriangle size={10} className="text-red-500" />}
              SLA Breached
            </div>
            <div className={`text-2xl font-semibold ${breachedCount > 0 ? "text-red-500" : "text-zinc-900"}`}>
              {breachedCount}
            </div>
          </div>
          <div className={`bg-white border rounded-xl p-5 ${frBreachedCount > 0 ? "border-orange-200" : "border-zinc-200"}`}>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1 flex items-center gap-1">
              {frBreachedCount > 0 && <Clock size={10} className="text-orange-500" />}
              Response SLA
            </div>
            <div className={`text-2xl font-semibold ${frBreachedCount > 0 ? "text-orange-500" : "text-zinc-900"}`}>
              {frBreachedCount}
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1">Avg Response</div>
            <div className="text-2xl font-semibold text-zinc-900">{formatDuration(avgFirstResp)}</div>
            {avgResolution != null && (
              <div className="text-[9px] text-zinc-400 mt-0.5">Resolve: {formatDuration(avgResolution)}</div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg mb-6">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} className="text-red-300" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-400 transition-colors w-64"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setLoading(true); }}
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-400 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <select
            value={routeFilter}
            onChange={(e) => { setRouteFilter(e.target.value); setLoading(true); }}
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-400 appearance-none cursor-pointer"
          >
            <option value="">All Routes</option>
            <option value="SUPER_ADMIN">Platform</option>
            <option value="TENANT">Tenant</option>
          </select>
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      )}

      {/* Empty */}
      {!loading && filteredTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <LifeBuoy size={28} className="text-zinc-200" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-1">No Tickets Found</h3>
          <p className="text-[11px] text-zinc-400 max-w-sm">
            {searchQuery || activeTab !== "ALL" || categoryFilter || routeFilter
              ? "Try adjusting your filters."
              : "No support tickets have been created yet."}
          </p>
        </div>
      )}

      {/* Ticket Table */}
      {!loading && filteredTickets.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-zinc-100 text-left">
                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Ticket</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-400 font-medium hidden md:table-cell">Creator</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-400 font-medium hidden lg:table-cell">Category</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Status</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-400 font-medium hidden md:table-cell">Priority</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-400 font-medium hidden lg:table-cell">Route</th>
                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-400 font-medium hidden sm:table-cell">Time</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const st = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN;
                const pr = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;
                const rt = ROUTING_STYLES[ticket.routedTo] || ROUTING_STYLES.SUPER_ADMIN;
                const isBreach = ticket.slaBreached;
                const isFrBreach = ticket.firstResponseBreached;
                return (
                  <tr
                    key={ticket._id}
                    onClick={() => openDetail(ticket._id)}
                    className={`border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-colors group ${isBreach ? "bg-red-50/30" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-zinc-400">{ticket.ticketNumber}</span>
                        {isBreach && <AlertTriangle size={11} className="text-red-500" title="SLA Breached" />}
                        {isFrBreach && !isBreach && <Clock size={11} className="text-orange-500" title="Response SLA Missed" />}
                      </div>
                      <p className="font-medium text-zinc-900 truncate max-w-[200px] lg:max-w-[300px]">
                        {ticket.subject}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-zinc-600 truncate block max-w-[140px]">
                        {ticket.createdBy?.name || ticket.createdBy?.email || "—"}
                      </span>
                      {ticket.tenantId?.name && (
                        <span className="text-[10px] text-zinc-400 block truncate max-w-[140px]">
                          {ticket.tenantId.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-zinc-500">
                        {ticket.category?.charAt(0) + ticket.category?.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${st}`}>
                        {ticket.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${pr}`}>
                        ● {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${rt}`}>
                        {ticket.routedTo === "TENANT" ? "Tenant" : "Platform"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-zinc-400 text-[10px] flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(ticket.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight
                        size={16}
                        className="text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all inline-block"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
