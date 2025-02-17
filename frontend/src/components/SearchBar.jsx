import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaUserPlus } from "react-icons/fa";
import BASE_URL from "../config";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/groups/search?query=${query}`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );
        setResults(response.data); // store the results
      } catch (error) {
        toast.error(error.response?.data?.error || "Error fetching groups", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeButton: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchGroups, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleJoinGroup = async (group) => {
    const { groupCode } = group;  // Extract groupCode from the group object
    const toastId = toast.loading("Joining group...", {
      position: "top-center",
    });
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/groups/join`,
        { groupCode },
        { headers: { authorization: `Bearer ${token}` } }
      );
      toast.update(toastId, {
        render: "Joined group successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        position: "top-center",
        theme: "light",
        style: {
          background: "white",
          color: "black",
          fontWeight: "bold",
          borderRadius: "10px",
        },
      });
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.error || "Error joining group",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        position: "top-center",
        theme: "light",
        style: {
          background: "white",
          color: "black",
          fontWeight: "bold",
          borderRadius: "10px",
        },
      });
    }
  };

  return (
    <div className="relative w-full flex justify-center">
      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search groups..."
        className="w-2/3 px-4 py-2 text-base rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onFocus={() => setShowResults(true)}
      />

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div
          ref={searchRef}
          className="absolute top-12 w-2/3 bg-white shadow-lg rounded-lg border border-gray-200 z-50 p-1 max-h-48 overflow-y-auto"
        >
          {loading ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : (
            results.map((group) => (
              <div
                key={group._id}
                className="flex items-center justify-between p-2 bg-white rounded-md hover:bg-gray-100 transition duration-200 text-sm"
              >
                {/* Group Name */}
                <span className="text-gray-800 font-medium">{group.name}</span>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinGroup(group)}  // Pass the entire group object
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs shadow hover:bg-blue-700 transition"
                >
                  <FaUserPlus className="text-sm" />
                  <span className="hidden md:inline">Join</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <ToastContainer
        style={{
          zIndex: 9999, // Set a very high z-index value to ensure it's on top
        }}
      />
    </div>
  );
};

export default SearchBar;
