import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../config";
// import AttachmentButton from "../AttachmentButton";

const MaterialPage = () => {
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/materials`, {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };
    fetchMaterials();
  }, []);

  const filteredMaterials = materials
    .filter((material) =>
      material.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Sticky Search & Sort Bar */}
      <div className="sticky top-0 z-10 bg-gray-100 p-4 shadow-md flex justify-between items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search materials..."
          className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>

        {/* Attachment Button for Uploading */}
        {/* <AttachmentButton /> */}
      </div>

      {/* Material List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((material) => (
            <div key={material._id} className="p-4 bg-white rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">{material.name}</h2>
              <p className="text-sm text-gray-600">Sent by: {material.senderName}</p>
              <p className="text-sm text-gray-500">{new Date(material.createdAt).toLocaleString()}</p>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View Material
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No materials found.</p>
        )}
      </div>
    </div>
  );
};

export default MaterialPage;
