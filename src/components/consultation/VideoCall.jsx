import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize2,
  Minimize2,
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoCall = ({ socket, roomId, onEnd }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const callStartedRef = useRef(false);
  const iceDisconnectTimerRef = useRef(null);

  const [callState, setCallState] = useState("idle"); // idle | connecting | connected | ended
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  /* ---- Cleanup helper ---- */
  const cleanup = useCallback(() => {
    clearTimeout(iceDisconnectTimerRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
    // Only transition to "ended" if a call was actually in progress
    if (callStartedRef.current) {
      setCallState("ended");
    }
    callStartedRef.current = false;
  }, []);

  /* ---- Create RTCPeerConnection ---- */
  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
      setCallState("connected");
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "failed") {
        cleanup();
      } else if (state === "disconnected") {
        // ICE disconnected is often temporary — wait before giving up
        clearTimeout(iceDisconnectTimerRef.current);
        iceDisconnectTimerRef.current = setTimeout(() => {
          if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            cleanup();
          }
        }, 5000);
      } else if (state === "connected" || state === "completed") {
        clearTimeout(iceDisconnectTimerRef.current);
      }
    };

    return pc;
  }, [socket, roomId, cleanup]);

  /* ---- Start call (caller side) ---- */
  const startCall = useCallback(async () => {
    try {
      callStartedRef.current = true;
      setCallState("connecting");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      const pc = createPeer();
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // join-room is already handled by the parent (DoctorProfile)
      // Just send the offer to initiate the WebRTC handshake
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
    } catch (err) {
      console.error("Failed to start call:", err);
      setCallState("idle");
    }
  }, [socket, roomId, createPeer]);

  /* ---- Socket event listeners ---- */
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = async () => {
      // If we already sent an offer (user joined after we started), re-send it
      if (pcRef.current && pcRef.current.localDescription) {
        socket.emit("offer", { roomId, offer: pcRef.current.localDescription });
        return;
      }

      // If we haven't started yet, prepare our stream
      if (!localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
          }

          if (!pcRef.current) {
            const pc = createPeer();
            pcRef.current = pc;
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          }
        } catch (err) {
          console.error("Media access error:", err);
        }
      }
    };

    const handleOffer = async ({ offer }) => {
      try {
        callStartedRef.current = true;
        setCallState("connecting");

        if (!localStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
          }
        }

        const pc = pcRef.current || createPeer();
        pcRef.current = pc;

        if (!pc.getSenders().length) {
          localStreamRef.current.getTracks().forEach((track) =>
            pc.addTrack(track, localStreamRef.current)
          );
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const handleAnswer = async ({ answer }) => {
      try {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState("connected");
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    };

    const handleCallEnded = () => {
      cleanup();
      onEnd?.();
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket, roomId, createPeer, cleanup, onEnd]);

  /* ---- Unmount cleanup ---- */
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  /* ---- Toggle controls ---- */
  const toggleMic = () => {
    const audio = localStreamRef.current?.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setMicOn(audio.enabled);
    }
  };

  const toggleCam = () => {
    const video = localStreamRef.current?.getVideoTracks()[0];
    if (video) {
      video.enabled = !video.enabled;
      setCamOn(video.enabled);
    }
  };

  const endCall = () => {
    socket.emit("end-call", { roomId });
    cleanup();
    onEnd?.();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black rounded-sm overflow-hidden">
      {/* Remote video (main) */}
      <div className="relative w-full h-full bg-[#1a1a1a]">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {callState !== "connected" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#F0FDFA]/60">
            {callState === "idle" && (
              <button
                onClick={startCall}
                className="px-8 py-4 bg-[#0F766E] text-[#F0FDFA] text-[10px] uppercase tracking-[0.4em] font-bold
                           hover:bg-[#0F766E]/80 transition-colors"
              >
                Start Video Call
              </button>
            )}
            {callState === "connecting" && (
              <p className="text-[10px] uppercase tracking-[0.4em] animate-pulse">
                Connecting...
              </p>
            )}
            {callState === "ended" && (
              <p className="text-[10px] uppercase tracking-[0.4em]">Call Ended</p>
            )}
          </div>
        )}
      </div>

      {/* Local video (PiP) */}
      <div className="absolute top-3 right-3 w-28 sm:w-36 aspect-video bg-[#1E293B] rounded-sm overflow-hidden border border-white/10 shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Controls */}
      {callState !== "idle" && callState !== "ended" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-600"
            }`}
          >
            {micOn ? <Mic size={16} className="text-white" /> : <MicOff size={16} className="text-white" />}
          </button>
          <button
            onClick={toggleCam}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              camOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-600"
            }`}
          >
            {camOn ? <Video size={16} className="text-white" /> : <VideoOff size={16} className="text-white" />}
          </button>
          <button
            onClick={endCall}
            className="w-12 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
          >
            <PhoneOff size={16} className="text-white" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {fullscreen ? (
              <Minimize2 size={16} className="text-white" />
            ) : (
              <Maximize2 size={16} className="text-white" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
