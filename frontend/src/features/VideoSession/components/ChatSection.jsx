// ChatSection.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePubSub } from "@videosdk.live/react-sdk";

function ChatSection({ localParticipant }) {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const chatContainerRef = useRef(null);

  const pubsubData = usePubSub("CHAT", {
    onMessageReceived: (newMessage) => {
      handleReceiveMessage(newMessage);
    },
    onOldMessagesReceived: (oldMessages) => {
      setChatMessages(Array.isArray(oldMessages) ? oldMessages : []);
    },
  });

  const pubsubDataRef = useRef(pubsubData);
  useEffect(() => {
    pubsubDataRef.current = pubsubData;
  }, [pubsubData]);

  const handleReceiveMessage = useCallback((newMessage) => {
    setChatMessages((prev) => [...prev, newMessage]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      pubsubDataRef.current.publish(message, { persist: true });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col space-y-4 my-4 flex-grow overflow-hidden">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-start space-x-2 justify-start">
          <div className="bg-violet-200 text-blue-800 p-3 rounded-lg max-w-xs">
            <p className="font-semibold">:)</p>
            <p className="text-sm">
              Hey! We're here to help you. Ask questions 🙂, no need to hesitate.
            </p>
          </div>
        </div>
        {chatMessages.map((msg, index) => (
          <div key={index} className="flex items-start space-x-2 justify-start">
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg max-w-xs">
              <p className="font-semibold">{msg.senderName}:</p>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-4 mt-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none m-1 focus:ring-2 focus:ring-blue-500"
        />
        <button
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatSection;
