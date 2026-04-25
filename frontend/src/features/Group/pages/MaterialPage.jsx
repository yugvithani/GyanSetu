import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { HiDocumentText } from "react-icons/hi";
import { FiTrash2, FiDownload, FiSearch, FiInbox } from "react-icons/fi";
import ConfirmModal from "../../../shared/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const fileTypeColor = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext)) return "from-red-400 to-rose-500";
  if (["doc", "docx"].includes(ext)) return "from-blue-400 to-blue-600";
  if (["ppt", "pptx"].includes(ext)) return "from-orange-400 to-red-500";
  if (["txt"].includes(ext)) return "from-slate-400 to-slate-600";
  return "from-blue-500 to-indigo-600";
};

const SkeletonCard = () => (
  <div className="bg-surface rounded-2xl p-4 border border-theme animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-theme-border" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-theme-border rounded w-2/3" />
        <div className="h-2.5 bg-surface-2 rounded w-1/2" />
      </div>
    </div>
    <div className="h-2 bg-surface-2 rounded w-1/3" />
  </div>
);

const MaterialPage = () => {
  const { groupId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentUser, setCurrentUser] = useState(null);
  const [groupInfo, setGroupInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    const token = localStorage.getItem("token");

    const fetchAll = async () => {
      try {
        const [matRes, userRes, groupRes] = await Promise.all([
          axios.get(`${VITE_BASE_URL}/materials/${groupId}`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${VITE_BASE_URL}/user/getId`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${VITE_BASE_URL}/groups/${groupId}`, { headers: { authorization: `Bearer ${token}` } }),
        ]);
        setMaterials(matRes.data);
        setCurrentUser(userRes.data);
        setGroupInfo(groupRes.data);
      } catch (error) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [groupId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${VITE_BASE_URL}/materials/${deleteTarget}`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        data: { adminId: groupInfo.admin, senderId: currentUser },
      });
      setMaterials((prev) => prev.filter((item) => item._id !== deleteTarget));
      toast.success("Material deleted", { autoClose: 2000, hideProgressBar: true });
    } catch (error) {
      toast.error("Failed to delete material");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const truncateText = (text, max) =>
    text?.length > max ? text.substring(0, max) + "..." : text;

  const filteredMaterials = materials
    .filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortBy === "latest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const isAdmin = currentUser === groupInfo.admin;

  return (
    <main className="flex flex-1 relative h-full">
      <ToastContainer position="top-right" theme="light" />
      <div className="flex-1 bg-surface rounded-3xl shadow-sm border border-theme flex flex-col max-h-[87vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-theme flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-theme-primary">Materials</h2>
            <p className="text-xs text-theme-muted mt-0.5">{filteredMaterials.length} file{filteredMaterials.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-9 pr-4 py-2 rounded-xl border border-theme text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition w-44"
              />
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-theme text-sm text-theme-secondary focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition bg-surface"
            >
              <option value="latest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                <FiInbox className="text-theme-muted text-2xl" />
              </div>
              <p className="text-theme-muted font-semibold text-sm">No materials found</p>
              <p className="text-theme-muted text-xs mt-1">
                {searchQuery ? "Try a different search term" : "Files shared in chat will appear here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <div
                  key={material._id}
                  className="bg-surface rounded-2xl border border-theme p-4 hover:border-blue-200 hover:shadow-md transition-all duration-150 group flex flex-col gap-3"
                >
                  {/* File icon + name */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fileTypeColor(material.name)} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <HiDocumentText className="text-white text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-theme-primary truncate">
                        {truncateText(material.name || "Unnamed File", 28)}
                      </p>
                      <p className="text-xs text-theme-muted mt-0.5">
                        by {material.senderName || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-theme-muted">
                    {material.createdAt ? new Date(material.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Unknown date"}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-auto pt-1 border-t border-theme">
                    {material.fileUrl ? (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-semibold transition"
                      >
                        <FiDownload className="text-sm" /> View / Download
                      </a>
                    ) : (
                      <span className="text-theme-muted text-xs">No file available</span>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTarget(material._id)}
                        className="w-7 h-7 rounded-lg bg-surface-2 text-theme-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete material"
          message="This file will be permanently removed from the group. Members will no longer be able to access it."
          confirmLabel="Delete File"
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
};

export default MaterialPage;
