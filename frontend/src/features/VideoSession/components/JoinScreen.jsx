import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import Container from "./Container";
// import { createMeeting } from "../../../services/videosdkApi";
// import axios from "axios";

const authToken = import.meta.env.VITE_AUTH_TOKEN; // auth token is for the video sdk API

function JoinScreen() {
  const location = useLocation();
  const { meetingId: initialMeetingId } = useParams(); // if passed via URL
  const navigate = useNavigate();
  const mode = location.state?.mode; // for example "CONFERENCE"
  
  // Expect groupId and userId to be passed via location.state
  // const { groupId, userId } = location.state || {};

  // Retrieve the host's info from localStorage
  const auth =
    localStorage.getItem("userInfo") &&
    JSON.parse(localStorage.getItem("userInfo"));

  // Meeting ID from URL or created later
  const [mId, setMId] = useState(initialMeetingId);

  const onMeetingLeave = () => {
    setMId(null);
    navigate("/home"); // Redirect to home when the meeting is left.
  };

  // Render the provider if we have mId; otherwise show a button to create a meeting.
  return (
    <MeetingProvider
      config={{
        meetingId: mId,
        micEnabled: true,
        webcamEnabled: true,
        name: auth.email, 
        mode: mode,
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => <Container meetingId={mId} onMeetingLeave={onMeetingLeave} />}
      </MeetingConsumer>
    </MeetingProvider>
  );
}

export default JoinScreen;
