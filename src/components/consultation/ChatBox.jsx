import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send } from "lucide-react";

const ChatBox = ({ socket, roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [remoteTyping, setRemoteTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const senderName = currentUser || "You";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* ---- Socket listeners ---- */
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleTyping = () => setRemoteTyping(true);
    const handleStopTyping = () => setRemoteTyping(false);

    socket.on("chat-message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("chat-message", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [socket]);

  /* ---- Auto scroll on new messages ---- */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ---- Typing indicator ---- */
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!socket || !roomId) return;
    socket.emit("typing", { roomId, sender: senderName });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId, sender: senderName });
    }, 1000);
  };

  /* ---- Send message ---- */
  const sendMessage = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socket || !roomId) return;

    socket.emit("chat-message", {
      roomId,
      message: text,
      sender: senderName,
      timestamp: Date.now(),
    });

    socket.emit("stop-typing", { roomId, sender: senderName });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8DAA9D]">
          Live Chat
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-8">
            No messages yet
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender === senderName;
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-sm ${
                  isMe
                    ? "bg-[#8DAA9D] text-[#FAF9F6]"
                    : "bg-white/10 text-[#FAF9F6]/90"
                }`}
              >
                {!isMe && (
                  <span className="block text-[8px] uppercase tracking-widest text-[#8DAA9D] font-bold mb-1">
                    {msg.sender}
                  </span>
                )}
                <p className="text-xs leading-relaxed break-words">{msg.message}</p>
                <span className="block text-[8px] opacity-40 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        {remoteTyping && (
          <div className="flex justify-start">
            <span className="text-[10px] text-white/30 italic animate-pulse">typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 px-3 py-3 border-t border-white/5">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs text-[#FAF9F6] 
                     placeholder:text-white/20 outline-none focus:border-[#8DAA9D]/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-8 h-8 flex items-center justify-center bg-[#8DAA9D] rounded-sm 
                     hover:bg-[#8DAA9D]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={14} className="text-[#FAF9F6]" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
