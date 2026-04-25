import React, { useEffect, useState } from "react";
import { FiHome, FiSettings, FiMessageSquare, FiFileText, FiVideo, FiCheckSquare, FiPenTool } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

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

    const isActive = (path) => location.pathname === path;

    const homeItem = { icon: <FiHome />, label: "Home", path: "/home" };
    const groupMenuItems = groupId ? [
        { icon: <FiMessageSquare />, label: "Chat",     path: `/group/${groupId}/chat` },
        { icon: <FiCheckSquare />,   label: "Tasks",    path: `/group/${groupId}/tasks` },
        { icon: <FiPenTool />,      label: "Board",     path: `/group/${groupId}/whiteboard` },
        { icon: <FiFileText />,     label: "Material",  path: `/group/${groupId}/material` },
        { icon: <FiVideo />,        label: "Sessions",  path: `/group/${groupId}/session` },
        { icon: <FiSettings />,     label: "Settings",  path: `/group/${groupId}/settings` },
    ] : [];

    const NavBtn = ({ icon, label, path, delay = 0, animated = false }) => {
        const active = isActive(path);
        const btn = (
            <div
                className="relative group cursor-pointer"
                onClick={() => navigate(path)}
            >
                <div className={`text-xl p-3 rounded-2xl transition-all duration-200 flex items-center justify-center
                    ${active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40"
                        : "text-theme-muted hover:bg-surface-2 hover:text-theme-primary"
                    }`}
                >
                    {icon}
                    {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full -ml-3" />
                    )}
                </div>
                <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium bg-surface text-theme-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-lg z-50 border border-theme">
                    {label}
                </span>
            </div>
        );

        if (!animated) return btn;
        return (
            <motion.div
                key={path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, delay }}
            >
                {btn}
            </motion.div>
        );
    };

    return (
        <aside className="sidebar-theme w-16 flex flex-col items-center py-8 gap-2 backdrop-blur-md shadow-xl rounded-r-3xl my-4 ml-2 border">
            {/* Brand dot */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-white text-xs font-bold">G</span>
            </div>

            {/* Divider */}
            <div className="w-6 h-px bg-theme-border/10 mb-2" />

            <NavBtn icon={homeItem.icon} label={homeItem.label} path={homeItem.path} />

            <AnimatePresence>
                {showGroupMenu && (
                    <>
                        <div className="w-6 h-px bg-theme-border/10 my-1" />
                        {groupMenuItems.map((item, index) => (
                            <NavBtn
                                key={item.path}
                                icon={item.icon}
                                label={item.label}
                                path={item.path}
                                delay={index * 0.05}
                                animated
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Spacer + compact theme toggle at the bottom */}
            <div className="flex-1" />
            <div className="w-6 h-px bg-theme-border/10 mb-1" />
            <ThemeToggle compact />
        </aside>
    );
};

export default SideBar;