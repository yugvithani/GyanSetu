// SpeakerView.jsx
import React, { useRef, useEffect, useMemo } from "react";
import ReactPlayer from "react-player";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import Controls from "./Controls";
import ChatSection from "./ChatSection";
import { MdVideocamOff } from "react-icons/md";

function SpeakerView({ meetingId }) {
  // Get necessary properties; enableWebcam is used to turn on the camera
  const { localParticipant, hlsState, enableWebcam } = useMeeting();

  // Wait until local participant exists.
  if (!localParticipant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-white">Waiting for speaker...</p>
      </div>
    );
  }

  // Retrieve participant’s stream and status.
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
  } = useParticipant(localParticipant.id);

  // Create a video stream from the webcam track.
  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
    return null;
  }, [webcamStream, webcamOn]);

  // Manage the microphone audio element.
  const micRef = useRef(null);
  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch((error) =>
          console.error("Error playing audio", error)
        );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div className="relative min-h-screen">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-200 via-white to-blue-400">
        <div className="absolute top-12 left-10 w-80 h-80 bg-blue-300 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-blue-500 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100 rounded-full opacity-40 blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col lg:flex-row h-screen">
        {/* Left Panel: Video and Controls */}
        <div className="flex-1 m-6 p-6 bg-white/80 rounded-xl shadow-xl flex flex-col">
          <div className="relative w-full h-72 lg:h-4/5 rounded-lg overflow-hidden bg-black">
            {/* Audio element for mic */}
            <audio ref={micRef} autoPlay muted={isLocal} />
            {webcamOn && videoStream ? (
              <ReactPlayer
                playsInline
                pip={false}
                light={false}
                controls={false}
                muted
                playing
                url={videoStream}
                height="100%"
                width="100%"
                onError={(err) => console.log(err, "video error")}
              />
            ) : (
              // Full overlay when the camera is off
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 w-full h-full">
                <button
                  onClick={() => enableWebcam && enableWebcam()}
                  className="flex flex-col items-center justify-center focus:outline-none"
                >
                  <MdVideocamOff size={64} className="text-white" />
                  <span className="mt-2 text-white text-lg font-medium">
                    Turn Camera On
                  </span>
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-xl font-semibold text-gray-800">
              Speaker: {displayName}
            </p>
            {/* <p className="text-sm text-gray-600">
              Webcam: {webcamOn ? "ON" : "OFF"} | Mic: {micOn ? "ON" : "OFF"}
            </p> */}
            <p className="text-sm text-blue-600">HLS State: {hlsState}</p>
          </div>
          <div className="mt-4">
            <Controls meetingId={meetingId} />
          </div>
        </div>

        {/* Right Panel: Chat Section */}
        <div className="w-full lg:w-80 m-6 p-6 bg-white/80 rounded-xl shadow-xl flex flex-col">
          <ChatSection localParticipant={localParticipant} />
        </div>
      </div>
    </div>
  );
}

export default SpeakerView;
