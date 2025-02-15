import React from 'react'

function GroupList() {
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-blue-600">Your Groups</h2>
      <ul className="mt-6 space-y-4">
        {["Group 1", "Group 2", "Group 3"].map((group, index) => (
          <li
            key={index}
            className="bg-blue-50 p-4 rounded-lg text-blue-600 shadow hover:shadow-lg transition-all"
          >
            {group}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GroupList;