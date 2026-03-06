import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  MessageCircle,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  Calendar,
  Ticket,
  Shield,
} from "lucide-react";

const API_BASE = "http://localhost:5000";
const api = axios.create({ baseURL: API_BASE, timeout: 30000 });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token") || "";
  const clean = t.replace(/['"]+/g, "").trim();
  if (clean && clean !== "null" && clean !== "undefined") {
    cfg.headers.Authorization = `Bearer ${clean}`;
  }
  return cfg;
});

/* Simple markdown renderer for bold, bullets, headings, and italic */
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold: **text**
    let html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Bullet points
    if (/^[•\-]\s/.test(html.trim())) {
      html = html.replace(/^[•\-]\s*/, "");
      return <li key={i} className="ml-4 list-disc text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    // Numbered list
    if (/^\d+\.\s/.test(html.trim())) {
      html = html.replace(/^\d+\.\s*/, "");
      return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    // Heading-like (--- line)
    if (/^---+$/.test(html.trim())) {
      return <hr key={i} className="border-[#1E293B]/10 my-2" />;
    }
    // Empty line
    if (!html.trim()) return <br key={i} />;
    // Normal paragraph
    return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  });
};

const AIChatbot = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Load sessions ──
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get("/api/chatbot/sessions");
        if (data.success) setSessions(data.sessions || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // ── Load session messages ──
  useEffect(() => {
    if (!activeSessionId) return;
    const load = async () => {
      try {
        const { data } = await api.get(`/api/chatbot/sessions/${activeSessionId}`);
        if (data.success) setMessages(data.session?.messages || []);
      } catch {
        // silent
      }
    };
    load();
  }, [activeSessionId]);

  // ── Auto scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── GSAP on mount ──
  useEffect(() => {
    if (!loading) {
      gsap.from(".chat-session-item", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.out",
      });
    }
  }, [loading, sessions.length]);

  const createNewSession = async () => {
    try {
      const { data } = await api.post("/api/chatbot/sessions");
      if (data.success) {
        setSessions((prev) => [data.session, ...prev]);
        setActiveSessionId(data.session._id);
        setMessages(data.session.messages || []);
        inputRef.current?.focus();
      }
    } catch {
      // silent
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chatbot/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch {
      // silent
    }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending) return;

    // If no active session, create one first
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const { data } = await api.post("/api/chatbot/sessions");
        if (data.success) {
          sessionId = data.session._id;
          setSessions((prev) => [data.session, ...prev]);
          setActiveSessionId(sessionId);
        }
      } catch {
        return;
      }
    }

    // Optimistic user message
    const tempUserMsg = { role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post(`/api/chatbot/sessions/${sessionId}/message`, {
        message: msg,
      });
      if (data.success) {
        setMessages(data.messages || []);
        // Update session title in sidebar
        if (data.session?.title) {
          setSessions((prev) =>
            prev.map((s) => (s._id === sessionId ? { ...s, title: data.session.title } : s))
          );
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F0FDFA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#0F766E] animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#1E293B]/40 font-bold">
            Loading AI Assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F0FDFA] text-[#1E293B] flex flex-col pt-20">
      {/* Top Bar */}
      <div className="border-b border-[#1E293B]/5 px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B] transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 flex items-center justify-center">
              <Bot size={16} className="text-[#0F766E]" />
            </div>
            <div>
              <h1 className="text-sm font-medium uppercase tracking-tight">AI Health Assistant</h1>
              <p className="text-[8px] uppercase tracking-[0.3em] text-[#0F766E] font-bold">
                Symptom Checker
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-[10px] uppercase tracking-[0.3em] font-bold text-[#1E293B]/40 hover:text-[#1E293B]"
        >
          Sessions
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <div
          className={`${
            sidebarOpen ? "flex" : "hidden md:flex"
          } flex-col w-72 border-r border-[#1E293B]/5 bg-white/40`}
        >
          <div className="p-4 border-b border-[#1E293B]/5">
            <button
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1E293B] text-white text-[9px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-[#0F766E] transition-all duration-500"
            >
              <Plus size={12} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sessions.length === 0 ? (
              <p className="text-center text-[9px] uppercase tracking-[0.2em] text-[#1E293B]/20 font-bold py-8">
                No sessions yet
              </p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s._id}
                  onClick={() => {
                    setActiveSessionId(s._id);
                    setSidebarOpen(false);
                  }}
                  className={`chat-session-item group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeSessionId === s._id
                      ? "bg-[#0F766E]/10 border border-[#0F766E]/20"
                      : "hover:bg-[#1E293B]/2"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageCircle
                      size={12}
                      className={activeSessionId === s._id ? "text-[#0F766E]" : "text-[#1E293B]/20"}
                    />
                    <span className="text-[10px] font-medium truncate">{s.title || "New Chat"}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s._id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="flex-1 flex flex-col">
          {!activeSessionId ? (
            /* Welcome */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-[#0F766E]/10 flex items-center justify-center mx-auto mb-6">
                  <Bot size={36} className="text-[#0F766E]" />
                </div>
                <h2 className="text-3xl font-light tracking-tighter uppercase mb-3">
                  AI Health <span className="italic font-serif text-[#0F766E]">Assistant</span>
                </h2>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#1E293B]/30 font-bold mb-8 leading-relaxed">
                  Describe your symptoms and get instant guidance on potential causes and recommended
                  specialists.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  {[
                    { icon: <Stethoscope size={16} />, label: "Symptom Analysis" },
                    { icon: <Calendar size={16} />, label: "Book Appointments" },
                    { icon: <Shield size={16} />, label: "Emergency Detection" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#1E293B]/5 p-4 text-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 flex items-center justify-center mx-auto mb-2 text-[#0F766E]">
                        {item.icon}
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#1E293B]/40">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={createNewSession}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#1E293B] text-white text-[9px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-[#0F766E] transition-all duration-500"
                >
                  <Plus size={12} /> Start New Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[65%] p-4 ${
                        m.role === "user"
                          ? "bg-[#1E293B] text-white rounded-[20px] rounded-br-sm"
                          : "bg-white border border-[#1E293B]/5 rounded-[20px] rounded-bl-sm"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Bot size={10} className="text-[#0F766E]" />
                          <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#0F766E]">
                            HealthBot
                          </span>
                        </div>
                      )}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{renderMarkdown(m.content)}</div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#1E293B]/5 rounded-[20px] rounded-bl-sm p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin text-[#0F766E]" />
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#1E293B]/30 font-bold">
                          Analyzing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[#1E293B]/5 p-4 bg-white/60 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your symptoms..."
                    rows={1}
                    className="flex-1 resize-none bg-[#F0FDFA] border border-[#1E293B]/5 rounded-2xl px-5 py-3 text-sm placeholder:text-[#1E293B]/20 focus:outline-none focus:border-[#0F766E]/30 transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-11 h-11 rounded-full bg-[#1E293B] text-white flex items-center justify-center hover:bg-[#0F766E] transition-all duration-500 disabled:opacity-30 disabled:hover:bg-[#1E293B] shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <p className="text-center text-[8px] uppercase tracking-[0.2em] text-[#1E293B]/15 font-bold mt-2">
                  For informational purposes only — not a substitute for professional medical advice
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
