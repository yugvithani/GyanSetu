import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { io } from "socket.io-client";
import { FiTrash2, FiEdit2, FiCopy, FiDownload } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
const SOCKET_URL = VITE_BASE_URL.replace("/api", "");

const WhiteboardPage = () => {
  const { groupId } = useParams();
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [color, setColor] = useState("#1a63f5"); // default brand blue
  const [eraserMode, setEraserMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(4);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${VITE_BASE_URL}/user/getId`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setUserId(response.data);
      } catch (err) {}
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.emit("joinGroup", { groupId, userId });

    newSocket.on("receivePath", (path) => {
      if (canvasRef.current) {
        // react-sketch-canvas lets you programmatically load paths
        canvasRef.current.loadPaths(path);
      }
    });

    newSocket.on("canvasCleared", () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    });

    return () => {
      newSocket.off("receivePath");
      newSocket.off("canvasCleared");
      newSocket.disconnect();
    };
  }, [groupId, userId]);

  const handleStroke = (newPath) => {
    if (!socket || !userId) return;
    // Broadcast path array to group
    socket.emit("drawPath", { groupId, path: [newPath] });
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      socket?.emit("clearCanvas", { groupId });
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      canvasRef.current.exportImage("png").then((data) => {
        const link = document.createElement("a");
        link.href = data;
        link.download = `board-${groupId}.png`;
        link.click();
      });
    }
  };

  return (
    <main className="flex flex-1 relative h-[87vh]">
      <ToastContainer position="top-right" theme="light" />
      <div className="flex-1 bg-surface rounded-3xl shadow-sm border border-theme flex flex-col overflow-hidden relative">
        
        {/* Toolbar Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface shadow-xl border border-theme rounded-full px-4 py-2 flex items-center gap-4">
          
          {/* Tools */}
          <div className="flex gap-2">
            <button
              onClick={() => { setEraserMode(false); canvasRef.current?.eraseMode(false); }}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition ${!eraserMode ? 'bg-blue-100 text-blue-600' : 'text-theme-muted hover:bg-surface-2'}`}
              title="Pen"
            >
              <FiEdit2 className="text-sm" />
            </button>
            <button
              onClick={() => { setEraserMode(true); canvasRef.current?.eraseMode(true); }}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition ${eraserMode ? 'bg-blue-100 text-blue-600' : 'text-theme-muted hover:bg-surface-2'}`}
              title="Eraser"
            >
              <FiCopy className="text-sm" /> {/* using copy icon as proxy for eraser for now */}
            </button>
          </div>

          <div className="w-px h-6 bg-theme-border" />
          
          {/* Colors */}
          <div className="flex gap-2">
            {["#1a63f5", "#e11d48", "#16a34a", "#0f172a"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && !eraserMode ? 'scale-125 border-slate-300' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-theme-border" />
          
          <div className="flex items-center gap-2">
             <input type="range" min="1" max="20" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} className="w-20 accent-blue-600" />
          </div>

          <div className="w-px h-6 bg-theme-border" />

          <button onClick={handleExport} className="w-9 h-9 flex items-center justify-center rounded-full text-theme-muted hover:bg-surface-2 transition" title="Export Image">
            <FiDownload className="text-sm" />
          </button>
          <button onClick={handleClear} className="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition" title="Clear Board">
            <FiTrash2 className="text-sm" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 w-full h-full bg-surface-2 relative cursor-crosshair">
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={strokeWidth}
            strokeColor={color}
            canvasColor="transparent"
            onStroke={handleStroke}
            className="w-full h-full border-none"
            style={{ border: "none" }}
          />
        </div>

      </div>
    </main>
  );
};

export default WhiteboardPage;
