import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiSearch, FiUserPlus, FiLock, FiGlobe } from "react-icons/fi";
import { useGroups } from "../contexts/GroupContext";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const { setGroups } = useGroups();

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
          `${VITE_BASE_URL}/groups/search?query=${query}`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );
        setResults(response.data);
      } catch (error) {
        // silently fail
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
    const { groupCode } = group;
    const toastId = toast.loading("Joining group...");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${VITE_BASE_URL}/groups/join`,
        { groupCode },
        { headers: { authorization: `Bearer ${token}` } }
      );
      setGroups((prevGroups) => [...prevGroups, group]);
      setQuery("");
      setShowResults(false);
      toast.update(toastId, {
        render: "Joined group successfully! 🎉",
        type: "success",
        isLoading: false,
        autoClose: 2000,
        hideProgressBar: true,
        theme: "light",
      });
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.error || "Error joining group",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: true,
        theme: "light",
      });
    }
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      {/* Search Input */}
      <div className="relative group">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search groups..."
          onFocus={() => setShowResults(true)}
          className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl shadow-sm border border-slate-100 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showResults && query.trim() !== "" && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 overflow-hidden animate-slide-up">
          {loading ? (
            <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto w-full p-2 space-y-1">
              {results.map((group) => (
                <div
                  key={group._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-800 font-semibold text-sm truncate">{group.name}</p>
                      {group.isPrivate ? (
                        <FiLock className="text-[10px] text-slate-300 flex-shrink-0" />
                      ) : (
                        <FiGlobe className="text-[10px] text-slate-300 flex-shrink-0" />
                      )}
                    </div>
                    {group.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{group.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleJoinGroup(group)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex-shrink-0"
                    title="Join Group"
                  >
                    <FiUserPlus className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiSearch className="text-slate-300 text-xl" />
              </div>
              <p className="text-slate-600 text-sm font-medium">No results found</p>
              <p className="text-slate-400 text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
