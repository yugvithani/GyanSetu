import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../config"; // Ensure this points to your API base URL

function RecentActivity() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/activities/all`, {
                    headers: { authorization: `Bearer ${token}` },
                });

                setActivities(response.data); // Fetch all activities
            } catch (error) {
                console.error("Error fetching recent activities:", error);
            }
        };

        fetchActivities();
    }, []);

    return (
        <div className="w-1/3 bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-blue-600">Recent Activities</h2>
            {/* Scrollable List with Fixed Height */}
            <ul className="mt-4 space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
                {activities.length > 0 ? (
                    activities.map((activity, index) => (
                        <li
                            key={index}
                            className="bg-blue-50 p-3 rounded-lg text-blue-600 shadow hover:shadow-lg transition-all"
                        >
                            {activity.type}: {activity.content}
                        </li>
                    ))
                ) : (
                    <li className="text-gray-500">No recent activities</li>
                )}
            </ul>
        </div>
    );
}

export default RecentActivity;
