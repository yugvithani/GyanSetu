import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import AttachmentButton from "./../components/AttachmentButton";
import { HiDocumentText } from "react-icons/hi";
import { FiSend, FiMessageSquare } from "react-icons/fi";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
const SOCKET_URL = VITE_BASE_URL.replace("/api", "");

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Group messages by date for date separators
const groupByDate = (messages) => {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const date = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
    if (date && date !== lastDate) {
      groups.push({ type: "separator", date: msg.createdAt });
      lastDate = date;
    }
    groups.push({ type: "message", msg });
  });
  return groups;
};

const ChatPage = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [senderNames, setSenderNames] = useState(new Map());
  const [groupName, setGroupName] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/user/getId`, {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserId(response.data);
      } catch (error) {
        // silently fail
      }
    };
    fetchUserId();
  }, []);

  // Fetch group name for header
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/groups/${groupId}`, {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setGroupName(response.data.name);
      } catch (error) {
        // silently fail
      }
    };
    fetchGroup();
  }, [groupId]);

  const fetchSenderName = async (senderId) => {
    if (senderNames.has(senderId)) return senderNames.get(senderId);
    try {
      const response = await axios.get(`${VITE_BASE_URL}/user/${senderId}`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const name = response.data.name;
      setSenderNames((prev) => new Map(prev).set(senderId, name));
      return name;
    } catch (error) {
      return "Unknown";
    }
  };

  useEffect(() => {
    if (!userId) return;
    const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.emit("joinGroup", { groupId, userId });
    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    
    newSocket.on("userTyping", ({ userId: typingUserId, name }) => {
      if (typingUserId !== userId) {
        setTypingUsers(prev => new Set([...prev, name.trim().split(" ")[0]])); // Just show first name
      }
    });

    newSocket.on("userStoppedTyping", ({ userId: typingUserId, name }) => {
      if (typingUserId !== userId) {
         setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(name.trim().split(" ")[0]);
            return newSet;
         });
      }
    });

    return () => {
      newSocket.off("receiveMessage");
      newSocket.off("userTyping");
      newSocket.off("userStoppedTyping");
      newSocket.disconnect();
    };
  }, [groupId, userId]);

  const fetchMessages = async (offset, isLoadMore = false) => {
      try {
        if (!hasMore && isLoadMore) return;
        setLoadingMore(true);
        const res = await axios.get(`${VITE_BASE_URL}/chat/${groupId}/messages?limit=50&skip=${offset}`, {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        if (res.data.length < 50) {
           setHasMore(false);
        }
        
        if (isLoadMore) {
           setMessages(prev => [...res.data, ...prev]);
        } else {
           setMessages(res.data);
        }
      } catch (err) {} finally {
        setLoadingMore(false);
      }
  };

  useEffect(() => {
    fetchMessages(0, false);
  }, [groupId]);

  const handleScroll = (e) => {
     if (e.target.scrollTop === 0 && !loadingMore && hasMore) {
         const newSkip = skip + 50;
         setSkip(newSkip);
         fetchMessages(newSkip, true);
     }
  };

  useEffect(() => {
    if (skip === 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [messages, skip]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && userId) {
       socket.emit("typing", { groupId, userId, name: senderNames.get(userId) || "Someone" });
       
       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
       typingTimeoutRef.current = setTimeout(() => {
           socket.emit("stopTyping", { groupId, userId, name: senderNames.get(userId) || "Someone" });
       }, 2000);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !userId || !socket) return;
    socket.emit("sendMessage", { groupId, senderId: userId, content: newMessage, type: "message" });
    socket.emit("stopTyping", { groupId, userId, name: senderNames.get(userId) || "Someone" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setNewMessage("");
  };

  const items = groupByDate(messages);

  return (
    <main className="flex flex-1 relative h-full">
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col max-h-[87vh] overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-white rounded-t-3xl flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <FiMessageSquare className="text-white text-sm" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">{groupName || "Group Chat"}</h2>
            <p className="text-xs text-slate-400">Group chat</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-slate-50/50" onScroll={handleScroll}>
          {loadingMore && (
              <div className="flex justify-center py-2">
                 <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
          )}
          
          {messages.length === 0 && !loadingMore ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <FiMessageSquare className="text-blue-300 text-xl" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No messages yet</p>
                <p className="text-slate-300 text-xs mt-1">Be the first to say something!</p>
              </div>
            </div>
          ) : (
            items.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <div key={`sep-${index}`} className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                      {formatDate(item.date)}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                );
              }

              const msg = item.msg;

              if (msg.type === "system") {
                  return (
                      <div key={index} className="flex justify-center my-3">
                        <span className="text-[11px] text-slate-400 bg-slate-100/50 px-4 py-1.5 rounded-full font-medium border border-slate-100 flex items-center gap-1.5">
                          {msg.content}
                        </span>
                      </div>
                  );
              }

              const isSentByUser = msg.sender?._id === userId;
              const displayName = isSentByUser ? "You" : senderNames.get(msg.sender?._id) || "Loading...";

              if (!isSentByUser && msg.sender?._id && !senderNames.has(msg.sender._id)) {
                fetchSenderName(msg.sender._id);
              }

              const truncatedName = msg.name && msg.name.length > 15
                ? msg.name.substring(0, 15) + "..."
                : msg.name;

              return (
                <div key={index} className={`flex ${isSentByUser ? "justify-end" : "justify-start"} mb-1`}>
                  <div className={`max-w-[65%] rounded-2xl px-4 py-3 shadow-sm transition-transform hover:scale-[1.01]
                    ${isSentByUser
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                    }`}
                  >
                    <p className={`text-[11px] font-semibold mb-1.5 ${isSentByUser ? "text-blue-200" : "text-slate-400"}`}>
                      {displayName}
                    </p>

                    {msg.type === "material" || String(msg.type).startsWith("material") ? (
                      <a href={msg.content} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/20 rounded-xl p-2.5">
                        <HiDocumentText className={`text-xl ${isSentByUser ? "text-blue-100" : "text-blue-500"}`} />
                        <span className={`text-xs font-semibold ${isSentByUser ? "text-white" : "text-blue-600"}`}>
                          {truncatedName || "View File"}
                        </span>
                      </a>
                    ) : msg.type === "image" || String(msg.type).startsWith("image") ? (
                      <a href={msg.content} target="_blank" rel="noopener noreferrer">
                        <img src={msg.content} alt="Sent image"
                          className="rounded-xl max-w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition" />
                      </a>
                    ) : msg.type === "video" ? (
                      <video src={msg.content} controls className="rounded-xl max-w-full h-auto max-h-48" />
                    ) : (
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    )}

                    {msg.createdAt && (
                      <p className={`text-[10px] mt-1.5 text-right ${isSentByUser ? "text-blue-200/70" : "text-slate-400"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          
          {typingUsers.size > 0 && (
             <div className="flex justify-start mb-1 animate-fade-in pl-2">
                <div className="bg-white text-slate-500 border border-slate-100 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                   <span className="text-[10px] font-medium tracking-wide">
                      {Array.from(typingUsers).join(", ")} {typingUsers.size > 1 ? 'are' : 'is'} typing
                   </span>
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-100 bg-white rounded-b-3xl flex-shrink-0">
          <AttachmentButton sendMessage={sendMessage} socket={socket} userId={userId} groupId={groupId} />
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1 px-4 py-2.5 bg-slate-100 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-sm shadow-blue-500/20"
          >
            <FiSend className="text-sm" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
