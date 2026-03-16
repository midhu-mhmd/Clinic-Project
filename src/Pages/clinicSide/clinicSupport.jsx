import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
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
  Circle,
  Filter,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

/* =========================================================
   AUTH HELPERS
========================================================= */
const cleanToken = (t) => {
  if (!t || typeof t !== "string") return null;
  const x = t.replace(/['"]+/g, "").trim();
  if (!x || x === "undefined" || x === "null") return null;
  return x;
};

const isValidJwt = (t) => {
  const x = cleanToken(t);
  if (!x) return false;
  return x.split(".").length === 3;
};

const readAuthToken = () => {
  const t1 = cleanToken(localStorage.getItem("authToken"));
  if (isValidJwt(t1)) return t1;
  const t2 = cleanToken(localStorage.getItem("token"));
  if (isValidJwt(t2)) return t2;
  return null;
};

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use((cfg) => {
  const t = readAuthToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
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
  CLOSED: "bg-gray-100 text-gray-500",
};

const PRIORITY_STYLES = {
  LOW: "text-gray-400",
  MEDIUM: "text-blue-500",
  HIGH: "text-amber-500",
  URGENT: "text-red-500",
};

const CATEGORIES = [
  "BILLING",
  "TECHNICAL",
  "APPOINTMENT",
  "ACCOUNT",
  "GENERAL",
  "FEEDBACK",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

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
const ClinicSupport = () => {
  // ── State ──
  const [view, setView] = useState("list"); // list | create | detail
  const [mode, setMode] = useState("my"); // my | received
  const [tickets, setTickets] = useState([]);
  const [receivedTickets, setReceivedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Create form
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM",
  });
  const [creating, setCreating] = useState(false);

  /* ── Fetch own tickets ── */
  const fetchTickets = useCallback(async () => {
    try {
      setError("");
      const { data } = await api.get("/api/tickets");
      if (data.success) {
        setTickets(data.tickets || data.data || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch tenant-routed tickets ── */
  const fetchReceivedTickets = useCallback(async () => {
    try {
      const { data } = await api.get("/api/tickets/tenant");
      if (data.success) {
        setReceivedTickets(data.tickets || data.data || []);
      }
    } catch {
      // may fail for non-clinic-admin users — silent
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchReceivedTickets();
  }, [fetchTickets, fetchReceivedTickets]);

  /* ── Filtered tickets ── */
  const filteredTickets = useMemo(() => {
    let list = mode === "received" ? receivedTickets : tickets;
    if (activeTab !== "ALL") {
      list = list.filter((t) => t.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject?.toLowerCase().includes(q) ||
          t.ticketNumber?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, receivedTickets, mode, activeTab, searchQuery]);

  /* ── Open ticket detail ── */
  const openDetail = useCallback(async (ticketId) => {
    setDetailLoading(true);
    setView("detail");
    try {
      const { data } = await api.get(`/api/tickets/${ticketId}`);
      if (data.success) {
        setSelectedTicket(data.ticket || data.data);
      }
    } catch {
      setError("Failed to load ticket details.");
      setView("list");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* ── Create ticket ── */
  const handleCreate = useCallback(async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post("/api/tickets", form);
      if (data.success) {
        setTickets((prev) => [data.ticket || data.data, ...prev]);
        setForm({ subject: "", description: "", category: "GENERAL", priority: "MEDIUM" });
        setView("list");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  }, [form]);

  /* ── Reply to ticket ── */
  const handleReply = useCallback(async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      const { data } = await api.post(`/api/tickets/${selectedTicket._id}/reply`, {
        content: replyText.trim(),
      });
      if (data.success) {
        setSelectedTicket(data.ticket || data.data);
        setReplyText("");
        // refresh the list in background
        fetchTickets();
        fetchReceivedTickets();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reply.");
    } finally {
      setReplying(false);
    }
  }, [replyText, selectedTicket, fetchTickets, fetchReceivedTickets]);

  /* =========================================================
     RENDER — CREATE FORM
  ========================================================= */
  if (view === "create") {
    return (
      <div className="p-8 lg:p-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <button
          onClick={() => setView("list")}
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Tickets
        </button>

        <h2 className="text-2xl font-light tracking-tighter mb-1">
          New Support <span className="italic font-serif">Ticket</span>
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-10">
          Describe your issue and our team will respond promptly
        </p>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
              Subject
            </label>
            <input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Brief description of the issue"
              className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Provide detailed information about your issue..."
              rows={6}
              className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleCreate}
              disabled={creating || !form.subject.trim() || !form.description.trim()}
              className="px-8 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              {creating ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Submit Ticket
            </button>
            <button
              onClick={() => setView("list")}
              className="px-8 py-3 border border-gray-200 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black hover:border-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER — TICKET DETAIL
  ========================================================= */
  if (view === "detail") {
    if (detailLoading) {
      return (
        <div className="p-12 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      );
    }

    if (!selectedTicket) return null;

    const st = STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.OPEN;
    const pr = PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.MEDIUM;
    const isReceived = mode === "received";
    const slaBreached = selectedTicket.slaBreached;
    const slaDeadline = selectedTicket.slaDeadline ? new Date(selectedTicket.slaDeadline) : null;
    const firstResponseDeadline = selectedTicket.firstResponseDeadline ? new Date(selectedTicket.firstResponseDeadline) : null;
    const firstRespondedAt = selectedTicket.firstRespondedAt ? new Date(selectedTicket.firstRespondedAt) : null;
    const firstResponseBreached = selectedTicket.firstResponseBreached;
    const escalationLevel = selectedTicket.escalationLevel || 0;
    const isPaused = !!selectedTicket.slaPausedAt;

    /* ── Status update handler (received tickets) ── */
    const handleStatusChange = async (newStatus) => {
      setStatusUpdating(true);
      try {
        const { data } = await api.patch(`/api/tickets/${selectedTicket._id}/status`, { status: newStatus });
        if (data.success) {
          setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
          fetchReceivedTickets();
        }
      } catch {
        setError("Failed to update ticket status.");
      } finally {
        setStatusUpdating(false);
      }
    };

    return (
      <div className="p-8 lg:p-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <button
          onClick={() => {
            setView("list");
            setSelectedTicket(null);
          }}
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Tickets
        </button>

        {/* Ticket Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-[9px] font-mono tracking-widest text-gray-400">
              {selectedTicket.ticketNumber}
            </span>
            <span className={`text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-sm ${st}`}>
              {selectedTicket.status?.replace(/_/g, " ")}
            </span>
            <span className={`text-[8px] uppercase tracking-widest font-bold ${pr}`}>
              ● {selectedTicket.priority}
            </span>
            {slaBreached && (
              <span className="text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-sm bg-red-50 text-red-500">
                SLA Breached
              </span>
            )}
            {firstResponseBreached && (
              <span className="text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-sm bg-orange-50 text-orange-500">
                Response SLA Missed
              </span>
            )}
            {isPaused && (
              <span className="text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-sm bg-blue-50 text-blue-500">
                SLA Paused
              </span>
            )}
            {escalationLevel > 0 && (
              <span className={`text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-sm ${
                escalationLevel >= 2 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
              }`}>
                Escalation L{escalationLevel}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-light tracking-tighter">
            {selectedTicket.subject}
          </h2>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {selectedTicket.description}
          </p>

          {/* SLA Timeline */}
          {isReceived && (
            <div className="flex flex-wrap gap-4 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-[9px]">
                <span className="text-gray-400 uppercase tracking-widest block mb-0.5">First Response</span>
                {firstRespondedAt ? (
                  <span className={firstResponseBreached ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                    {firstRespondedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                    {firstResponseBreached ? " (Late)" : " \u2713"}
                  </span>
                ) : firstResponseDeadline ? (
                  <span className={firstResponseDeadline < new Date() ? "text-red-500 font-bold" : "text-gray-600"}>
                    Due: {firstResponseDeadline.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                  </span>
                ) : (
                  <span className="text-gray-400">&mdash;</span>
                )}
              </div>
              <div className="text-[9px]">
                <span className="text-gray-400 uppercase tracking-widest block mb-0.5">Resolution Deadline</span>
                {slaDeadline ? (
                  <span className={slaBreached || slaDeadline < new Date() ? "text-red-500 font-bold" : "text-gray-600"}>
                    {slaDeadline.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                    {slaBreached ? " (Breached)" : ""}
                  </span>
                ) : (
                  <span className="text-gray-400">&mdash;</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mt-4 text-[9px] uppercase tracking-widest text-gray-400 font-bold flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {timeAgo(selectedTicket.createdAt)}
            </span>
            <span>
              {selectedTicket.category?.charAt(0) + selectedTicket.category?.slice(1).toLowerCase()}
            </span>
            {isReceived && selectedTicket.createdBy && (
              <span>
                From: {selectedTicket.createdBy.name || selectedTicket.createdBy.email || "Patient"}
              </span>
            )}
          </div>

          {/* Status actions for received tickets */}
          {isReceived && !["RESOLVED", "CLOSED"].includes(selectedTicket.status) && (
            <div className="flex items-center gap-2 mt-6">
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mr-2">Update:</span>
              {["IN_PROGRESS", "RESOLVED", "CLOSED"].filter(s => s !== selectedTicket.status).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusUpdating}
                  className="px-3 py-1.5 text-[8px] uppercase tracking-widest font-bold border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-30"
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages Thread */}
        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6 flex items-center gap-2">
            <MessageSquare size={12} />
            Conversation ({selectedTicket.messages?.length || 0})
          </h3>

          <div className="space-y-4 mb-8">
            {(selectedTicket.messages || []).map((msg, i) => {
              const isStaff = msg.senderRole === "SUPER_ADMIN" || msg.senderRole === "CLINIC_ADMIN";
              const senderLabel = msg.senderRole === "SUPER_ADMIN"
                ? "Platform Support"
                : msg.senderRole === "CLINIC_ADMIN"
                ? (isReceived ? "You (Clinic)" : "You")
                : isReceived
                ? (msg.sender?.name || "Patient")
                : "You";
              return (
                <div
                  key={i}
                  className={`p-5 border ${
                    isStaff
                      ? "border-black/5 bg-gray-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
                      {senderLabel}
                    </span>
                    <span className="text-[9px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{msg.content}</p>
                </div>
              );
            })}

            {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
              <p className="text-sm text-gray-400 italic py-4">No replies yet.</p>
            )}
          </div>

          {/* Reply Input */}
          {!["RESOLVED", "CLOSED"].includes(selectedTicket.status) && (
            <div className="flex gap-3">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
                placeholder="Type your reply..."
                className="flex-1 bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                className="px-6 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 disabled:opacity-30 transition-colors flex items-center gap-2"
              >
                {replying ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Reply
              </button>
            </div>
          )}

          {["RESOLVED", "CLOSED"].includes(selectedTicket.status) && (
            <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <CheckCircle2 size={14} />
              This ticket has been {selectedTicket.status.toLowerCase()}.
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER — TICKET LIST
  ========================================================= */
  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-light tracking-tighter">
            Support <span className="italic font-serif">Center</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
            {mode === "received" ? receivedTickets.length : tickets.length} total tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex border border-gray-200">
            <button
              onClick={() => { setMode("my"); setActiveTab("ALL"); }}
              className={`px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold transition-all ${
                mode === "my" ? "bg-black text-white" : "text-gray-400 hover:text-black"
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => { setMode("received"); setActiveTab("ALL"); }}
              className={`px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold transition-all relative ${
                mode === "received" ? "bg-black text-white" : "text-gray-400 hover:text-black"
              }`}
            >
              Received
              {receivedTickets.filter(t => !["RESOLVED","CLOSED"].includes(t.status)).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full">
                  {receivedTickets.filter(t => !["RESOLVED","CLOSED"].includes(t.status)).length}
                </span>
              )}
            </button>
          </div>
          {mode === "my" && (
            <button
              onClick={() => setView("create")}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} /> New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 mb-6">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">{error}</span>
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} className="text-red-300" />
          </button>
        </div>
      )}

      {/* Search + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH TICKETS..."
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 text-[10px] tracking-widest uppercase focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
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
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <LifeBuoy size={28} className="text-gray-200" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
            No Tickets Found
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-300 max-w-sm">
            {searchQuery || activeTab !== "ALL"
              ? "No tickets match your current filters."
              : "Create your first support ticket to get help."}
          </p>
        </div>
      )}

      {/* Ticket List */}
      {!loading && filteredTickets.length > 0 && (
        <div className="space-y-2">
          {filteredTickets.map((ticket) => {
            const st = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN;
            const pr = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;
            const isBreach = ticket.slaBreached;
            const isFrBreach = ticket.firstResponseBreached;
            return (
              <div
                key={ticket._id}
                onClick={() => openDetail(ticket._id)}
                className={`group bg-white border p-5 flex items-center justify-between gap-6 cursor-pointer hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${isBreach ? "border-red-200" : "border-gray-100"}`}
              >
                <div className="flex items-center gap-5 min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${pr.replace("text-", "bg-")}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-[9px] font-mono tracking-widest text-gray-400">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm ${st}`}>
                        {ticket.status?.replace(/_/g, " ")}
                      </span>
                      {isBreach && (
                        <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm bg-red-50 text-red-500">
                          SLA Breached
                        </span>
                      )}
                      {isFrBreach && !isBreach && (
                        <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm bg-orange-50 text-orange-500">
                          Response Late
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-4 mt-1 text-[9px] text-gray-400 flex-wrap">
                      <span>{ticket.category?.charAt(0) + ticket.category?.slice(1).toLowerCase()}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={9} /> {timeAgo(ticket.createdAt)}
                      </span>
                      {mode === "received" && ticket.createdBy && (
                        <span>From: {ticket.createdBy.name || ticket.createdBy.email || "Patient"}</span>
                      )}
                      {ticket.messages?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare size={9} /> {ticket.messages.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClinicSupport;
