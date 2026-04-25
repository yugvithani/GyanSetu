import React from "react";
import SideBar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import UserProfile from "./UserProfile";
import ThemeToggle from "../components/ThemeToggle";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-page relative overflow-hidden transition-colors duration-300">
      {/* Gradient orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <SideBar />

      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 py-5 min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <UserProfile />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
