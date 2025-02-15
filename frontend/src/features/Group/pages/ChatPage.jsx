import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import ChatBox from "../components/ChatBox";
import axios from "axios";
import BASE_URL from "../../../config";

const SOCKET_URL = BASE_URL.replace("/api", "");
const socket = io(SOCKET_URL);


const ChatPage = ({ groupId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/groups/${groupId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
    socket.emit("joinGroup", groupId);
    
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [groupId]);

  const sendMessage = async (text) => {
    const message = { text, groupId, sender: "User", timestamp: new Date() };
    try {
      await axios.post(`${BASE_URL}/api/groups/${groupId}/messages`, message);
      socket.emit("sendMessage", message);
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return <ChatBox messages={messages} sendMessage={sendMessage} />;
};

export default ChatPage;
