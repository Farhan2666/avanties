import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Sidebar from './components/Sidebar/Sidebar';
import MobileNav from './components/MobileNav/MobileNav';
import Dashboard from './pages/Dashboard/Dashboard';
import GamingHub from './pages/GamingHub/GamingHub';
import Community from './pages/Community/Community';
import FeliaAI from './pages/FeliaAI/FeliaAI';
import XPSystem from './pages/XPSystem/XPSystem';
import Settings from './pages/Settings/Settings';
import Auth from './components/Auth/Auth';

const AppContent = () => {
  const { session, loading } = useUser();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2ff' }}>Loading Avanties...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
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
        <MobileNav />
      </div>
    </Router>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
