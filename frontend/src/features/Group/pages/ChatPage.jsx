import React from "react";

const ChatPage = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Chat</h2>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Chat Content (Scrollable) */}
        <p>This is the chat section.</p>
        <p>More chat content...</p>
        <p>Even more chat messages...</p>
      </div>
    </div>
  );
};

export default ChatPage;
