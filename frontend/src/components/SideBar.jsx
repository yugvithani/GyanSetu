import React from "react";
import { FiHome, FiSettings, FiMessageSquare, FiActivity } from "react-icons/fi";

const SideBar = () => {
    return (
        <aside className="w-16 flex flex-col items-center py-6 bg-white shadow-lg rounded-r-3xl mt-10 mb-10">
            {[
                { icon: <FiHome />, label: "Home" },
                { icon: <FiMessageSquare />, label: "Messages" },
                { icon: <FiActivity />, label: "Activity" },
                { icon: <FiSettings />, label: "Settings" },
            ].map((item, index) => (
                <div key={index} className="relative group my-3">
                    <div className="text-2xl p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600">
                        {item.icon}
                    </div>
                    <span className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all">
                        {item.label}
                    </span>
                </div>
            ))}
        </aside>
    )
}

export default SideBar;