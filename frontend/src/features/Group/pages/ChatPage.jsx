import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import AttachmentButton from "./../components/AttachmentButton";
import { HiDocumentText } from "react-icons/hi";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL
const SOCKET_URL = VITE_BASE_URL.replace("/api", "");

const ChatPage = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [senderNames, setSenderNames] = useState(new Map()); // Cache for sender names

  // Fetch current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/user/getId`, {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserId(response.data);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
  }, []);

  // Fetch sender's name by senderId and cache it.
  const fetchSenderName = async (senderId) => {
    if (senderNames.has(senderId)) {
      return senderNames.get(senderId);
    }
    try {
      const response = await axios.get(`${VITE_BASE_URL}/user/${senderId}`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const name = response.data.name;
      setSenderNames((prev) => new Map(prev).set(senderId, name));
      return name;
    } catch (error) {
      console.error("Error fetching sender's name:", error);
      return "Unknown";
    }
  };

  // Initialize socket connection and message handling
  useEffect(() => {
    if (!userId) return;
    const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.emit("joinGroup", { groupId, userId });
    newSocket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      newSocket.off("receiveMessage");
      newSocket.disconnect();
    };
  }, [groupId, userId]);

  // Fetch existing messages
  useEffect(() => {
    axios
      .get(`${VITE_BASE_URL}/chat/${groupId}/messages`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => console.error("Error fetching messages:", error));
  }, [groupId]);

  // Scroll to the bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send a new message
  const sendMessage = () => {
    if (!newMessage.trim() || !userId) return;
    const messageData = {
      groupId,
      senderId: userId,
      content: newMessage,
      type: "message",
    };
    try {
      socket.emit("sendMessage", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setNewMessage("");
  };

  // Scroll function
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="flex flex-1 mt-8 relative">
      

      {/* Main Container (Fixed Height) */}
      <div className="flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col max-h-[87vh]">
        {/* Toggle Buttons */}
       

        {/* Content Section (Scrollable Inner Pages, Fixed Parent) */}
        <div className="flex-1 mt-6 overflow-hidden ">
          <div className="h-full overflow-y-auto">
    <div className="flex-1 flex flex-col h-full p-6 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-4 px-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-300">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const isSentByUser = msg.sender?._id === userId;
            const displayName = isSentByUser
              ? "You"
              : senderNames.get(msg.sender?._id) || "Loading...";
  
            if (!isSentByUser && !senderNames.has(msg.sender?._id)) {
              fetchSenderName(msg.sender?._id).then((name) => {
                setSenderNames((prev) =>
                  new Map(prev).set(msg.sender?._id, name)
                );
              });
            }
  
            // Truncate file name if too long (max 12 chars + "...")
            const truncatedName =
              msg.name && msg.name.length > 12
                ? msg.name.substring(0, 12) + "..."
                : msg.name;
  
            return (
              <div
                key={index}
                className={`flex ${
                  isSentByUser ? "justify-end" : "justify-start"
                } px-2`}
              >
                <div
                  className={`p-4 break-words max-w-[65%] rounded-2xl shadow-md text-lg transition-transform transform hover:scale-105 relative group ${
                    isSentByUser
                      ? "bg-blue-600 text-white ml-8 rounded-br-none"
                      : "bg-gray-200 text-black mr-8 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-75 mb-1">
                    {displayName}
                  </p>
                  {msg.type === "material" ||
                  String(msg.type).startsWith("material") ? (
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-md cursor-pointer"
                    >
                      <HiDocumentText className="text-blue-500 text-2xl" />
                      <span className="text-blue-400 font-semibold">
                        {truncatedName}
                      </span>
                    </a>
                  ) : msg.type === "image" ||
                    String(msg.type).startsWith("image") ? (
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={msg.content}
                        alt="Sent image"
                        className="rounded-lg max-w-full h-auto mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : msg.type === "video" ? (
                    <video
                      src={msg.content}
                      controls
                      className="rounded-lg max-w-full h-auto mt-2"
                    />
                  ) : (
                    <p className="text-md">{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-center italic">No messages yet.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
  
      <div className="w-full bg-white p-4 border-t flex items-center space-x-3 shadow-md">
        <AttachmentButton
          sendMessage={sendMessage}
          socket={socket}
          userId={userId}
          groupId={groupId}
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevents any unintended newline actions
              sendMessage();
            }
          }}
          className="flex-1 p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg shadow-sm"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-md"
        >
          Send
        </button>
      </div>
    </div>
    </div>
      </div>
      </div>
    </main>
  );
};

export default ChatPage;
