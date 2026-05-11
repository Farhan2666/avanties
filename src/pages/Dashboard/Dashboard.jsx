import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import Avatar from '../../components/Avatar/Avatar';
import {
  TrendingUp, Award, Clock, ChevronRight, Zap, Flame,
  Target, Star, Gamepad2, Users, MessageCircle
} from 'lucide-react';
import './Dashboard.css';

const stats = [
  { title: 'Total XP', value: '124,500', icon: Zap, trend: '+12%', color: '#00f2ff' },
  { title: 'Achievements', value: '48 / 150', icon: Award, trend: null, color: '#7000ff' },
  { title: 'Play Time', value: '156h 20m', icon: Clock, trend: '+3h', color: '#ff2d95' },
  { title: 'Win Rate', value: '67.3%', icon: TrendingUp, trend: '+2.1%', color: '#00ff88' },
];

const recentActivity = [
  { action: 'Completed Quest: Shadow Realm', xp: 500, time: '2h ago', type: 'quest' },
  { action: 'Won PvP Match vs. NightOwl', xp: 250, time: '4h ago', type: 'pvp' },
  { action: 'Unlocked Achievement: First Blood', xp: 1000, time: '6h ago', type: 'achievement' },
  { action: 'Joined Clan: Cyber Knights', xp: 100, time: '1d ago', type: 'social' },
  { action: 'Completed Daily Login Streak (7 days)', xp: 750, time: '1d ago', type: 'streak' },
];

const quickActions = [
  { icon: Gamepad2, label: 'Gaming Hub', desc: 'Explore games', path: '/gaming' },
  { icon: Users, label: 'Community', desc: 'Join discussions', path: '/community' },
  { icon: Target, label: 'Daily Quests', desc: '3 pending', path: '/xp' },
  { icon: MessageCircle, label: 'Talk to Felia', desc: 'AI assistant', path: '/felia' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="page-container">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header__left">
          <p className="dash-header__greeting">Welcome back, {user.displayName} ✨</p>
          <h1 className="dash-header__title">Dashboard</h1>
        </div>
        <div className="dash-header__right">
          <div className="dash-header__rank">
            <span className="dash-header__rank-label">Current Rank</span>
            <span className="dash-header__rank-value text-gradient">{user.rank}</span>
          </div>
          <div className="dash-header__avatar-ring">
            <Avatar src={user.avatar} name={user.displayName} size={48} />
          </div>
        </div>
      </header>

      {/* Felia AI Banner */}
      <section className="felia-banner" onClick={() => navigate('/felia')}>
        <div className="felia-banner__orb">
          <div className="felia-banner__orb-inner" />
          <div className="felia-banner__orb-pulse" />
          <div className="felia-banner__status" />
        </div>
        <div className="felia-banner__content">
          <h3 className="felia-banner__name">Felia AI</h3>
          <p className="felia-banner__msg">
            "You have <strong>3 daily quests</strong> pending. Ready to level up today? 🚀"
          </p>
        </div>
        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); navigate('/felia'); }}>
          Talk to Felia <ChevronRight size={16} />
        </button>
      </section>

      {/* Stats */}
      <section className="dash-stats grid-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-card__header">
              <div className="stat-card__icon" style={{ background: `${s.color}10`, color: s.color }}>
                <s.icon size={22} />
              </div>
              {s.trend && (
                <span className="stat-card__trend badge-emerald badge">{s.trend}</span>
              )}
            </div>
            <p className="stat-card__label">{s.title}</p>
            <p className="stat-card__value">{s.value}</p>
          </div>
        ))}
      </section>

      <div className="dash-columns">
        {/* Recent Activity */}
        <section className="dash-activity">
          <div className="section-title">
            <h2>Recent Activity</h2>
            <button onClick={() => navigate('/xp')}>View All →</button>
          </div>
          <div className="activity-list">
            {recentActivity.map((a, i) => (
              <div key={i} className="activity-item glass-panel" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="activity-item__dot" data-type={a.type} />
                <div className="activity-item__info">
                  <p className="activity-item__action">{a.action}</p>
                  <span className="activity-item__time">{a.time}</span>
                </div>
                <span className="activity-item__xp">+{a.xp} XP</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dash-quick">
          <div className="section-title">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-grid">
            {quickActions.map((q, i) => (
              <button key={i} className="quick-action glass-card" onClick={() => navigate(q.path)}>
                <div className="quick-action__icon">
                  <q.icon size={22} />
                </div>
                <span className="quick-action__label">{q.label}</span>
                <span className="quick-action__desc">{q.desc}</span>
              </button>
            ))}
          </div>

          {/* Streak Card */}
          <div className="streak-card glass-panel">
            <div className="streak-card__header">
              <Flame size={20} style={{ color: '#ffaa00' }} />
              <span className="streak-card__title">Login Streak</span>
            </div>
            <div className="streak-card__days">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className={`streak-day ${i < 5 ? 'streak-day--done' : ''}`}>
                  <Star size={14} />
                  <span>{d}</span>
                </div>
              ))}
            </div>
            <p className="streak-card__info">🔥 5-day streak! 2 more for bonus XP</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
