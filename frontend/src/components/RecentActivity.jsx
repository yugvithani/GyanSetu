import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiUser, FiActivity } from "react-icons/fi";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const activityIcon = (type) => {
  if (type === "Group") return <FiUsers className="text-blue-400" />;
  if (type === "Profile") return <FiUser className="text-violet-400" />;
  return <FiActivity className="text-slate-400" />;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const SkeletonRow = () => (
  <li className="flex items-center gap-3 animate-pulse">
    <div className="w-7 h-7 rounded-lg bg-slate-200 flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-2.5 bg-slate-200 rounded w-3/4" />
      <div className="h-2 bg-slate-100 rounded w-1/3" />
    </div>
  </li>
);

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${VITE_BASE_URL}/activities/all`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setActivities(response.data);
      } catch (error) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="w-80 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">Activity</h2>
        <p className="text-xs text-slate-400 mt-0.5">Your recent actions</p>
      </div>

      {loading ? (
        <ul className="space-y-4">
          {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
        </ul>
      ) : activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
            <FiActivity className="text-slate-300 text-xl" />
          </div>
          <p className="text-slate-500 text-sm font-medium">No activity yet</p>
          <p className="text-slate-400 text-xs mt-1">Start by creating or joining a group</p>
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto flex-1 max-h-[580px] pr-1">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition group">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                {activityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium leading-snug">{activity.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{activity.type}</span>
                  {activity.createdAt && (
                    <span className="text-[11px] text-slate-400">{timeAgo(activity.createdAt)}</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;
