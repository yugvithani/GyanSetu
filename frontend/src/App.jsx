import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../src/features/Auth/pages/Login';
import Register from '../src/features/Auth/pages/Register';
import Home from '../src/pages/Home';
import Layout from './pages/Layout';
import GroupPage from './features/Group/pages/GroupPage';
import GroupSettings from './features/Group/pages/GroupSettings';
import ProtectRoute from './shared/ProtectRoute';

const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/home"/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/home" element={<ProtectRoute><Layout><Home /></Layout></ProtectRoute>} />
        <Route path="/group/:groupId" element={<ProtectRoute><Layout><GroupPage /></Layout></ProtectRoute>} />
        <Route path="/group-settings/:groupId" element={<ProtectRoute><Layout><GroupSettings /></Layout></ProtectRoute>} />

      </Routes>
    </Router>
  );
};

export default App;
