import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { Video, MessageSquare, X, AlertCircle, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import VideoCall from "../components/consultation/VideoCall";
import ChatBox from "../components/consultation/ChatBox";
import { API_BASE_URL as API_BASE } from "../utils/apiConfig";

const SOCKET_URL = API_BASE;

const getAuthToken = () => {
  const t =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";
  return t.replace(/['"]+/g, "").trim();
};

const ConsultationRoom = () => {
  const { roomToken } = useParams(); // JWT meeting token from URL
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState("video");
  const [verifying, setVerifying] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // ── Step 1: Verify JWT meeting token via backend ──
  useEffect(() => {
    if (!roomToken) {
      setError("Invalid meeting link.");
      setVerifying(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Please login to join the consultation.");
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/video-consultations/verify-token`,
          { meetingToken: roomToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          setSessionData(data.data.session);
          setRoomId(data.data.roomId);
          setUserRole(data.data.role);
        } else {
          setError(data.message || "Verification failed.");
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to verify meeting link.";
        setError(msg);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [roomToken]);

  // ── Step 2: Connect to Socket.IO after verification succeeds ──
  useEffect(() => {
    if (!roomId) return;

    setConnecting(true);
    const socketRoomId = `consultation:${roomId}`;

    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    s.on("connect", () => {
      s.emit("join-room", { roomId: socketRoomId, userId: `user-${Date.now()}` });
      setSocket(s);
      setConnecting(false);
    });

    s.on("connect_error", () => setConnecting(false));

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [roomId]);

  // ── End call handler ──
  const handleEnd = useCallback(async () => {
    if (roomId) {
      const token = getAuthToken();
      try {
        await axios.post(
          `${API_BASE}/api/video-consultations/end`,
          { roomId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {
        // silent — best effort
      }
    }
    socket?.disconnect();
    setSocket(null);
    navigate("/appointments");
  }, [socket, navigate, roomId]);

  // ── Verifying state ──
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={28} className="animate-spin text-[#0F766E]" />
          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            Verifying meeting link...
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4 max-w-md px-6">
          <ShieldX size={36} className="mx-auto text-red-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Access Denied
          </h2>
          <p className="text-[11px] text-gray-400 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/appointments")}
              className="px-6 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold"
            >
              My Appointments
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 border border-white/20 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const socketRoomId = `consultation:${roomId}`;

  // Resolve display name for the current user
  const currentUserName =
    userRole === "DOCTOR"
      ? sessionData?.doctorId?.name || "Doctor"
      : sessionData?.patientId?.name || "Patient";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">
            Sovereign Healthbook — Video Consultation
          </span>
          <ShieldCheck size={12} className="text-emerald-400" />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded">
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded transition-all ${
              activeTab === "video"
                ? "bg-white text-black"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <Video size={12} /> Video
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded transition-all ${
              activeTab === "chat"
                ? "bg-white text-black"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <MessageSquare size={12} /> Chat
          </button>
        </div>

        <button
          onClick={handleEnd}
          className="flex items-center gap-2 px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 transition-colors"
        >
          <X size={14} /> Leave
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center p-4">
        {connecting ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={28} className="animate-spin text-gray-500" />
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Connecting to session...
            </p>
          </div>
        ) : !socket ? (
          <div className="text-center space-y-4">
            <AlertCircle size={28} className="mx-auto text-amber-400" />
            <p className="text-sm text-gray-400">
              Unable to connect. Please check your internet and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl h-[75vh] relative">
            <div className={`w-full h-full ${activeTab === "video" ? "" : "hidden"}`}>
              <VideoCall socket={socket} roomId={socketRoomId} onEnd={handleEnd} />
            </div>
            <div className={`w-full h-full ${activeTab === "chat" ? "" : "hidden"}`}>
              <ChatBox socket={socket} roomId={socketRoomId} currentUser={currentUserName} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationRoom;
