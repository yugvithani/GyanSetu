import React from 'react';
import { FiUser } from "react-icons/fi";

function UserProfile() {
    return (
        <div className="relative group">
            <div className="text-2xl p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600">
                <FiUser />
            </div>
            <span className="absolute right-16 top-1/2 -translate-y-1/2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all">
                Profile
            </span>
        </div>
    )
}

export default UserProfile;