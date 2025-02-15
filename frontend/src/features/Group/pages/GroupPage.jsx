import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ChatPage from "./ChatPage";
import MaterialPage from "./MaterialPage";

const GroupPage = () => {
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Group Header */}
      <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Group {groupId}</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "chat"
                ? "border-b-4 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "material"
                ? "border-b-4 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("material")}
          >
            Materials
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 bg-white shadow-md rounded-md mx-6 mt-4">
        {activeTab === "chat" ? <ChatPage groupId={groupId} /> : <MaterialPage groupId={groupId} />}
      </div>
    </div>
  );
};

export default GroupPage;
