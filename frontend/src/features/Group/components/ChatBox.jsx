import React, { useState } from "react";

const ChatBox = ({ messages, sendMessage }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() !== "") {
      sendMessage(text);
      setText("");
    }
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-lg h-full">
      <div className="h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 border-b">
            <p className="text-sm">
              <strong>{msg.sender}</strong>: {msg.text}
            </p>
            <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
