import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiEdit2, FiLogOut, FiCamera, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useActivity } from "../contexts/ActivityContext";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
const DEFAULT_PIC = 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=1a63f5&textColor=ffffff';

const UserProfile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logActivity } = useActivity();

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${VITE_BASE_URL}/user/profile`, {
        headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUserInfo(response.data);
      setEditData({ name: response.data.name, bio: response.data.bio || '', profilePicture: response.data.profilePicture });
    } catch (error) {
      // silently fail
    }
  };

  useEffect(() => { fetchUserProfile(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = () => {
    setEditData({ name: userInfo.name, bio: userInfo.bio || '', profilePicture: userInfo.profilePicture });
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setEditData((prev) => ({ ...prev, profilePicture: URL.createObjectURL(file) }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('bio', editData.bio);
      if (selectedFile) formData.append('profilePicture', selectedFile);

      await axios.put(`${VITE_BASE_URL}/user/profile`, formData, {
        headers: { authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShowEditModal(false);
      setSelectedFile(null);
      fetchUserProfile();
      logActivity('Profile', 'Edited user profile');
    } catch (error) {
      console.error('Error updating profile:', error.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login', { replace: true });
  };

  const avatarUrl = userInfo?.profilePicture
    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userInfo?.name || 'User')}&backgroundColor=1a63f5&textColor=ffffff`;

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      {/* Trigger button — shows avatar */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform"
      >
        {userInfo ? (
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-blue-600 flex items-center justify-center">
            <FiUser className="text-white text-sm" />
          </div>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-slide-up">
          {userInfo ? (
            <>
              {/* Profile header */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
                <div className="flex items-center gap-3">
                  <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-2xl object-cover border-2 border-white/30 shadow-lg" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{userInfo.name}</p>
                    <p className="text-blue-200 text-xs truncate">{userInfo.email}</p>
                    {userInfo.bio && <p className="text-white/70 text-xs truncate mt-0.5 italic">{userInfo.bio}</p>}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-700 text-sm hover:bg-slate-50 transition"
                >
                  <FiEdit2 className="text-slate-400 text-base" /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-500 text-sm hover:bg-red-50 transition"
                >
                  <FiLogOut className="text-red-400 text-base" /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="p-5 text-slate-400 text-sm text-center">Loading profile...</div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slide-up">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                <FiX className="text-slate-500 text-sm" />
              </button>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
              {/* Avatar picker */}
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={editData.profilePicture || avatarUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-100 shadow"
                  />
                  <label htmlFor="profilePicInput" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <FiCamera className="text-white text-xl" />
                  </label>
                  <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" id="profilePicInput" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bio <span className="text-slate-300">(optional)</span></label>
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell people about yourself..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
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
