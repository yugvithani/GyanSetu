import React, { useState } from "react";
import SideBar from "../components/SideBar";
import SearchBar from "../components/SearchBar";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-200 via-white to-blue-400">
        <div className="absolute top-12 left-10 w-80 h-80 bg-blue-300 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-blue-500 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100 rounded-full opacity-40 blur-2xl"></div>
      </div>

      <SideBar/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-4">
        {/* Top Section */}
        <header className="flex items-center justify-between">
          <SearchBar/>
          <div className="relative group">
              <div className="text-2xl p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600"  onClick={() => navigate('/profile')}>
                  <FiUser />
              </div>
              <span className="absolute right-16 top-1/2 -translate-y-1/2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all">
                  Profile
              </span>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex flex-1 mt-8 space-x-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
