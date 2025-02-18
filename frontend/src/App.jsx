import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../src/features/Auth/pages/Login';
import Register from '../src/features/Auth/pages/Register';
import Home from '../src/pages/Home';
import UserProfile from '../src/pages/UserProfile';
import Layout from './pages/Layout';
import GroupPage from './features/Group/pages/GroupPage';
import GroupSettings from './features/Group/pages/GroupSettings';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home"/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/profile" element={<Layout><UserProfile /></Layout>} />
        <Route path="/group/:groupId" element={<Layout><GroupPage /></Layout>} />
        <Route path="/group-settings/:groupId" element={<Layout><GroupSettings /></Layout>} />

      </Routes>
    </Router>
  );
};

export default App;
