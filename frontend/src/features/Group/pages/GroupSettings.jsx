import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiClipboard, FiUser, FiX, FiEdit, FiCheck } from "react-icons/fi";

const GroupSettingsPage = () => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState({
    name: "Awesome Study Group",
    description: "This is a description of the group. Here we study together and share knowledge.",
    groupCode: "1234567890",
    isAdmin: true,
  });

  const [members, setMembers] = useState([
    { id: 1, name: "Member 1", profilePic: "" },
    { id: 2, name: "Member 2", profilePic: "" },
    { id: 3, name: "Member 3", profilePic: "https://www.w3schools.com/w3images/avatar2.png" },
  ]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupInfo.name);
  const [newGroupDescription, setNewGroupDescription] = useState(groupInfo.description);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(groupInfo.groupCode);
  };

  const handleRemoveMember = (memberId) => {
    setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId));
  };

  const handleSaveName = () => {
    setGroupInfo((prevState) => ({ ...prevState, name: newGroupName }));
    setIsEditingName(false);
  };

  const handleSaveDescription = () => {
    setGroupInfo((prevState) => ({ ...prevState, description: newGroupDescription }));
    setIsEditingDescription(false);
  };

  return (
    <main className="flex flex-1 mt-8 relative">
      {/* Main Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col max-h-[87vh]">
        {/* Group Info Section */}
        <div className="space-y-6">
          <div className="text-center">
            {/* Group Name Section with Edit Pencil Icon */}
            <div className="flex items-center justify-center">
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="text-4xl font-bold text-blue-700 border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 p-2 rounded-lg"
                  />
                  <button
                    onClick={handleSaveName}
                    className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-all duration-300"
                  >
                    <FiCheck className="text-lg" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-bold text-blue-700">{groupInfo.name}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <FiEdit className="text-xl" />
                  </button>
                </>
              )}
            </div>

            {/* Group Description Section with Edit Pencil Icon */}
            <div className="mt-2 flex items-center justify-center">
              {isEditingDescription ? (
                <>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="text-xl text-gray-600 w-full border-2 border-blue-500 p-3 focus:ring-2 focus:ring-blue-400 rounded-lg"
                    rows="4"
                  />
                  <button
                    onClick={handleSaveDescription}
                    className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-all duration-300"
                  >
                    <FiCheck className="text-lg" />
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xl text-gray-600">{groupInfo.description}</p>
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <FiEdit className="text-xl" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Group Code Section (Only visible to Admin) */}
          {groupInfo.isAdmin && (
            <div className="flex items-center justify-center space-x-2 bg-gray-100 p-4 rounded-lg shadow-md">
              <span className="font-semibold text-gray-700">Group Code:</span>
              <span className="text-xl text-blue-500">{groupInfo.groupCode}</span>
              <button
                onClick={handleCopyToClipboard}
                className="bg-blue-600 text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-700 active:scale-95 focus:outline-none"
              >
                <FiClipboard className="text-lg" />
              </button>
            </div>
          )}
        </div>

        {/* Adding Space between Group Info and Members Section */}
        <div className="my-8" />

        {/* Members Section */}
        <div className="mt-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Group Members</h3>
          <ul className="space-y-4">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300"
              >
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <img
                    src={member.profilePic || "https://i.pinimg.com/474x/51/99/8c/51998c7c545eef94a4cf5e8fc352cfa9.jpg"}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="text-lg text-gray-700">{member.name}</span>
                </div>

                {/* Remove Member Section (Visible only to Admin) */}
                {groupInfo.isAdmin && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-blue-600 hover:text-white"
                  >
                    <span className="hidden group-hover:block">Remove Member</span>
                    <FiX className="text-lg group-hover:hidden" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default GroupSettingsPage;
