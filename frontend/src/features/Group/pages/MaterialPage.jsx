import React from "react";

const MaterialPage = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Material</h2>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Material Content (Scrollable) */}
        <p>This is the material section.</p>
        <p>More material content...</p>
        <p>Additional material resources...</p>
      </div>
    </div>
  );
};

export default MaterialPage;
