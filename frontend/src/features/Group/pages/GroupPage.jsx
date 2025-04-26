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
       

        {/* Content Section (Scrollable Inner Pages, Fixed Parent) */}
        <div className="flex-1 mt-6 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/*code here*/}
          </div>
        </div>
      </div>
    </main>
  );
};

export default GroupPage;