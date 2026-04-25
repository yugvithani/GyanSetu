import React, { useState } from "react";
import SideBar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import UserProfile from "./UserProfile";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-100 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/60" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <SideBar />

      {/* Main content */}
      <div className="flex-1 flex flex-col px-6 py-5 min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <SearchBar />
          </div>
          <UserProfile />
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
