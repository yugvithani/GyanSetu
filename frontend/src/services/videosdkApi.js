const authToken = import.meta.env.VITE_AUTH_TOKEN

// API call to create meeting
export const createMeeting = async () => {
  console.log("Creating meeting...");
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const { roomId } = await res.json();
  return roomId;
}; 