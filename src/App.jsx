import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import GamingHub from './pages/GamingHub/GamingHub';
import Community from './pages/Community/Community';
import FeliaAI from './pages/FeliaAI/FeliaAI';
import XPSystem from './pages/XPSystem/XPSystem';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/gaming" element={<GamingHub />} />
              <Route path="/community" element={<Community />} />
              <Route path="/felia" element={<FeliaAI />} />
              <Route path="/xp" element={<XPSystem />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
