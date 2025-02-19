import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiClipboard, FiUser, FiX, FiEdit, FiCheck } from "react-icons/fi";
import axios from "axios";
import BASE_URL from "../../../config";

const GroupSettingsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState({
    name: "",
    description: "",
    groupCode: "",
    admin: "",
    members: [],
  });
  const [members, setMembers] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [currentUser, setCurrentUser] = useState(null); // Store current user

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/groups/${groupId}`, {
          headers: { authorization: `Bearer ${token}` },
        });

        // console.log('Group response data:', response.data); // Check the raw data
        setGroupInfo(response.data);
        setNewGroupName(response.data.name);
        setNewGroupDescription(response.data.description);
        // setMembers(response.data.members);
        // Now log groupInfo inside a useEffect to see the updated state
        // console.log('Updated groupInfo:', groupInfo);  // groupInfo will be updated after the next render

        const userResponse = await axios.get(`${BASE_URL}/user/getId`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setCurrentUser(userResponse.data);
        console.log(response.data.members);
        const memberDetailsPromises = response.data.members.map(
          async (memberId) => {
            const memberResponse = await axios.get(
              `${BASE_URL}/user/${memberId}`,
              {
                headers: { authorization: `Bearer ${token}` },
              }
            );
            return memberResponse.data;
          }
        );

        const membersData = await Promise.all(memberDetailsPromises);
        setMembers(membersData);
        console.log(membersData);
      } catch (error) {
        console.error("Error fetching group details", error);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(groupInfo.groupCode);
  };

  const handleRemoveMember = async (memberId) => {
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/groups/${groupId}/member`, {
            headers: { authorization: `Bearer ${token}` },
            data: { userId: memberId } // Sending userId in the request body
        });
        setMembers((prevMembers) =>
            prevMembers.filter((member) => member._id !== memberId)
        );
    } catch (error) {
        console.error("Error removing member", error);
    }
};

  const handleSaveName = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/groups/${groupId}`,
        { name: newGroupName },
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setGroupInfo((prevState) => ({ ...prevState, name: newGroupName }));
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating group name", error);
    }
  };

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/groups/${groupId}`,
        { description: newGroupDescription },
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setGroupInfo((prevState) => ({
        ...prevState,
        description: newGroupDescription,
      }));
      setIsEditingDescription(false);
    } catch (error) {
      console.error("Error updating group description", error);
    }
  };

  return (
    <main className="flex flex-1 mt-8 relative">
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-10 flex flex-col max-h-[87vh]">
        <div className="space-y-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            {isEditingName ? (
              <>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="text-4xl font-bold text-blue-800 bg-gray-100 p-3 rounded-lg focus:ring-4 focus:ring-gray-300 shadow-md"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 relative group"
                >
                  <FiCheck className="text-xl" />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 text-sm text-white bg-blue-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    Save Name
                  </span>
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-blue-800">{groupInfo.name}</h2>
                {currentUser && currentUser === groupInfo.admin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-600 hover:text-gray-500 relative group"
                  >
                    <FiEdit className="text-2xl" />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 text-sm text-white bg-blue-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit Name
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
  
          <div className="mt-4 flex flex-col items-center space-y-2 bg-gray-50 p-5 rounded-lg shadow-md">
            {isEditingDescription ? (
              <>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="text-xl text-blue-800 bg-white p-3 rounded-lg w-full focus:ring-4 focus:ring-gray-300 shadow-md"
                  rows="4"
                />
                <button
                  onClick={handleSaveDescription}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 relative group"
                >
                  <FiCheck className="text-xl" />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 text-sm text-white bg-blue-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    Save Description
                  </span>
                </button>
              </>
            ) : (
              <>
                <p className="text-lg text-blue-800 italic">{groupInfo.description}</p>
                {currentUser && currentUser === groupInfo.admin && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="text-gray-600 hover:text-gray-500 relative group"
                  >
                    <FiEdit className="text-2xl" />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 text-sm text-white bg-blue-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit Description
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
  
        {currentUser && currentUser === groupInfo.admin && (
          <div className="flex items-center justify-center bg-gray-50 p-5 rounded-lg shadow-md mt-6">
            <span className="font-semibold text-blue-800">Group Code:</span>
            <span className="text-xl text-gray-700 mx-3 font-mono bg-gray-200 px-3 py-1 rounded-md shadow-md">{groupInfo.groupCode}</span>
            <button
              onClick={handleCopyToClipboard}
              className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 relative group"
            >
              <FiClipboard className="text-xl" />
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 text-sm text-white bg-blue-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                Copy Group Code
              </span>
            </button>
          </div>
        )}
  
        <div className="mt-6">
          <h3 className="text-2xl font-semibold text-blue-800 mb-4 underline decoration-gray-500">Group Members</h3>
          <ul className="space-y-4">
            {members.map((member) => (
              <li
                key={member._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      member.profilePic ||
                      "https://i.pinimg.com/474x/51/99/8c/51998c7c545eef94a4cf5e8fc352cfa9.jpg"
                    }
                    className="w-14 h-14 rounded-full border-2 shadow-md"
                  />
                  <span className="text-lg text-blue-900 font-medium">{member.name}</span>
                </div>
  
                {member._id === groupInfo.admin ? (
                  <span className="text-sm text-gray-600 font-semibold">Admin</span>
                ) : (
                  currentUser &&
                  currentUser === groupInfo.admin && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 relative group"
                    >
                      <FiX className="text-lg" />
                      <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 text-sm text-white bg-blue-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        Remove Member
                      </span>
                    </button>
                  )
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
