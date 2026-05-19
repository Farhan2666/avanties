import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  LayoutDashboard, Gamepad2, Users, MessageCircle, Zap
} from 'lucide-react';
import './MobileNav.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dash', path: '/dashboard' },
  { icon: Gamepad2, label: 'Games', path: '/gaming' },
  { icon: Users, label: 'Feed', path: '/community' },
  { icon: MessageCircle, label: 'Felia', path: '/felia' },
  { icon: Zap, label: 'Quests', path: '/xp' },
];

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useUser();

  if (!session) return null;

  return (
    <div className="mobile-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="mobile-nav__icon-wrapper">
              <item.icon size={22} />
              {item.path === '/felia' && <span className="mobile-nav__badge" />}
            </div>
            <span className="mobile-nav__label">{item.label}</span>
            {isActive && <div className="mobile-nav__active-glow" />}
          </button>
        );
      })}
    </div>
  );
};

export default MobileNav;
