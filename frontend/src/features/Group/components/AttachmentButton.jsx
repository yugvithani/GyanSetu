import React, { useState } from "react";
import { FaPaperclip, FaImage, FaFileAlt, FaVideo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { createMeeting } from "../../../services/videosdkApi"; // adjust the path as needed
import { useNavigate } from 'react-router-dom';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL
const authToken = import.meta.env.VITE_AUTH_TOKEN
const AttachmentButton = ({ sendMessage, socket, userId, groupId }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // For image and material options, use file upload as before.
  const handleFileUpload = async (type) => {
    const input = document.createElement("input");
    input.type = "file";

    if (type === "image") {
      input.accept = "image/*";
    } else {
      input.accept = ".pdf,.doc,.docx,.txt,.ppt,.pptx";
    }

    input.onchange = async (event) => {
      const file = event.target.files[0];
      // If no file is selected, simply return.
      if (!file) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const response = await axios.post(
          `${VITE_BASE_URL}/chat/${groupId}/upload`,
          formData,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const { url } = response.data;
        if (!url) {
          alert("File upload failed: No URL returned.");
          return;
        }

        // Emit the message via the socket.
        socket.emit("sendMessage", {
          groupId,
          senderId: userId,
          name: file.name,
          content: url,
          type: type, // "image" or "material"
        });
      } catch (error) {
        console.error("File upload error:", error);
        alert("File upload failed.");
      }
    };

    input.click();
  };

  // This function is called when the user confirms session creation.
  const handleCreateMeeting = async () => {
    setLoading(true);
    try {
      // Use the provided createMeeting API call.
      const sessionId = await createMeeting();
      // Redirect the user to the speaker view route. For example:
      // window.location.href = `/session/${sessionId}`;
      navigate(`/session/${sessionId}`, {
        state: {
          meetingId: sessionId,
          mode: "CONFERENCE",
          groupId: groupId,
          userId: userId,
          isHost: true,
        },
      });
    } catch (error) {
      console.error("Error creating meeting", error);
      alert("Failed to create meeting.");
    } finally {
      setLoading(false);
      setShowSessionPopup(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
        onClick={() => setShowOptions(!showOptions)}
      >
        <FaPaperclip size={20} />
      </button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[160%] left-1/2 transform -translate-x-1/2 flex gap-3 bg-surface p-3 rounded-xl shadow-lg border border-theme"
          >
            {[
              { icon: <FaImage size={18} />, label: "Image", type: "image" },
              {
                icon: <FaFileAlt size={18} />,
                label: "Material",
                type: "material",
              },
              {
                icon: <FaVideo size={18} />,
                label: "StudySession",
                type: "study",
              },
            ].map((btn, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <button
                  className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition w-10 h-10 flex justify-center items-center"
                  onClick={() =>
                    btn.type === "study"
                      ? setShowSessionPopup(true)
                      : handleFileUpload(btn.type)
                  }
                  onMouseEnter={() => setHovered(btn.type)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {btn.icon}
                </button>

                <AnimatePresence>
                  {hovered === btn.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-[-35px] bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow-md whitespace-nowrap"
                    >
                      {btn.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup for creating a meeting (Study Session) */}
      {showSessionPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-surface border border-theme rounded-lg p-6 w-80">
            <p className="text-lg mb-4 text-theme-primary">Do you want create a meeting?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-surface-2 text-theme-secondary rounded hover:bg-theme-border"
                onClick={() => setShowSessionPopup(false)}
                disabled={loading}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleCreateMeeting}
                disabled={loading}
              >
                {loading ? "Creating..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentButton;
