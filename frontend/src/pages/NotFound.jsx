import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiAlertCircle } from "react-icons/fi";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/60 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center px-6 animate-fade-in">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface shadow-xl border border-theme mb-8">
          <FiAlertCircle className="text-5xl text-blue-400" />
        </div>

        {/* Text */}
        <h1 className="text-8xl font-black text-slate-200 leading-none select-none">404</h1>
        <h2 className="text-2xl font-bold text-theme-primary mt-3">Page not found</h2>
        <p className="text-theme-muted mt-2 max-w-sm mx-auto text-sm leading-relaxed">
          Looks like this page doesn&apos;t exist. It may have been moved, deleted, or you followed a broken link.
        </p>

        {/* Action */}
        <button
          onClick={() => navigate("/home")}
          className="mt-8 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <FiHome className="text-base" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
