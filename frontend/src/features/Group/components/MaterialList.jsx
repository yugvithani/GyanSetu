import React from "react";

const MaterialList = ({ materials }) => {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg h-full">
      <h2 className="text-lg font-semibold mb-4">Group Materials</h2>
      <ul>
        {materials.map((material) => (
          <li key={material.id} className="p-2 border-b">
            <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              {material.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialList;
