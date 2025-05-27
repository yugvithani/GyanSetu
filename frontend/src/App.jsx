import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../src/features/Auth/pages/Login";
import Register from "../src/features/Auth/pages/Register";
import Home from "../src/pages/Home";
import Layout from "./pages/Layout";
// import GroupPage from "./features/Group/pages/GroupPage";
import GroupSettings from "./features/Group/pages/GroupSettings";
import ProtectRoute from "./shared/ProtectRoute";
import { ActivityProvider } from "./contexts/ActivityContext";
import JoinScreen from "./features/VideoSession/components/JoinScreen";
import { GroupProvider } from "./contexts/GroupContext";
import ChatPage from "./features/Group/pages/ChatPage";
import MaterialPage from "./features/Group/pages/MaterialPage";
import SessionPage from "./features/Group/pages/SessionPage";

const App = () => {
  return (
    <GroupProvider>
    <Router>
      
      <ActivityProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/home" element={<ProtectRoute><Layout><Home /></Layout></ProtectRoute>} />
          {/* <Route path="/group/:groupId" element={<ProtectRoute><Layout><GroupPage /></Layout></ProtectRoute>} /> */}
          <Route path="/group/:groupId/settings" element={<ProtectRoute><Layout><GroupSettings /></Layout></ProtectRoute>} />
          <Route path="/group/:groupId/chat" element={<ProtectRoute><Layout><ChatPage /></Layout></ProtectRoute>} />
          <Route path="/group/:groupId/material" element={<ProtectRoute><Layout><MaterialPage /></Layout></ProtectRoute>} />
          <Route path="/group/:groupId/session" element={<ProtectRoute><Layout><SessionPage /></Layout></ProtectRoute>} />
          <Route path="/session/:meetingId" element={<JoinScreen/>}/>
        </Routes>
      </ActivityProvider>
    </Router>
    </GroupProvider>
  );
};

export default App;
