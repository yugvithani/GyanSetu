import React, { useState } from "react";
import { FaPaperclip, FaImage, FaFileAlt, FaVideo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import BASE_URL from "../../../config";

const AttachmentButton = ({ sendMessage, socket, userId, groupId }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (type) => {
    setUploading(true); // Ensure this is called
    // console.log("Starting file upload...");

    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      type === "image" ? "image/*" : type === "video" ? "video/*" : "*/*";

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        // console.log("No file selected.");
        setUploading(false);
        return;
      }

      // console.log("File selected:", file.name);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // console.log("Uploading file to backend...");

        const response = await axios.post(
          `${BASE_URL}/chat/${groupId}/upload`,
          formData,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // console.log("Upload response:", response.data);

        const { url } = response.data;
        if (!url) {
          console.error("No URL returned from backend.");
          alert("File upload failed: No URL returned.");
          return;
        }

        // console.log("File uploaded successfully. URL:", url);

        // Emit the message with the file URL
        socket.emit("sendMessage", {
          groupId,
          senderId: userId,
          content: url,
          type: "image",
        });

        // console.log("Message emitted with file URL.");
      } catch (error) {
        console.error("File upload error:", error);
        alert("File upload failed.");
      } finally {
        setUploading(false); // Ensure this is called
        // console.log("Uploading state set to false.");
      }
    };

    input.click();
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
            className="absolute bottom-[160%] left-1/2 transform -translate-x-1/2 flex gap-3 bg-white p-3 rounded-xl shadow-lg border border-gray-300"
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
                type: "video",
              },
            ].map((btn, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <button
                  className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition w-10 h-10 flex justify-center items-center"
                  onClick={() => handleFileUpload(btn.type)}
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

      {uploading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Uploading image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentButton;
