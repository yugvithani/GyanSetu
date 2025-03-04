import React from "react";
import GroupList from "../components/GroupList";
import RecentActivity from "../components/RecentActivity";

const HomePage = () => {
  return (
    // Center Content
    <main className="flex flex-1 mt-8 space-x-6">
      <GroupList />
      <RecentActivity />
    </main>
  );
};

export default HomePage;
