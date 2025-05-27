// Controls.jsx
import React from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

function Controls(props) {
  const { 
    leave, 
    muteMic, 
    unmuteMic, 
    enableWebcam, 
    disableWebcam, 
    startHls, 
    stopHls, 
    hlsState, 
    end 
  } = useMeeting();

  // Get the local participant and update mic/webcam status.
  const { localParticipant } = useMeeting();
  const participantData = useParticipant(localParticipant?.id || "");

  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = location.state || {};

  // End class handler.
  const handleEndClass = async () => {
    const confirmEnd = window.confirm("Are you sure you want to end the live session?");
    if (!confirmEnd) return;
    
    try {
      await end(); // Ends the meeting for everyone.
      await axios.delete(`${VITE_BASE_URL}/session/${props.meetingId}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      navigate(`/group/${groupId}/session`);
    } catch (error) {
      console.error("Failed to end class:", error);
      alert("Failed to end the class. Please try again.");
    }
  };

  // Mic toggle handler.
  const handleMicToggle = () => {
    if (participantData && participantData.micOn) {
      muteMic();
    } else {
      unmuteMic();
    }
  };

  // Camera toggle handler.
  const handleCameraToggle = () => {
    if (participantData && participantData.webcamOn) {
      disableWebcam();
    } else {
      enableWebcam();
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      <button
        onClick={handleEndClass}
        className="px-6 py-3 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-300"
      >
        End Session
      </button>
      <button
        onClick={() => {
          startHls({
            layout: {
              type: "SPOTLIGHT",
              priority: "PIN",
              gridSize: "20",
            },
            theme: "DARK",
            mode: "video-and-audio",
            quality: "high",
            orientation: "landscape",
          });
        }}
        className="px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition duration-300"
      >
        Start Session
      </button>
      <button
        onClick={() => stopHls()}
        className="px-6 py-3 bg-yellow-600 text-white rounded-md shadow hover:bg-yellow-700 transition duration-300"
      >
        Pause
      </button>
      {/* Mic Toggle Button */}
      <button
        onClick={handleMicToggle}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300 transition duration-300 flex items-center justify-center"
      >
        {participantData && participantData.micOn ? (
          <MdMic size={24} />
        ) : (
          <MdMicOff size={24} />
        )}
      </button>
      {/* Webcam Toggle Button */}
      <button
        onClick={handleCameraToggle}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300 transition duration-300 flex items-center justify-center"
      >
        {participantData && participantData.webcamOn ? (
          <MdVideocam size={24} />
        ) : (
          <MdVideocamOff size={24} />
        )}
      </button>
    </div>
  );
}

export default Controls;
