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
    
    return () => newSocket.disconnect();
  }, [groupId, userId]);

  useEffect(() => {
    setMessages([]); // Clear old messages first
  
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
    if (!newMessage.trim() || !userId) return;
  
    const messageData = { 
      groupId, 
      senderId: userId, 
      content: newMessage 
    };
  
    try {
      await axios.post(
        `${BASE_URL}/chat/${groupId}/send`,
        messageData,
        {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
  
      // Manually add sender name to fix "Unknown" issue
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...messageData, sender: { name: "You" } }, // Assuming "You" for current user
      ]);
  
      socket.emit("sendMessage", messageData);
      setNewMessage("");
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
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pr-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>{msg.sender?.name || "Unknown"}:</strong> {msg.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full bg-white p-4 border-t flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
