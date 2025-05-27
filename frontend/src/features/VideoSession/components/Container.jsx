// Container.jsx
import React, { useEffect, useRef } from "react";
import { useMeeting, Constants } from "@videosdk.live/react-sdk";
import { useLocation } from "react-router-dom";
import SpeakerView from "./SpeakerView";
import ViewerView from "./ViewerView";
import axios from "axios";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

function Container(props) {
  const { join } = useMeeting();
  const location = useLocation();
  const { groupId, userId } = location.state || {};

  // Initialize the meeting context
  const mMeeting = useMeeting({
    onMeetingLeft: () => props.onMeetingLeave(),
    onError: (error) => alert(error.message),
    onHlsStateChanged: (data) => console.log("HLS State Changed", data),
  });

  // Use a ref to ensure join and session creation happen only once.
  const sessionCreatedRef = useRef(false);

  const joinMeeting = async () => {
    // Call join() only once
    await join();

    if (!sessionCreatedRef.current) {
      const sessionPayload = {
        meetingId: props.meetingId, // VideoSDK meeting ID.
        isLive: true,
        host: userId,             // Host's user ID.
        group: groupId,           // Group ID.
        startTime: new Date(),    // Current time.
      };
      console.log("Session payload:", sessionPayload);
      // Call the API endpoint which is idempotent.
      axios
        .post(`${VITE_BASE_URL}/session/create`, sessionPayload, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          console.log("Session stored:", res.data);
        })
        .catch((error) => {
          console.error("Error storing session:", error);
          alert("Session creation failed on server side.");
        });
      
      // Mark session as created.
      sessionCreatedRef.current = true;
    }
  };

  useEffect(() => {
    joinMeeting();
  }, []); // Ensure one call only

  // Until localParticipant is available, show loading.
  if (!mMeeting.localParticipant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-white">Joining meeting...</p>
      </div>
    );
  }

  // Render SpeakerView or ViewerView based on mode.
  if (mMeeting.localParticipant.mode === Constants.modes.CONFERENCE) {
    return (
      <div className="relative min-h-screen">
        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-200 via-white to-blue-400">
          <div className="absolute top-12 left-10 w-80 h-80 bg-blue-300 rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-blue-500 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100 rounded-full opacity-40 blur-2xl"></div>
        </div>
        <SpeakerView meetingId={props.meetingId} />
      </div>
    );
  } else if (mMeeting.localParticipant.mode === Constants.modes.VIEWER) {
    return <ViewerView />;
  } else {
    console.error("Unknown mode:", mMeeting.localParticipant.mode);
    return null;
  }
}

export default Container;
