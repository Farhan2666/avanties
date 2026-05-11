import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import Avatar from '../Avatar/Avatar';
import {
  LayoutDashboard, Gamepad2, Users, MessageCircle,
  Zap, Settings, LogOut, ChevronLeft
} from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Gamepad2, label: 'Gaming Hub', path: '/gaming' },
  { icon: Users, label: 'Community', path: '/community' },
  { icon: MessageCircle, label: 'Felia AI', path: '/felia', badge: '3' },
  { icon: Zap, label: 'XP & Quests', path: '/xp' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar__brand" onClick={() => navigate('/dashboard')}>
        <div className="sidebar__logo">
          <img src="/avanties-logo.jpg" alt="Avanties" className="sidebar__logo-img" />
        </div>
        {!collapsed && <span className="sidebar__title">AVANTIES</span>}
      </div>

      {/* Collapse Toggle */}
      <button className="sidebar__toggle" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
        <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              {!collapsed && (
                <>
                  <span className="sidebar__label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar__badge">{item.badge}</span>
                  )}
                </>
              )}
              {isActive && <div className="sidebar__active-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar__bottom">
        {/* XP mini-bar */}
        {!collapsed && (
          <div className="sidebar__xp-card">
            <div className="sidebar__xp-info">
              <span className="sidebar__xp-level">Level {user.level}</span>
              <span className="sidebar__xp-progress">{user.xp.toLocaleString()} / {user.xpMax.toLocaleString()} XP</span>
            </div>
            <div className="progress-bar" style={{ height: '4px' }}>
              <div className="progress-bar-fill" style={{ width: `${(user.xp / user.xpMax) * 100}%` }} />
            </div>
          </div>
        )}

        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              {!collapsed && <span className="sidebar__label">{item.label}</span>}
            </button>
          );
        })}

        <button className="sidebar__item sidebar__item--logout" onClick={logout}>
          <LogOut size={20} />
          {!collapsed && <span className="sidebar__label">Logout</span>}
        </button>

        {/* User Profile */}
        {!collapsed && (
          <div className="sidebar__profile" onClick={() => navigate('/settings')}>
            <div className="sidebar__avatar">
              <Avatar src={user.avatar} name={user.displayName} size={36} />
              <div className="sidebar__avatar-status" />
            </div>
            <div className="sidebar__profile-info">
              <span className="sidebar__profile-name">{user.displayName}</span>
              <span className="sidebar__profile-rank">{user.rank}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
