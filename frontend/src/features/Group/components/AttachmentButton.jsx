import React, { useState } from "react";
import { FaPaperclip, FaImage, FaFileAlt, FaVideo } from "react-icons/fa";
import { motion } from "framer-motion";

const AttachmentButton = ({ onSelect }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative">
      <button
        className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
        onClick={() => setShowOptions(!showOptions)}
      >
        <FaPaperclip size={20} />
      </button>

      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-[160%] left-1/2 transform -translate-x-1/2 flex gap-3 bg-white p-3 rounded-xl shadow-lg border border-gray-300"
        >
          {[
            { icon: <FaImage size={18} />, label: "Image", type: "image" },
            { icon: <FaFileAlt size={18} />, label: "Material", type: "material" },
            { icon: <FaVideo size={18} />, label: "StudySession", type: "video" }
          ].map((btn, index) => (
            <div key={index} className="relative flex flex-col items-center">
              <button
                className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition w-10 h-10 flex justify-center items-center"
                onClick={() => onSelect(btn.type)}
                onMouseEnter={() => setHovered(btn.type)}
                onMouseLeave={() => setHovered(null)}
              >
                {btn.icon}
              </button>
              {hovered === btn.type && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-[-30px] bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-md"
                >
                  {btn.label}
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AttachmentButton;
