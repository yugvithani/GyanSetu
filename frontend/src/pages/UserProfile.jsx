import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../config';

function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/profile`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const { password, ...userData } = response.data; // Exclude password
        setProfileData(userData);
        setFormData(userData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mt-1 h-full w-full flex flex-1 items-stretch p-6">
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex w-full">
        <div className="w-1/4 border-r mt-44 p-6 flex flex-col items-center">
          <img
            className="w-28 h-28 rounded-full border-4 border-blue-500"
            src={profileData?.profilePicture || "https://via.placeholder.com/100"}
            alt="Profile"
          />
          <h2 className="text-xl font-semibold mt-2">{profileData?.name}</h2>
          <div className="mt-6 text-center">
            <div className="text-gray-600 text-sm">Joined Groups <span className="text-blue-600 font-bold">{profileData?.memberGroups?.length || 0}</span></div>
            <div className="text-gray-600 text-sm">Own Groups <span className="text-green-600 font-bold">{profileData?.adminGroups?.length || 0}</span></div>
          </div>
        </div>

        <div className="w-3/4 p-6">
          <h2 className="text-3xl font-semibold">Profile</h2>
          
          {/* Form */}
          <form className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <input className="border p-3 rounded" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full Name" />
              <input className="border p-3 rounded" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email Address" />
              <input className="border p-3 rounded" name="bio" value={formData.bio || ''} onChange={handleChange} placeholder="Bio" />
            </div>
            <div className="flex space-x-4 mt-6">
              <button className="bg-green-500 text-white px-6 py-3 rounded">Save Profile</button>
              <button className="border px-6 py-3 rounded">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
