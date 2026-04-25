import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiClipboard, FiEdit2, FiCheck, FiTrash2, FiLogOut, FiX, FiUsers, FiShield,
} from "react-icons/fi";
import axios from "axios";
import { useActivity } from "../../../contexts/ActivityContext";
import ConfirmModal from "../../../shared/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const MemberAvatar = ({ name, size = "md" }) => {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const colors = ["from-blue-500 to-indigo-600","from-violet-500 to-purple-600","from-emerald-500 to-teal-600","from-orange-500 to-red-500","from-pink-500 to-rose-600","from-cyan-500 to-blue-600"];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  const sz = size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
};

const GroupSettingsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState({ _id: "", name: "", description: "", groupCode: "", admin: "", members: [] });
  const [members, setMembers] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type: 'delete'|'exit'|'remove', memberId? }
  const [actionLoading, setActionLoading] = useState(false);
  const { logActivity } = useActivity();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const [groupRes, userRes] = await Promise.all([
          axios.get(`${VITE_BASE_URL}/groups/${groupId}`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${VITE_BASE_URL}/user/getId`, { headers: { authorization: `Bearer ${token}` } }),
        ]);
        setGroupInfo(groupRes.data);
        setNewGroupName(groupRes.data.name);
        setNewGroupDescription(groupRes.data.description);
        setCurrentUser(userRes.data);

        const memberDetails = await Promise.all(
          groupRes.data.members.map((memberId) =>
            axios.get(`${VITE_BASE_URL}/user/${memberId}`, { headers: { authorization: `Bearer ${token}` } })
              .then(r => r.data)
          )
        );
        setMembers(memberDetails);
      } catch (error) {
        // silently fail
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  const isAdmin = currentUser && currentUser === groupInfo.admin;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupInfo.groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied!", { autoClose: 1500, hideProgressBar: true });
  };

  const handleSaveName = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${VITE_BASE_URL}/groups/${groupId}`, { name: newGroupName }, { headers: { authorization: `Bearer ${token}` } });
      setGroupInfo((prev) => ({ ...prev, name: newGroupName }));
      setIsEditingName(false);
      logActivity("Group", `Edited ${newGroupName} group name`);
    } catch (error) {
      toast.error("Failed to save name");
    }
  };

  const handleSaveDescription = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${VITE_BASE_URL}/groups/${groupId}`, { description: newGroupDescription }, { headers: { authorization: `Bearer ${token}` } });
      setGroupInfo((prev) => ({ ...prev, description: newGroupDescription }));
      setIsEditingDescription(false);
      logActivity("Group", `Edited ${groupInfo.name} group description`);
    } catch (error) {
      toast.error("Failed to save description");
    }
  };

  const executeConfirm = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (confirm.type === "delete") {
        await axios.delete(`${VITE_BASE_URL}/groups/${groupInfo._id}`, { headers: { authorization: `Bearer ${token}` } });
        logActivity("Group", `Deleted ${groupInfo.name}`);
        navigate("/home");
      } else if (confirm.type === "exit") {
        await axios.delete(`${VITE_BASE_URL}/groups/${groupInfo._id}/exit`, { headers: { authorization: `Bearer ${token}` } });
        logActivity("Group", `Left ${groupInfo.name}`);
        navigate("/home");
      } else if (confirm.type === "remove") {
        await axios.delete(`${VITE_BASE_URL}/groups/${groupId}/member`, {
          headers: { authorization: `Bearer ${token}` },
          data: { userId: confirm.memberId },
        });
        setMembers((prev) => prev.filter((m) => m._id !== confirm.memberId));
      }
    } catch (error) {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-theme text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition bg-surface";

  return (
    <main className="flex flex-1 relative h-full">
      <ToastContainer position="top-right" theme="light" />
      <div className="flex-1 bg-surface rounded-3xl shadow-sm border border-theme flex flex-col max-h-[87vh] overflow-y-auto">

        {/* Top banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-t-3xl px-8 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-3xl font-black shadow-inner border border-white/20">
              {groupInfo.name?.[0]?.toUpperCase() || "G"}
            </div>
            <div className="flex-1 min-w-0">
              {/* Group name editing */}
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    className="bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-xl px-3 py-1.5 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-white/40 w-full"
                  />
                  <button onClick={handleSaveName} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition flex-shrink-0">
                    <FiCheck />
                  </button>
                  <button onClick={() => setIsEditingName(false)} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition flex-shrink-0">
                    <FiX />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold truncate">{groupInfo.name}</h1>
                  {isAdmin && (
                    <button onClick={() => setIsEditingName(true)} className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition flex-shrink-0">
                      <FiEdit2 className="text-sm" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-blue-200 text-sm mt-1">{members.length} member{members.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Description */}
          <div className="bg-surface-2 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Description</h3>
              {isAdmin && !isEditingDescription && (
                <button onClick={() => setIsEditingDescription(true)} className="text-theme-muted hover:text-blue-500 transition">
                  <FiEdit2 className="text-sm" />
                </button>
              )}
            </div>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} rows={3} className={inputCls + " resize-none"} />
                <div className="flex gap-2">
                  <button onClick={handleSaveDescription} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">Save</button>
                  <button onClick={() => setIsEditingDescription(false)} className="text-xs bg-theme-border text-theme-secondary px-3 py-1.5 rounded-lg hover:bg-slate-300 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-theme-secondary">{groupInfo.description || <span className="italic text-theme-muted">No description set</span>}</p>
            )}
          </div>

          {/* Group Code (admin only) */}
          {isAdmin && (
            <div className="bg-surface-2 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-3">Invite Code</h3>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-theme-primary bg-surface border border-theme px-4 py-2.5 rounded-xl text-sm tracking-widest">
                  {groupInfo.groupCode}
                </code>
                <button onClick={handleCopyCode} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition ${copied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                  <FiClipboard className="text-sm" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {/* Members */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiUsers className="text-theme-muted" />
              <h3 className="text-sm font-bold text-theme-primary">Members</h3>
              <span className="text-xs text-theme-muted bg-surface-2 px-2 py-0.5 rounded-full">{members.length}</span>
            </div>
            <ul className="space-y-2">
              {members.map((member) => (
                <li key={member._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-2 transition">
                  <div className="flex items-center gap-3 relative">
                    <div className="relative">
                      {member.profilePicture ? (
                        <img src={member.profilePicture} alt={member.name} className="w-9 h-9 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <MemberAvatar name={member.name} />
                      )}
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-theme-primary">{member.name}</p>
                      <p className="text-xs text-theme-muted truncate max-w-[180px]">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member._id === groupInfo.admin ? (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
                        <FiShield className="text-[10px]" /> Admin
                      </span>
                    ) : (
                      isAdmin && (
                        <button
                          onClick={() => setConfirm({ type: "remove", memberId: member._id })}
                          className="w-7 h-7 rounded-lg bg-surface-2 text-theme-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition"
                        >
                          <FiX className="text-sm" />
                        </button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Danger zone */}
          <div className="border border-red-100 rounded-2xl p-4 bg-red-50/50">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>
            {isAdmin ? (
              <button
                onClick={() => setConfirm({ type: "delete" })}
                className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-sm shadow-red-500/20 active:scale-95"
              >
                <FiTrash2 /> Delete Group
              </button>
            ) : (
              <button
                onClick={() => setConfirm({ type: "exit" })}
                className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm active:scale-95"
              >
                <FiLogOut /> Leave Group
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm dialogs */}
      {confirm?.type === "delete" && (
        <ConfirmModal
          title="Delete group"
          message={`"${groupInfo.name}" will be permanently deleted for all members. This cannot be undone.`}
          confirmLabel="Delete Group"
          danger
          loading={actionLoading}
          onConfirm={executeConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === "exit" && (
        <ConfirmModal
          title="Leave group"
          message={`You'll lose access to "${groupInfo.name}" and all its content.`}
          confirmLabel="Leave Group"
          danger
          loading={actionLoading}
          onConfirm={executeConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === "remove" && (
        <ConfirmModal
          title="Remove member"
          message="This member will be removed from the group and lose access to all group content."
          confirmLabel="Remove Member"
          danger
          loading={actionLoading}
          onConfirm={executeConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </main>
  );
};

export default GroupSettingsPage;
