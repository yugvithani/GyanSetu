// SessionPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { HiVideoCamera } from "react-icons/hi";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const SessionPage = () => {
  const { groupId } = useParams(); // Get groupId from URL
  const [sessions, setSessions] = useState([]);

  // Retrieve current user's email from localStorage. (Assuming userInfo is stored as JSON with an email field)
  const currentUserEmail =
    localStorage.getItem("userInfo") &&
    JSON.parse(localStorage.getItem("userInfo")).email;

  useEffect(() => {
    if (!groupId) return;

    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/session/${groupId}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSessions(response.data);
      } catch (error) {
        // silently handle fetch error
      }
    };

    fetchSessions();
  }, [groupId]);

  // Filter sessions: Keep only live sessions and those where the session host's email is different from the current user's email.
  const filteredSessions = sessions
    .filter(
      (session) =>
        session.isLive &&
        session.host?.email !== currentUserEmail
    )
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  return (
    <main className="flex flex-1 mt-8 relative">
      

      {/* Main Container (Fixed Height) */}
      <div className="flex-1 bg-surface rounded-2xl shadow-md p-6 flex flex-col max-h-[87vh]">
        {/* Toggle Buttons */}
       

        {/* Content Section (Scrollable Inner Pages, Fixed Parent) */}
        <div className="flex-1 mt-6 overflow-hidden ">
          <div className="h-full overflow-y-auto">
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div
              key={session._id}
              className="p-4 bg-surface rounded-lg shadow-lg flex flex-col justify-between h-44 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <HiVideoCamera className="text-blue-600 text-3xl" />
                <h2 className="text-lg font-semibold text-gray-800 truncate w-48">
                  Session by {session.host?.name || "Unknown"}
                </h2>
              </div>
              <p className="text-xs text-gray-400">
                {session.startTime
                  ? new Date(session.startTime).toLocaleString()
                  : "Unknown Time"}
              </p>
              <div className="flex justify-end">
                <Link
                  to={`/session/${session.meetingId}`}
                  state={{
                    meetingId: session.meetingId,
                    mode: "VIEWER",
                    groupId: session.group,
                    userId: session.host._id,
                    isHost: false,
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Join Session
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">
            No active sessions.
          </p>
        )}
      </div>
    </div>
    </div>
      </div>
      </div>
    </main>
  );
};

export default SessionPage;
