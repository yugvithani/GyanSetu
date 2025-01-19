import React from 'react'

function RecentActivity() {
    return (
        <div className="w-1/3 bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-blue-600">Recent Activities</h2>
            <ul className="mt-6 space-y-4">
                {["Activity 1", "Activity 2", "Activity 3"].map((activity, index) => (
                    <li
                        key={index}
                        className="bg-blue-50 p-4 rounded-lg text-blue-600 shadow hover:shadow-lg transition-all"
                    >
                        {activity}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default RecentActivity