// ViewerView.jsx
import React, { useRef, useEffect } from "react";
import Hls from "hls.js";
import { useMeeting } from "@videosdk.live/react-sdk";
import ChatSection from "./ChatSection";

function ViewerView() {
  const playerRef = useRef(null);
  const { hlsUrls, hlsState, leave } = useMeeting();

  useEffect(() => {
    if (hlsUrls.playbackHlsUrl && hlsState === "HLS_PLAYABLE") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxLoadingDelay: 1,
          defaultAudioCodec: "mp4a.40.2",
          maxBufferLength: 0,
          maxMaxBufferLength: 1,
          startLevel: 0,
          startPosition: -1,
          maxBufferHole: 0.001,
          highBufferWatchdogPeriod: 0,
          nudgeOffset: 0.05,
          nudgeMaxRetry: 1,
          maxFragLookUpTolerance: 0.1,
          liveSyncDurationCount: 1,
          abrEwmaFastLive: 1,
          abrEwmaSlowLive: 3,
          abrEwmaFastVoD: 1,
          abrEwmaSlowVoD: 3,
          maxStarvationDelay: 1,
        });
        const player = document.querySelector("#hlsPlayer");
        hls.loadSource(hlsUrls.playbackHlsUrl);
        hls.attachMedia(player);
      } else if (playerRef.current?.play) {
        playerRef.current.src = hlsUrls.playbackHlsUrl;
        playerRef.current.play();
      }
    }
  }, [hlsUrls, hlsState]);

  return (
    <div className="relative min-h-screen">
      {/* Gradient Background with Decorative Elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-200 via-white to-blue-400">
        <div className="absolute top-12 left-10 w-80 h-80 bg-blue-300 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-blue-500 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100 rounded-full opacity-40 blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col lg:flex-row h-screen">
        {/* Left Panel - Video and Exit Button */}
        <div className="flex-1 m-6 p-6 bg-white/80 rounded-xl shadow-xl flex flex-col">
          {hlsState !== "HLS_PLAYABLE" ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg text-gray-700">
                HLS has not started yet or is stopped.
              </p>
            </div>
          ) : (
            hlsState === "HLS_PLAYABLE" && (
              <div className="relative flex-1 w-full rounded-lg overflow-hidden">
                <video
                  ref={playerRef}
                  id="hlsPlayer"
                  autoPlay
                  controls
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onError={(err) => console.log(err, "hls video error")}
                ></video>
              </div>
            )
          )}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => leave()}
              className="px-8 py-3 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-300"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Right Panel - Chat Section */}
        <div className="w-full lg:w-80 m-6 p-6 bg-white/80 rounded-xl shadow-xl flex flex-col">
          <ChatSection />
        </div>
      </div>
    </div>
  );
}

export default ViewerView;
