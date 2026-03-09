import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  Plus,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Send,
  Tag,
  Filter,
} from "lucide-react";

const API_BASE = "http://localhost:5000";
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token") || "";
  const clean = t.replace(/['"]+/g, "").trim();
  if (clean && clean !== "null" && clean !== "undefined") {
    cfg.headers.Authorization = `Bearer ${clean}`;
  }
  return cfg;
});

const STATUS_STYLES = {
  OPEN: { bg: "bg-[#0F766E]/10", text: "text-[#0F766E]", label: "Open" },
  IN_PROGRESS: { bg: "bg-amber-50", text: "text-amber-600", label: "In Progress" },
  AWAITING_REPLY: { bg: "bg-blue-50", text: "text-blue-600", label: "Awaiting Reply" },
  RESOLVED: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Resolved" },
  CLOSED: { bg: "bg-[#1E293B]/5", text: "text-[#1E293B]/40", label: "Closed" },
};

const PRIORITY_STYLES = {
  LOW: "text-[#1E293B]/30",
  MEDIUM: "text-amber-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
};

const CATEGORIES = ["GENERAL", "BILLING", "TECHNICAL", "APPOINTMENT", "ACCOUNT", "FEEDBACK"];

const SupportTickets = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM",
    tenantId: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchClinics = async () => {
    try {
      const { data } = await api.get("/api/tickets/my-clinics");
      if (data.success) setClinics(data.clinics || []);
    } catch {
      // silent
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/api/tickets", { params });
      if (data.success) setTickets(data.tickets || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchClinics();
  }, [statusFilter]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(".ticket-card", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
      });
    }
  }, [loading, tickets]);

  const fetchDetail = async (id) => {
    setDetailLoading(true);
    setSelectedTicket(id);
    try {
      const { data } = await api.get(`/api/tickets/${id}`);
      if (data.success) setTicketDetail(data.data);
    } catch {
      setTicketDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setCreating(true);
    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        category: form.category,
        priority: form.priority,
      };
      if (form.tenantId) payload.tenantId = form.tenantId;

      const { data } = await api.post("/api/tickets", payload);
      if (data.success) {
        setShowCreate(false);
        setForm({ subject: "", description: "", category: "GENERAL", priority: "MEDIUM", tenantId: "" });
        fetchTickets();
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setReplySending(true);
    try {
      const { data } = await api.post(`/api/tickets/${selectedTicket}/reply`, {
        content: replyText,
      });
      if (data.success) {
        setReplyText("");
        fetchDetail(selectedTicket);
      }
    } catch {
      // silent
    } finally {
      setReplySending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F0FDFA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#0F766E] animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#1E293B]/40 font-bold">
            Loading Tickets...
          </p>
        </div>
      </div>
    );
  }

  // ──── TICKET DETAIL VIEW ────
  if (selectedTicket && ticketDetail) {
    const st = STATUS_STYLES[ticketDetail.status] || STATUS_STYLES.OPEN;
    const slaBreached = ticketDetail.slaBreached;
    const slaDeadline = ticketDetail.slaDeadline ? new Date(ticketDetail.slaDeadline) : null;
    const firstResponseBreached = ticketDetail.firstResponseBreached;
    const firstRespondedAt = ticketDetail.firstRespondedAt ? new Date(ticketDetail.firstRespondedAt) : null;
    const escalationLevel = ticketDetail.escalationLevel || 0;
    return (
      <div className="min-h-screen bg-[#F0FDFA] text-[#1E293B] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setSelectedTicket(null); setTicketDetail(null); }}
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-all mb-10"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Tickets
          </button>

          {/* Ticket Header */}
          <div className="border-b border-[#1E293B]/5 pb-8 mb-8">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-[9px] font-mono tracking-widest text-[#0F766E]">
                {ticketDetail.ticketNumber}
              </span>
              <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full ${st.bg} ${st.text}`}>
                {st.label}
              </span>
              {slaBreached && (
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full bg-red-50 text-red-500">
                  Escalated
                </span>
              )}
              {escalationLevel > 0 && !slaBreached && (
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-500">
                  Priority Updated
                </span>
              )}
            </div>
            <h1 className="text-3xl font-light tracking-tight uppercase">{ticketDetail.subject}</h1>
            <p className="text-sm text-[#1E293B]/50 mt-3 leading-relaxed">{ticketDetail.description}</p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1E293B]/30">
                {ticketDetail.category}
              </span>
              <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${PRIORITY_STYLES[ticketDetail.priority]}`}>
                {ticketDetail.priority} Priority
              </span>
            </div>

            {/* SLA Info for Patient */}
            <div className="flex flex-wrap gap-4 mt-5 p-3 bg-[#0F766E]/5 rounded-lg border border-[#0F766E]/10">
              <div className="text-[9px]">
                <span className="text-[#1E293B]/30 uppercase tracking-[0.2em] block mb-0.5">Response</span>
                {firstRespondedAt ? (
                  <span className="text-[#0F766E] font-bold">
                    Responded {firstRespondedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                  </span>
                ) : firstResponseBreached ? (
                  <span className="text-red-500 font-bold">Overdue</span>
                ) : (
                  <span className="text-[#1E293B]/50">Awaiting response</span>
                )}
              </div>
              <div className="text-[9px]">
                <span className="text-[#1E293B]/30 uppercase tracking-[0.2em] block mb-0.5">Resolution</span>
                {ticketDetail.resolvedAt ? (
                  <span className="text-[#0F766E] font-bold">Resolved</span>
                ) : slaDeadline ? (
                  <span className={slaBreached || slaDeadline < new Date() ? "text-red-500 font-bold" : "text-[#1E293B]/50"}>
                    {slaBreached ? "Escalated — higher priority" : `Target: ${slaDeadline.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}`}
                  </span>
                ) : (
                  <span className="text-[#1E293B]/50">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-10">
            {ticketDetail.messages?.length === 0 && (
              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#1E293B]/20 font-bold py-10">
                No replies yet
              </p>
            )}
            {ticketDetail.messages?.map((msg, i) => {
              const isAdmin = msg.senderRole === "SUPER_ADMIN";
              return (
                <div
                  key={i}
                  className={`p-5 border ${
                    isAdmin
                      ? "border-[#0F766E]/20 bg-[#0F766E]/3"
                      : "border-[#1E293B]/5 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1E293B]/40">
                      {isAdmin ? "Support Team" : msg.sender?.name || "You"}
                    </span>
                    <span className="text-[9px] tracking-widest text-[#1E293B]/20">
                      {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#1E293B]/70 leading-relaxed">{msg.content}</p>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          {!["CLOSED", "RESOLVED"].includes(ticketDetail.status) && (
            <div className="flex gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Type your reply..."
                className="flex-1 bg-white border border-[#1E293B]/10 px-5 py-4 text-sm outline-none focus:border-[#0F766E] transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={replySending || !replyText.trim()}
                className="px-6 py-4 bg-[#1E293B] text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#0F766E] transition-all duration-500 disabled:opacity-30"
              >
                {replySending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──── CREATE TICKET FORM ────
  if (showCreate) {
    return (
      <div className="min-h-screen bg-[#F0FDFA] text-[#1E293B] pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowCreate(false)}
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-all mb-10"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Cancel
          </button>

          <h1 className="text-4xl font-light tracking-tighter uppercase mb-2">
            New <span className="italic font-serif text-[#0F766E]">Ticket</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#1E293B]/30 font-bold mb-12">
            Describe your issue and our team will respond promptly.
          </p>

          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 block mb-2">
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                maxLength={200}
                className="w-full bg-white border border-[#1E293B]/10 px-5 py-4 text-sm outline-none focus:border-[#0F766E] transition-colors"
                placeholder="Brief summary of your issue"
                required
              />
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 block mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={3000}
                rows={5}
                className="w-full bg-white border border-[#1E293B]/10 px-5 py-4 text-sm outline-none focus:border-[#0F766E] transition-colors resize-none"
                placeholder="Detailed description of the problem"
                required
              />
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 block mb-2">
                Related Clinic
              </label>
              <select
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                className="w-full bg-white border border-[#1E293B]/10 px-5 py-4 text-sm outline-none focus:border-[#0F766E] transition-colors"
              >
                <option value="">General / Platform Issue</option>
                {clinics.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#1E293B]/25 mt-1.5">
                Select a clinic if this issue is related to a specific clinic
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 block mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white border border-[#1E293B]/10 px-5 py-4 text-sm outline-none focus:border-[#0F766E] transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0) + c.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 block mb-2">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-white border border-[#1E293B]/10 px-5 py-4 text-sm outline-none focus:border-[#0F766E] transition-colors"
                >
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-5 bg-[#1E293B] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#0F766E] transition-all duration-500 disabled:opacity-50"
            >
              {creating ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ──── TICKET LIST ────
  return (
    <div ref={containerRef} className="min-h-screen bg-[#F0FDFA] text-[#1E293B] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-all mb-6"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <h1 className="text-5xl font-light tracking-tighter uppercase leading-none">
              Support <span className="italic font-serif text-[#0F766E]">Tickets</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#1E293B]/30 font-bold mt-3">
              {tickets.length} tickets
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-8 py-4 bg-[#1E293B] text-white text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#0F766E] transition-all duration-500 shadow-lg"
          >
            <Plus size={14} /> New Ticket
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-8">
          <Filter size={12} className="text-[#1E293B]/20" />
          {["", "OPEN", "IN_PROGRESS", "AWAITING_REPLY", "RESOLVED", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${
                statusFilter === s
                  ? "bg-[#1E293B] text-white"
                  : "text-[#1E293B]/30 hover:text-[#1E293B]"
              }`}
            >
              {s ? (STATUS_STYLES[s]?.label || s) : "All"}
            </button>
          ))}
        </div>

        {/* Ticket Cards */}
        {tickets.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#1E293B]/5 rounded-[40px]">
            <MessageSquare size={40} className="text-[#1E293B]/10 mb-4" />
            <h3 className="text-base font-light uppercase tracking-tight">No Tickets</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#1E293B]/30 font-bold mt-2">
              Create a ticket to get support from our team.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const st = STATUS_STYLES[t.status] || STATUS_STYLES.OPEN;
              return (
                <div
                  key={t._id}
                  onClick={() => fetchDetail(t._id)}
                  className="ticket-card group bg-white border border-[#1E293B]/5 p-6 cursor-pointer hover:border-[#0F766E]/30 hover:shadow-lg transition-all duration-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-mono tracking-widest text-[#0F766E]">
                          {t.ticketNumber}
                        </span>
                        <span className={`text-[8px] uppercase tracking-[0.2em] font-bold px-2.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                        <span className={`text-[8px] uppercase tracking-[0.2em] font-bold ${PRIORITY_STYLES[t.priority]}`}>
                          {t.priority}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-[#1E293B] truncate group-hover:text-[#0F766E] transition-colors">
                        {t.subject}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] uppercase tracking-widest text-[#1E293B]/20 font-bold flex items-center gap-1">
                          <Tag size={10} /> {t.category}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-[#1E293B]/20 font-bold flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(t.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-[#1E293B]/10 group-hover:text-[#0F766E] transition-colors shrink-0 mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
