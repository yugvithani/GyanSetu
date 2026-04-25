import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

// Sun SVG
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// Moon SVG
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeToggle = ({ compact = false }) => {
  const { isDark, toggleTheme } = useTheme();

  if (compact) {
    // Icon-only compact version for sidebar
    return (
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className="relative group cursor-pointer"
      >
        <div className="text-xl p-3 rounded-2xl transition-all duration-200 flex items-center justify-center text-theme-muted hover:bg-surface-2 hover:text-theme-primary">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "sun" : "moon"}
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium bg-surface text-theme-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-lg z-50 border border-theme">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    );
  }

  // Full pill toggle for the header
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium
        transition-all duration-300 select-none
        border shadow-sm hover:scale-105 active:scale-95
        ${isDark
          ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 shadow-slate-900/40"
          : "bg-surface border-theme text-theme-secondary hover:bg-surface-2 shadow-slate-200/60"
        }
      `}
    >
      {/* Track */}
      <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${isDark ? "bg-blue-600" : "bg-theme-border"}`}>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface shadow-sm flex items-center justify-center ${isDark ? "left-4" : "left-0.5"}`}
        >
          {isDark
            ? <MoonIcon />
            : <SunIcon />
          }
        </motion.div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "dark" : "light"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-xs font-semibold w-10 text-left"
        >
          {isDark ? "Dark" : "Light"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
