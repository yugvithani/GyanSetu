import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../config";
import { HiTrash, HiDocumentText } from "react-icons/hi";

const MaterialPage = () => {
  const { groupId } = useParams(); // Get groupId from URL
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    if (!groupId) return; // Ensure groupId exists before making a request

    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/materials/${groupId}`, {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    fetchMaterials();
  }, [groupId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await axios.delete(`${BASE_URL}/materials/${id}`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMaterials((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const filteredMaterials = materials
    .filter((material) =>
      material.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "latest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center rounded-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search materials..."
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((material) => (
            <div
              key={material._id}
              className="p-4 bg-white rounded-lg shadow-lg flex flex-col justify-between h-44 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <HiDocumentText className="text-blue-600 text-3xl" />
                <h2 className="text-lg font-semibold text-gray-800 truncate w-48">
                  {truncateText(material.name || "Unnamed Material", 20)}
                </h2>
              </div>
              <p className="text-sm text-gray-500">
                Sent by: {material.senderName || "Unknown"}
              </p>
              <p className="text-xs text-gray-400">
                {material.createdAt ? new Date(material.createdAt).toLocaleString() : "Unknown Date"}
              </p>
              <div className="flex justify-between items-center mt-2">
                {material.fileUrl ? (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Material
                  </a>
                ) : (
                  <span className="text-gray-500 text-sm">No file available</span>
                )}
                <button
                  onClick={() => handleDelete(material._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <HiTrash className="text-xl" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No materials found.</p>
        )}
      </div>
    </div>
  );
};

export default MaterialPage;
