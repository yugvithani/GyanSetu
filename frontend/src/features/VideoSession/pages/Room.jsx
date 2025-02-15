import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";

const MeetingRoom = () => {
    const [peers, setPeers] = useState([]);
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);
    const userVideo = useRef();
    const socketRef = useRef();
    const peersRef = useRef([]);
    const peerInstance = useRef();

    const SERVER_URL = "http://localhost:8000";

    useEffect(() => {
        socketRef.current = io(SERVER_URL);

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                userVideo.current.srcObject = stream;

                // Initialize PeerJS
                peerInstance.current = new Peer();

                peerInstance.current.on("open", (peerId) => {
                    console.log("PeerJS ID:", peerId);
                    socketRef.current.emit("join-room", { roomId, peerId });
                });

                peerInstance.current.on("call", (call) => {
                    console.log("Receiving call from:", call.peer);
                    call.answer(stream); // Answer the call with local stream
                    handleNewPeer(call, call.peer);
                });

                socketRef.current.on("new-peer", ({ peerId }) => {
                    if (!peersRef.current.find((p) => p.peerId === peerId)) {
                        console.log("New peer joined:", peerId);
                        const call = peerInstance.current.call(peerId, stream); // Call the new peer
                        handleNewPeer(call, peerId);
                    }
                });

                socketRef.current.on("peer-left", ({ peerId }) => {
                    console.log("Peer left:", peerId);
                    peersRef.current = peersRef.current.filter((p) => p.peerId !== peerId);
                    setPeers([...peersRef.current]);
                });
            });
    }, [roomId]);

    const handleNewPeer = (call, peerId) => {
        call.on("stream", (remoteStream) => {
            console.log("Received remote stream from:", peerId);
            if (!peersRef.current.find((p) => p.peerId === peerId)) {
                peersRef.current.push({ peerId, stream: remoteStream });
                setPeers([...peersRef.current]);
            }
        });

        call.on("close", () => {
            console.log("Call with peer closed:", peerId);
            peersRef.current = peersRef.current.filter((p) => p.peerId !== peerId);
            setPeers([...peersRef.current]);
        });
    };

    const handleJoinRoom = () => {
        setJoined(true);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
            {!joined ? (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Join a Meeting Room</h1>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-full p-3 mb-4 border rounded bg-gray-700 text-white placeholder-gray-400"
                    />
                    <button
                        onClick={handleJoinRoom}
                        className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Join Room
                    </button>
                </div>
            ) : (
                <div className="w-full h-screen flex flex-col items-center">
                    <h1 className="text-2xl font-bold mt-4">Room: {roomId}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 p-4 w-full max-w-7xl">
                        <div className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
                            <video
                                ref={userVideo}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-sm px-2 py-1 rounded text-white">
                                You
                            </div>
                        </div>
                        {peers.map((peer, index) => (
                            <div
                                key={index}
                                className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden"
                            >
                                <video
                                    ref={(ref) => {
                                        if (ref) ref.srcObject = peer.stream;
                                    }}
                                    autoPlay
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-sm px-2 py-1 rounded text-white">
                                    Peer {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingRoom;
