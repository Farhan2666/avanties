import React from 'react';
import { useUser } from '../../context/UserContext';
import {
  Zap, Target, Trophy, Star, Clock,
  Flame, CheckCircle2, Circle
} from 'lucide-react';
import './XPSystem.css';

const dailyQuests = [
  { title: 'Play 3 PvP Matches', xp: 300, progress: 2, total: 3, type: 'daily' },
  { title: 'Win 1 Ranked Game', xp: 500, progress: 0, total: 1, type: 'daily' },
  { title: 'Login & Explore Dashboard', xp: 100, progress: 1, total: 1, type: 'daily', done: true },
  { title: 'Chat with Felia AI', xp: 150, progress: 1, total: 1, type: 'daily', done: true },
];

const weeklyQuests = [
  { title: 'Complete 5 Daily Quest Sets', xp: 2000, progress: 3, total: 5, type: 'weekly' },
  { title: 'Earn 5,000 XP Total', xp: 1500, progress: 3200, total: 5000, type: 'weekly' },
  { title: 'Join a Community Event', xp: 1000, progress: 0, total: 1, type: 'weekly' },
];

const achievements = [
  { title: 'First Blood', desc: 'Win your first PvP match', xp: 1000, unlocked: true, icon: '⚔️', rarity: 'Common' },
  { title: 'Social Butterfly', desc: 'Make 10 community posts', xp: 1500, unlocked: true, icon: '🦋', rarity: 'Rare' },
  { title: 'Quest Master', desc: 'Complete 100 quests', xp: 5000, unlocked: false, icon: '🏆', rarity: 'Epic', progress: 67 },
  { title: 'Legendary Streak', desc: '30-day login streak', xp: 10000, unlocked: false, icon: '🔥', rarity: 'Legendary', progress: 23 },
];

const leaderboard = [
  { name: 'DragonSlayer99', xp: '245,000', rank: 1, level: 52 },
  { name: 'NightHawk', xp: '198,500', rank: 2, level: 47 },
  { name: 'PixelQueen', xp: '187,200', rank: 3, level: 45 },
  { name: 'CyberWolf', xp: '156,800', rank: 4, level: 41 },
  { name: 'Commander (You)', xp: '124,500', rank: 12, level: 24, isUser: true },
];

const getRarityColor = (rarity) => {
  switch(rarity) {
    case 'Common': return '#9ca3af';
    case 'Rare': return '#00f2ff';
    case 'Epic': return '#7000ff';
    case 'Legendary': return '#ffaa00';
    default: return '#9ca3af';
  }
};

const XPSystem = () => {
  const { user } = useUser()
  const level = user.level || 1
  const xp = user.xp || 0
  const xpMax = user.xp_max || 1000
  const totalXp = user.total_xp || 0
  const xpProgress = xpMax > 0 ? Math.round((xp / xpMax) * 100) : 0
  const rank = user.rank || 'Newbie'

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Zap size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-cyan)' }} />XP & Quests</h1>
        <p>Complete quests, earn XP, and unlock achievements</p>
      </div>

      {/* XP Overview Bar */}
      <section className="xp-overview glass-panel">
        <div className="xp-overview__main">
          <div className="xp-overview__level">
            <span className="xp-overview__level-badge">{level}</span>
            <div className="xp-overview__level-info">
              <h3>Level {level} — <span className="text-gradient">{rank}</span></h3>
              <p>{xp.toLocaleString()} / {xpMax.toLocaleString()} XP to Level {level + 1}</p>
            </div>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="xp-overview__stats">
          <div className="xp-mini-stat">
            <Flame size={18} style={{ color: '#ffaa00' }} />
            <div>
              <span className="xp-mini-stat__value">{level} Days</span>
              <span className="xp-mini-stat__label">Streak</span>
            </div>
          </div>
          <div className="xp-mini-stat">
            <Trophy size={18} style={{ color: '#7000ff' }} />
            <div>
              <span className="xp-mini-stat__value">#{level * 2 + 10}</span>
              <span className="xp-mini-stat__label">Global Rank</span>
            </div>
          </div>
          <div className="xp-mini-stat">
            <Star size={18} style={{ color: '#00f2ff' }} />
            <div>
              <span className="xp-mini-stat__value">{totalXp.toLocaleString() || xp.toLocaleString()}</span>
              <span className="xp-mini-stat__label">Total XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="xp-leaderboard-section" style={{ marginTop: 24 }}>
        <div className="section-title">
          <h2>Leaderboard</h2>
        </div>
        <div className="leaderboard-list glass-panel">
          {[
            { name: 'DragonSlayer99', xp: '245,000', rank: 1, level: 52 },
            { name: 'NightHawk', xp: '198,500', rank: 2, level: 47 },
            { name: 'PixelQueen', xp: '187,200', rank: 3, level: 45 },
            { name: 'CyberWolf', xp: '156,800', rank: 4, level: 41 },
            { name: user.displayName || 'You', xp: totalXp.toLocaleString() || xp.toLocaleString(), rank: 5, level: level, isUser: true },
          ].map((p, i) => (
            <div key={i} className={`leaderboard-item ${p.isUser ? 'leaderboard-item--user' : ''}`}>
              <span className={`leaderboard-item__rank ${p.rank <= 3 ? 'leaderboard-item__rank--top' : ''}`}>
                {p.rank <= 3 ? ['🥇','🥈','🥉'][p.rank - 1] : `#${p.rank}`}
              </span>
              <div className="leaderboard-item__avatar" style={{ background: p.isUser ? 'var(--accent-gradient)' : `hsl(${p.rank * 60}, 50%, 40%)` }} />
              <div className="leaderboard-item__info">
                <span className="leaderboard-item__name">{p.name}</span>
                <span className="leaderboard-item__level">Lv. {p.level}</span>
              </div>
              <span className="leaderboard-item__xp">{p.xp} XP</span>
            </div>
          ))}
        </div>
      </section>

      <div className="xp-layout">
        {/* Left: Quests */}
        <div className="xp-quests">
          {/* Daily Quests */}
          <section>
            <div className="section-title">
              <h2><Clock size={18} style={{ color: 'var(--accent-cyan)', marginRight: 8, verticalAlign: 'middle' }} />Daily Quests</h2>
              <span className="badge badge-cyan">Resets in 6h</span>
            </div>
            <div className="quest-list">
              {dailyQuests.map((q, i) => (
                <div key={i} className={`quest-item glass-panel ${q.done ? 'quest-item--done' : ''}`}>
                  <div className="quest-item__check">
                    {q.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <div className="quest-item__info">
                    <span className="quest-item__title">{q.title}</span>
                    {!q.done && (
                      <div className="quest-item__progress">
                        <div className="progress-bar" style={{ height: 4 }}>
                          <div className="progress-bar-fill" style={{ width: `${(q.progress / q.total) * 100}%` }} />
                        </div>
                        <span className="quest-item__count">{q.progress}/{q.total}</span>
                      </div>
                    )}
                  </div>
                  <span className="quest-item__xp">+{q.xp} XP</span>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly Quests */}
          <section style={{ marginTop: 28 }}>
            <div className="section-title">
              <h2><Target size={18} style={{ color: 'var(--accent-violet)', marginRight: 8, verticalAlign: 'middle' }} />Weekly Challenges</h2>
              <span className="badge badge-violet">3 days left</span>
            </div>
            <div className="quest-list">
              {weeklyQuests.map((q, i) => (
                <div key={i} className="quest-item quest-item--weekly glass-panel">
                  <div className="quest-item__check"><Circle size={20} /></div>
                  <div className="quest-item__info">
                    <span className="quest-item__title">{q.title}</span>
                    <div className="quest-item__progress">
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-bar-fill" style={{ width: `${(q.progress / q.total) * 100}%`, background: 'var(--accent-gradient-warm)' }} />
                      </div>
                      <span className="quest-item__count">{typeof q.progress === 'number' && q.total > 10 ? `${((q.progress / q.total) * 100).toFixed(0)}%` : `${q.progress}/${q.total}`}</span>
                    </div>
                  </div>
                  <span className="quest-item__xp" style={{ color: '#a855f7' }}>+{q.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Achievements & Leaderboard */}
        <aside className="xp-sidebar">
          {/* Achievements */}
          <section>
            <div className="section-title">
              <h2>Achievements</h2>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>48/150</span>
            </div>
            <div className="achievements-list">
              {achievements.map((a, i) => (
                <div key={i} className={`achievement-card glass-panel ${!a.unlocked ? 'achievement-card--locked' : ''}`}>
                  <div className="achievement-card__icon">{a.icon}</div>
                  <div className="achievement-card__info">
                    <div className="achievement-card__header">
                      <span className="achievement-card__title">{a.title}</span>
                      <span className="achievement-card__rarity" style={{ color: getRarityColor(a.rarity) }}>{a.rarity}</span>
                    </div>
                    <p className="achievement-card__desc">{a.desc}</p>
                    {!a.unlocked && a.progress !== undefined && (
                      <div className="quest-item__progress" style={{ marginTop: 6 }}>
                        <div className="progress-bar" style={{ height: 3 }}>
                          <div className="progress-bar-fill" style={{ width: `${a.progress}%` }} />
                        </div>
                        <span className="quest-item__count">{a.progress}%</span>
                      </div>
                    )}
                  </div>
                  <span className="achievement-card__xp">{a.unlocked ? '✅' : `+${a.xp.toLocaleString()}`}</span>
                </div>
              ))}
            </div>
          </section>


        </aside>
      </div>
    </div>
  );
};

export default XPSystem;
