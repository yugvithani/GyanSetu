import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import BASE_URL from "../config";

const GroupList = () => {
  const [showForm, setShowForm] = useState(false);
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    isPrivate: true,
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/groups/all`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setGroups(response.data);
      } catch (error) {
        toast.error(error.response?.data?.error || "Error fetching groups", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "light",
          style: { background: "white", color: "black", fontWeight: "bold", borderRadius: "10px" }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupData({
      ...groupData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating group...", { position: "top-center" });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/groups/create`,
        groupData,
        { headers: { authorization: `Bearer ${token}` } }
      );
      setGroups([...groups, response.data]);
      setShowForm(false);
      toast.update(toastId, {
        render: "Group created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        position: "top-center",
        theme: "light",
        style: { background: "white", color: "black", fontWeight: "bold", borderRadius: "10px" }
      });
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.error || "Error creating group",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        position: "top-center",
        theme: "light",
        style: { background: "white", color: "black", fontWeight: "bold", borderRadius: "10px" }
      });
    }
  };

  // Function to handle group click
  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`); // Navigate to /group/:id
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-blue-600">Your Groups</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all"
        >
          <FaPlus />
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 mt-4">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="text-center text-gray-500 mt-6 py-10 bg-blue-50 rounded-lg">
          No groups available
        </div>
      ) : (
        <ul className="mt-6 space-y-4 overflow-y-auto flex-1 max-h-[650px]">
          {groups.map((group, index) => (
            <li
              key={index}
              className="bg-blue-50 p-4 rounded-lg text-blue-600 shadow hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleGroupClick(group._id)} // Add onClick handler
            >
              <h3 className="font-semibold">{group.name}</h3>
              <p className="text-sm text-gray-600">{group.description || "No description"}</p>
              <p className="text-xs text-gray-500">
                Privacy: {group.isPrivate ? "Private" : "Public"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Create Group</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Group Name"
                value={groupData.name}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              />
              <textarea
                name="description"
                placeholder="Group Description"
                value={groupData.description}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={groupData.isPrivate}
                  onChange={handleChange}
                />
                <span className="text-gray-700">Private Group</span>
              </label>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList;