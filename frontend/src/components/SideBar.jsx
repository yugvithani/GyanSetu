import React, { useEffect, useState } from "react";
import { FiHome, FiSettings, FiMessageSquare, FiActivity, FiFileText } from "react-icons/fi"; // 📝 FiFileText added
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SideBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showGroupMenu, setShowGroupMenu] = useState(false);
    const [groupId, setGroupId] = useState(null);

    useEffect(() => {
        const pathParts = location.pathname.split("/");
        if (pathParts.includes("group")) {
            setShowGroupMenu(true);
            setGroupId(pathParts[2]);
        } else {
            setShowGroupMenu(false);
            setGroupId(null);
        }
    }, [location.pathname]);

    const homeItem = { icon: <FiHome />, label: "Home", path: "/home" };
    const groupMenuItems = [
        { icon: <FiMessageSquare />, label: "Chat", path: `/group/${groupId}/chat` },
        { icon: <FiFileText />, label: "Material", path: `/group/${groupId}/material` },
        { icon: <FiSettings />, label: "Settings", path: `/group/${groupId}/settings` },
    ];

    return (
        <aside className="w-16 flex flex-col items-center py-6 bg-white shadow-lg rounded-r-3xl mt-10 mb-10 relative z-20 overflow-hidden">
            {/* Home Icon */}
            <div 
                className="relative group my-3 cursor-pointer"
                onClick={() => navigate(homeItem.path)}
            >
                <div className="text-2xl p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all">
                    <div className="text-2xl">
                        {homeItem.icon}
                    </div>
                </div>
                <span className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all">
                    {homeItem.label}
                </span>
            </div>

            {/* Group Related Icons */}
            <AnimatePresence>
                {showGroupMenu && groupMenuItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="relative group my-3 cursor-pointer"
                        onClick={() => navigate(item.path)}
                    >
                        <div className="text-2xl p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all">
                            <div className="text-2xl">
                                {item.icon}
                            </div>
                        </div>
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all">
                            {item.label}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </aside>
    );
};

export default SideBar;
