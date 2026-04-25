import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaSignInAlt, FaLock, FaGlobe } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useActivity } from "../contexts/ActivityContext";
import { useGroups } from "../contexts/GroupContext";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Avatar initials helper
const GroupAvatar = ({ name }) => {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "G";
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-600",
  ];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
};

// Skeleton loader card
const SkeletonCard = () => (
  <li className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-slate-200 rounded w-1/2" />
      <div className="h-2.5 bg-slate-100 rounded w-3/4" />
    </div>
  </li>
);

// Modal wrapper
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-slide-up">
      <h2 className="text-lg font-bold text-slate-800 mb-5">{title}</h2>
      {children}
      <button
        onClick={onClose}
        className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition"
      >
        Cancel
      </button>
    </div>
  </div>
);

const GroupList = () => {
  const [showForm, setShowForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [groupData, setGroupData] = useState({ name: "", description: "", isPrivate: true });
  const [groupCode, setGroupCode] = useState("");
  const { groups, setGroups } = useGroups();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logActivity } = useActivity();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${VITE_BASE_URL}/groups/all`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setGroups(response.data);
      } catch (error) {
        toast.error(error.response?.data?.error || "Error fetching groups");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupData({ ...groupData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating group...");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${VITE_BASE_URL}/groups/create`, groupData, {
        headers: { authorization: `Bearer ${token}` },
      });
      setGroups([...groups, response.data]);
      setShowForm(false);
      setGroupData({ name: "", description: "", isPrivate: true });
      toast.update(toastId, { render: "Group created! 🎉", type: "success", isLoading: false, autoClose: 2500, hideProgressBar: true });
      logActivity("Group", `created group ${groupData.name}`);
    } catch (error) {
      toast.update(toastId, { render: error.response?.data?.error || "Error creating group", type: "error", isLoading: false, autoClose: 3000, hideProgressBar: true });
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Joining group...");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${VITE_BASE_URL}/groups/join`, { groupCode }, {
        headers: { authorization: `Bearer ${token}` },
      });
      setGroups([...groups, response.data]);
      setShowJoinForm(false);
      setGroupCode("");
      toast.update(toastId, { render: "Joined group! 🎉", type: "success", isLoading: false, autoClose: 2500, hideProgressBar: true });
      logActivity("Group", `Joined group ${response.data.name}`);
    } catch (error) {
      toast.update(toastId, { render: error.response?.data?.error || "Error joining group", type: "error", isLoading: false, autoClose: 3000, hideProgressBar: true });
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition";
  const labelCls = "block text-sm font-medium text-slate-600 mb-1.5";

  return (
    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
      <ToastContainer position="top-center" theme="light" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your Groups</h2>
          <p className="text-xs text-slate-400 mt-0.5">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            title="Create Group"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm shadow-blue-500/20 active:scale-95"
          >
            <FaPlus className="text-xs" /> New
          </button>
          <button
            onClick={() => setShowJoinForm(true)}
            title="Join Group"
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition active:scale-95"
          >
            <FaSignInAlt className="text-xs" /> Join
          </button>
        </div>
      </div>

      {/* Group List */}
      {loading ? (
        <ul className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </ul>
      ) : groups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <FiUsers className="text-blue-400 text-2xl" />
          </div>
          <p className="text-slate-600 font-semibold">No groups yet</p>
          <p className="text-slate-400 text-sm mt-1">Create a group or join one with a code</p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto flex-1 max-h-[580px] pr-1">
          {groups.map((group) => (
            <li
              key={group._id}
              onClick={() => navigate(`/group/${group._id}/chat`)}
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all duration-150 group"
            >
              <GroupAvatar name={group.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-700 transition">{group.name}</h3>
                  <span className="flex-shrink-0">
                    {group.isPrivate
                      ? <FaLock className="text-slate-300 text-[10px]" />
                      : <FaGlobe className="text-slate-300 text-[10px]" />
                    }
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{group.description || "No description"}</p>
              </div>
              <div className="text-slate-300 group-hover:text-blue-400 transition text-lg">›</div>
            </li>
          ))}
        </ul>
      )}

      {/* Create Group Modal */}
      {showForm && (
        <Modal title="Create a new group" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Group Name</label>
              <input type="text" name="name" value={groupData.name} onChange={handleChange} placeholder="e.g. DSA Study Circle" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Description <span className="text-slate-300">(optional)</span></label>
              <textarea name="description" value={groupData.description} onChange={handleChange} placeholder="What's this group about?" className={inputCls} rows={3} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" name="isPrivate" checked={groupData.isPrivate} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm text-slate-700 font-medium">Private Group</span>
            </label>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
              Create Group
            </button>
          </form>
        </Modal>
      )}

      {/* Join Group Modal */}
      {showJoinForm && (
        <Modal title="Join a group" onClose={() => setShowJoinForm(false)}>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Group Code</label>
              <input type="text" value={groupCode} onChange={(e) => setGroupCode(e.target.value)} placeholder="Paste the invite code here" className={inputCls} required />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
              Join Group
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GroupList;
