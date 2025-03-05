import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import BASE_URL from "../../../config";
import AttachmentButton from "./../components/AttachmentButton";

const SOCKET_URL = BASE_URL.replace("/api", "");

const ChatPage = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [senderNames, setSenderNames] = useState(new Map()); // Cache for sender names

  // Fetch the current user's ID
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

  // Fetch the sender's name by senderId
  const fetchSenderName = async (senderId) => {
    if (senderNames.has(senderId)) {
      return senderNames.get(senderId); // Return cached name if available
    }

    try {
      const response = await axios.get(`${BASE_URL}/user/${senderId}`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const name = response.data.name;
      setSenderNames((prev) => new Map(prev).set(senderId, name)); // Cache the name
      return name;
    } catch (error) {
      console.error("Error fetching sender's name:", error);
      return "Unknown"; // Fallback if the name cannot be fetched
    }
  };

  // Initialize socket connection and handle incoming messages
  useEffect(() => {
    if (!userId) return;

    const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.emit("joinGroup", { groupId, userId });

    newSocket.on("receiveMessage", (message) => {
      // console.log("Received new message via socket:", message); // Add this log
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.off("receiveMessage");
      newSocket.disconnect();
    };
  }, [groupId, userId]);
  // Fetch existing messages for the group
  useEffect(() => {
    axios
      .get(`${BASE_URL}/chat/${groupId}/messages`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setMessages(response.data); // Set messages without sender names initially
        // console.log(response.data);
      })
      .catch((error) => console.error("Error fetching messages:", error));
  }, [groupId]);

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send a new message
  const sendMessage = async () => {
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

  // Scroll to the bottom of the chat
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
            // console.log("Rendering message:", msg); // Add this log
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

            return (
              <div
                key={index}
                className={`flex ${
                  isSentByUser ? "justify-end" : "justify-start"
                } px-2`}
              >
                <div
                  className={`p-4 max-w-md rounded-2xl shadow-md text-lg transition-transform transform hover:scale-105 relative group ${
                    isSentByUser
                      ? "bg-blue-600 text-white ml-8 rounded-br-none"
                      : "bg-gray-200 text-black mr-8 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-75 mb-1">
                    {displayName}
                  </p>
                  {msg.type[0] === "image" || msg.type == "image" ? (
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
