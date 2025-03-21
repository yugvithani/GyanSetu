import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import ChatPage from "./ChatPage";
import MaterialPage from "./MaterialPage";

const GroupPage = () => {
  const [activeSection, setActiveSection] = useState("chat");
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const { groupId } = useParams(); // Get groupId from the URL

  return (
    <main className="flex flex-1 mt-8 relative">
      {/* Settings Button with Tooltip */}
      <div
        className="absolute top-4 right-4 flex items-center"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showTooltip && (
          <span className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg mr-3 transition-opacity duration-300">
            Group Settings
          </span>
        )}
        <button
          className="bg-gray-300 hover:bg-gray-400 p-3 rounded-full shadow-md transition-all duration-300"
          onClick={() => navigate(`/group-settings/${groupId}`)} // Navigate with groupId
        >
          <FiSettings className="text-2xl text-gray-700" />
        </button>
      </div>

      {/* Main Container (Fixed Height) */}
      <div className="flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col max-h-[87vh]">
        {/* Toggle Buttons */}
        <div className="flex space-x-6 p-2 bg-gray-200 rounded-full mx-auto w-max">
          <button
            onClick={() => setActiveSection("chat")}
            className={`px-6 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${
              activeSection === "chat"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveSection("material")}
            className={`px-6 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${
              activeSection === "material"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            Material
          </button>
        </div>

        {/* Content Section (Scrollable Inner Pages, Fixed Parent) */}
        <div className="flex-1 mt-6 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {activeSection === "chat" && <ChatPage />}
            {activeSection === "material" && <MaterialPage />}
          </div>
        </div>
      </div>
    </main>
  );
};

export default GroupPage;