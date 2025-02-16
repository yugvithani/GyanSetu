import React, { useState } from "react";
import ChatPage from "./ChatPage";
import MaterialPage from "./MaterialPage";

const GroupPage = () => {
  const [activeSection, setActiveSection] = useState("chat");

  return (
    <main className="flex flex-1 mt-8 space-x-6">
      {/* Main Container */}
      <div className="flex-1 h-[90vh] bg-gray-50 rounded-3xl shadow-2xl p-6 border border-gray-300 flex flex-col">
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

        {/* Content Section (Fixed Height with Scroll) */}
        <div className="flex-1 mt-6 overflow-y-auto">
          {activeSection === "chat" && <ChatPage />}
          {activeSection === "material" && <MaterialPage />}
        </div>
      </div>
    </main>
  );
};

export default GroupPage;
