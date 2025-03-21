import React from "react";
import { FiHome, FiSettings, FiMessageSquare, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const SideBar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: <FiHome />, label: "Home", path: "/home" },
        { icon: <FiMessageSquare />, label: "Messages", path: "/messages" },
        { icon: <FiActivity />, label: "Activity", path: "/activity" },
        { icon: <FiSettings />, label: "Settings", path: "/settings" },
    ];

    return (
        <aside className="w-16 flex flex-col items-center py-6 bg-white shadow-lg rounded-r-3xl mt-10 mb-10 relative z-20">
            {menuItems.map((item, index) => (
                <div 
                    key={index} 
                    className="relative group my-3 cursor-pointer"
                    onClick={() => navigate(item.path)}
                >
                    <div className="text-2xl p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all">
                        {item.icon}
                    </div>
                    <span className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all">
                        {item.label}
                    </span>
                </div>
            ))}
        </aside>
    );
};

export default SideBar;
