import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiPlus, FiTrash2, FiClock, FiCheckCircle, FiCircle, FiMoreHorizontal } from "react-icons/fi";
import ConfirmModal from "../../../shared/ConfirmModal";
import { useActivity } from "../../../contexts/ActivityContext";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const SkeletonTask = () => (
  <div className="bg-surface rounded-2xl p-4 border border-theme animate-pulse space-y-3">
    <div className="h-4 bg-theme-border rounded w-3/4" />
    <div className="h-3 bg-surface-2 rounded w-1/2" />
    <div className="flex gap-2 pt-2">
      <div className="h-6 bg-theme-border rounded-full w-16" />
      <div className="h-6 bg-surface-2 rounded-full w-20" />
    </div>
  </div>
);

const TasksPage = () => {
  const { groupId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [groupAdmin, setGroupAdmin] = useState(null);
  const { logActivity } = useActivity();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, [groupId]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [tasksRes, groupRes, userRes] = await Promise.all([
        axios.get(`${VITE_BASE_URL}/tasks/${groupId}`, { headers: { authorization: `Bearer ${token}` } }),
        axios.get(`${VITE_BASE_URL}/groups/${groupId}`, { headers: { authorization: `Bearer ${token}` } }),
        axios.get(`${VITE_BASE_URL}/user/getId`, { headers: { authorization: `Bearer ${token}` } })
      ]);
      setTasks(tasksRes.data);
      setCurrentUser(userRes.data);
      setGroupAdmin(groupRes.data.admin);
      
      const memberPromises = groupRes.data.members.map(memberId =>
        axios.get(`${VITE_BASE_URL}/user/${memberId}`, { headers: { authorization: `Bearer ${token}` } })
          .then(r => r.data)
      );
      const membersData = await Promise.all(memberPromises);
      setGroupMembers(membersData);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${VITE_BASE_URL}/tasks/${groupId}`, newTask, {
        headers: { authorization: `Bearer ${token}` }
      });
      setTasks([res.data, ...tasks]);
      setShowModal(false);
      setNewTask({ title: "", description: "", assignedTo: "", dueDate: "" });
      toast.success("Task created!", { autoClose: 2000, hideProgressBar: true });
      logActivity("Task", `Created task: ${newTask.title}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error creating task");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${VITE_BASE_URL}/tasks/${taskId}/status`, { status }, {
        headers: { authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteTask = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${VITE_BASE_URL}/tasks/${deleteTarget}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== deleteTarget));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "done") return <FiCheckCircle className="text-green-500" />;
    if (status === "in_progress") return <FiMoreHorizontal className="text-amber-500" />;
    return <FiCircle className="text-theme-muted" />;
  };

  return (
    <main className="flex flex-1 relative h-full">
      <ToastContainer position="top-right" theme="light" />
      <div className="flex-1 bg-surface rounded-3xl shadow-sm border border-theme flex flex-col max-h-[87vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-theme-primary">Tasks & Assignments</h2>
            <p className="text-xs text-theme-muted mt-0.5">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm active:scale-95"
          >
            <FiPlus className="text-sm" /> Add Task
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-2/50">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <SkeletonTask key={i} />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-theme flex items-center justify-center mb-4">
                <FiCheckCircle className="text-theme-muted text-2xl" />
              </div>
              <p className="text-theme-muted font-semibold text-sm">No tasks assigned</p>
              <p className="text-theme-muted text-xs mt-1">Create a task to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => {
                const canDelete = currentUser === task.createdBy?._id || currentUser === groupAdmin;
                return (
                  <div key={task._id} className="bg-surface rounded-2xl border border-theme p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className={`font-semibold text-sm ${task.status === "done" ? "line-through text-theme-muted" : "text-theme-primary"}`}>
                        {task.title}
                      </h3>
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(task._id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-theme-muted hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-theme-muted mb-4 line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 space-y-3 border-t border-theme">
                      <div className="flex justify-between items-center text-[11px] font-medium font-sans tracking-wide">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                          className={`px-2 py-1 rounded-md outline-none cursor-pointer border ${
                            task.status === "done" ? "bg-green-50 text-green-700 border-green-100" :
                            task.status === "in_progress" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-surface-2 text-theme-secondary border-theme"
                          }`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>

                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== "done" ? 'text-red-500' : 'text-theme-muted'}`}>
                            <FiClock />
                            {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between gap-2.5 bg-surface-2/50 p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-theme-muted tracking-wider">Assignee:</span>
                        {task.assignedTo ? (
                           <div className="flex items-center gap-1.5">
                             <img src={task.assignedTo.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedTo.name}&backgroundColor=1a63f5&textColor=ffffff`} alt="" className="w-5 h-5 rounded-md" />
                             <span className="text-xs font-semibold text-theme-primary truncate max-w-[100px]">{task.assignedTo.name}</span>
                           </div>
                        ) : (
                          <span className="text-xs font-medium text-theme-muted italic">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up pb-2">
            <div className="px-6 py-5 border-b border-theme">
              <h3 className="font-bold text-theme-primary">Assign New Task</h3>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-muted uppercase tracking-wider mb-1.5">Title</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-theme text-sm focus:ring-2 focus:ring-blue-500/40 outline-none" placeholder="e.g. Complete chapter 5 exercises" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-theme-muted uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-theme text-sm focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" placeholder="Add more context..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-theme-muted uppercase tracking-wider mb-1.5">Assign To</label>
                    <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-theme text-sm focus:ring-2 focus:ring-blue-500/40 outline-none bg-surface">
                      <option value="">Anyone (Unassigned)</option>
                      {groupMembers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-theme-muted uppercase tracking-wider mb-1.5">Due Date</label>
                    <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-theme text-sm focus:ring-2 focus:ring-blue-500/40 outline-none text-theme-secondary" />
                  </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-theme">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-surface-2 text-theme-secondary text-sm font-medium hover:bg-theme-border transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Verify */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteTask}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
};

export default TasksPage;
