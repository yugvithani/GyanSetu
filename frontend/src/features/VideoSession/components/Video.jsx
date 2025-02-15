import React, { useRef, useEffect } from "react";

const Video = ({ stream }) => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return <video ref={videoRef} autoPlay playsInline className="w-48 h-48 rounded-lg shadow-lg" />;
};

export default Video;
