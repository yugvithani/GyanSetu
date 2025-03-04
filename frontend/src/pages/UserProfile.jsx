import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import { FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Camera } from "lucide-react";

const UserProfile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const dropdownRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const defaultProfilePic = 'https://th.bing.com/th/id/OIP.seJIU6-wCa7OtTYHR85z3QHaHa?w=165&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7';// change

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/profile`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      }); // Fetch user info
      setUserInfo(response.data);

      setEditData({
        name: response.data.name,
        bio: response.data.bio || '',
        profilePicture: response.data.profilePicture,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Toggle dropdown
  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle edit modal open
  const handleEditClick = () => {
    setEditData({
      name: userInfo.name,
      bio: userInfo.bio || '',
      profilePicture: userInfo.profilePicture,
    });
    setShowEditModal(true);
  };

  // Handle form input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle profile picture change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Set the selected file to the state
      setEditData((prevData) => ({
        ...prevData,
        profilePicture: URL.createObjectURL(file), // For preview before saving
      }));
    }
  };

  // Submit the edit form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('bio', editData.bio);

      if (selectedFile) {
        formData.append('profilePicture', selectedFile); // Send the selected file to the backend if change
      }
      console.log(selectedFile);
      const response = await axios.put(`${BASE_URL}/user/profile`, formData, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`, // axios take content type auto
        }
      });

      console.log('Update response:', response.data);
      setShowEditModal(false);
      fetchUserProfile(); // Refresh user profile after submission
    } catch (error) {
      console.error('Response data:', error.response?.data);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>

      <div className="relative group">
        <div
          className="text-2xl p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600"
          onClick={handleProfileClick} // On click, fetch and show profile
        >
          <FiUser />
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg">
          {userInfo ? (
            <div>
              <div className="px-4 py-2 text-gray-700">
                <p className="font-semibold">My Profile</p>
                <img
                  src={userInfo.profilePicture || defaultProfilePic}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mx-auto my-2"
                />
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Bio:</strong> {userInfo.bio || 'No bio available'}</p>
              </div>
              <div className="border-t border-gray-200"></div>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={handleEditClick}
              >
                Edit Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="p-4 text-gray-500">Loading profile...</div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96 text-white">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="flex flex-col items-center mb-4">

                <div className="relative w-24 h-24">
                  <label htmlFor="profilePicInput" className="cursor-pointer">
                    <img
                      src={editData.profilePicture || defaultProfilePic}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />

                    {/* Camera icon positioned at bottom-right */}
                    <div className="absolute bottom-0 right-0 text-gray-300 p-1 rounded-full ">
                      <Camera className="w-5 h-5" />
                    </div>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                    id="profilePicInput"
                  />
                </div>

              </div>

              <div className="mb-4">
                <label className="block mb-2">Name</label>
                <input
                  type="string"
                  name="name"
                  value={editData.name}
                  onChange={handleProfileChange}
                  className="text-black block w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleProfileChange}
                  className="text-black block w-full p-2 border border-gray-300 rounded"
                  rows="4"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)} // Close modal without saving
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
