import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  Bell,
  CheckCircle2,
  Calendar,
  Video,
  AlertCircle,
  Trash2,
  ArrowLeft,
  Loader2,
  CreditCard,
  MessageSquare,
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

const iconMap = {
  APPOINTMENT: <Calendar size={18} />,
  REMINDER: <Bell size={18} />,
  TICKET: <MessageSquare size={18} />,
  SYSTEM: <AlertCircle size={18} />,
  BILLING: <CreditCard size={18} />,
  CHAT: <Video size={18} />,
};

const timeAgo = (date) => {
  const now = new Date();
  const d = new Date(date);
  const mins = Math.floor((now - d) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const Notifications = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    try {
      const params = {};
      if (filter === "unread") params.unreadOnly = "true";
      const { data } = await api.get("/api/notifications", { params });
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        ".notif-item",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loading, notifications]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch("/api/notifications/read-all");
    } catch {
      // silent
    }
  };

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await api.delete(`/api/notifications/${id}`);
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#8DAA9D] animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#2D302D]/40 font-bold">
            Loading Notifications...
          </p>
        </div>
      </div>
    );
  }

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div
      ref={containerRef}
      className="bg-[#FAF9F6] text-[#2D302D] min-h-screen selection:bg-[#8DAA9D] selection:text-white"
    >
      {/* Header */}
      <div className="pt-32 pb-12 px-6 lg:px-16 border-b border-[#2D302D]/5">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-[#2D302D]/40 hover:text-[#2D302D] transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-light tracking-tighter uppercase">
                Notifications
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#8DAA9D] font-bold mt-3">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#8DAA9D] border border-[#8DAA9D]/30 px-5 py-2.5 rounded-full hover:bg-[#8DAA9D] hover:text-[#FAF9F6] transition-all duration-300"
              >
                <CheckCircle2 size={12} />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-8">
            {["all", "unread"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 text-[10px] uppercase tracking-[0.3em] font-bold transition-all ${
                  filter === f
                    ? "bg-[#2D302D] text-[#FAF9F6]"
                    : "text-[#2D302D]/40 hover:text-[#2D302D]"
                }`}
              >
                {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="px-6 lg:px-16 py-12">
        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Bell size={40} className="mx-auto text-[#2D302D]/10 mb-4" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#2D302D]/30 font-bold">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n._id}
                className={`notif-item flex items-start gap-5 p-6 border transition-all cursor-pointer group ${
                  n.isRead
                    ? "border-[#2D302D]/5 bg-white"
                    : "border-[#8DAA9D]/20 bg-[#8DAA9D]/[0.03]"
                } hover:border-[#8DAA9D]/40`}
                onClick={() => !n.isRead && markAsRead(n._id)}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    n.isRead ? "bg-[#2D302D]/5 text-[#2D302D]/30" : "bg-[#8DAA9D]/10 text-[#8DAA9D]"
                  }`}
                >
                  {iconMap[n.type] || <Bell size={18} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        n.isRead ? "text-[#2D302D]/60" : "text-[#2D302D]"
                      }`}
                    >
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#8DAA9D] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#2D302D]/50 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#2D302D]/25 font-bold mt-2 block">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2D302D]/20 hover:text-red-400 flex-shrink-0 mt-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
