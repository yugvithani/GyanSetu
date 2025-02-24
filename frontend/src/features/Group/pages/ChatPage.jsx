import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import BASE_URL from "../../../config";

const SOCKET_URL = BASE_URL.replace("/api", "");

const ChatPage = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/getId`, {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserId(response.data);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
  }, []);

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

  useEffect(() => {
    axios
      .get(`${BASE_URL}/chat/${groupId}/messages`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => console.error("Error fetching messages:", error));
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !socket) return;

    const messageData = {
      groupId,
      sender: { _id: userId, name: "You" }, // Temporary optimistic update
      content: newMessage,
    };

    setMessages((prevMessages) => [...prevMessages, messageData]); // Optimistic update
    setNewMessage("");

    try {
      await axios.post(`${BASE_URL}/chat/${groupId}/send`, messageData, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      socket.emit("sendMessage", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col h-full p-6 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-4 px-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-300">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const isSentByUser = msg.sender?._id === userId;
            return (
              <div
                key={index}
                className={`flex ${isSentByUser ? "justify-end" : "justify-start"} px-2`}
              >
                <div
                  className={`p-4 max-w-md rounded-2xl shadow-md text-lg transition-transform transform hover:scale-105 relative group ${
                    isSentByUser
                      ? "bg-blue-600 text-white ml-8 rounded-br-none"
                      : "bg-gray-200 text-black mr-8 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-75 mb-1">
                    {isSentByUser ? "You" : msg.sender?.name || "Unknown"}
                  </p>
                  <p className="text-md">{msg.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center italic">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full bg-white p-4 border-t flex items-center space-x-3 shadow-md">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
  );
};

export default ChatPage;
