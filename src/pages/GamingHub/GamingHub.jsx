import React from 'react';
import {
  Gamepad2, Search, Star, Users, Clock, TrendingUp,
  Sword, Shield, Rocket, Crosshair, Crown, Sparkles
} from 'lucide-react';
import './GamingHub.css';

const categories = ['All', 'RPG', 'FPS', 'Strategy', 'Adventure', 'Simulation', 'PvP'];

const games = [
  {
    title: 'Shadow Realm Online',
    genre: 'RPG',
    players: '12.4K',
    rating: 4.8,
    color: '#7000ff',
    icon: Sword,
    desc: 'Epic dark fantasy MMORPG with real-time combat',
    xpReward: '500 XP/hr',
    hot: true
  },
  {
    title: 'Neon Strike',
    genre: 'FPS',
    players: '8.2K',
    rating: 4.5,
    color: '#ff2d95',
    icon: Crosshair,
    desc: 'Cyberpunk competitive shooter with ranked matches',
    xpReward: '350 XP/hr',
    hot: true
  },
  {
    title: 'Galaxy Commander',
    genre: 'Strategy',
    players: '5.1K',
    rating: 4.7,
    color: '#00f2ff',
    icon: Rocket,
    desc: 'Build your space empire and conquer galaxies',
    xpReward: '400 XP/hr',
    hot: false
  },
  {
    title: 'Legends Arena',
    genre: 'PvP',
    players: '15.8K',
    rating: 4.9,
    color: '#ffaa00',
    icon: Crown,
    desc: '1v1 competitive arena with seasonal rankings',
    xpReward: '600 XP/hr',
    hot: true
  },
  {
    title: 'Mystic Forge',
    genre: 'Adventure',
    players: '3.7K',
    rating: 4.3,
    color: '#00ff88',
    icon: Sparkles,
    desc: 'Craft, explore, and uncover ancient mysteries',
    xpReward: '300 XP/hr',
    hot: false
  },
  {
    title: 'Iron Bastion',
    genre: 'Strategy',
    players: '6.9K',
    rating: 4.6,
    color: '#8b5cf6',
    icon: Shield,
    desc: 'Tower defense with real-time multiplayer raids',
    xpReward: '450 XP/hr',
    hot: false
  },
];

const GamingHub = () => {
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [search, setSearch] = React.useState('');

  const filtered = games.filter(g => {
    const matchCat = activeCategory === 'All' || g.genre === activeCategory;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Gamepad2 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-cyan)' }} />Gaming Hub</h1>
        <p>Discover games, earn XP, and climb the leaderboard</p>
      </div>

      {/* Search & Filter */}
      <div className="gaming-toolbar">
        <div className="gaming-search glass-panel">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="gaming-chips">
          {categories.map(c => (
            <button
              key={c}
              className={`chip ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <section className="gaming-featured glass-panel">
        <div className="gaming-featured__bg" />
        <div className="gaming-featured__content">
          <span className="badge badge-amber">🔥 Featured</span>
          <h2 className="gaming-featured__title">Legends Arena — Season 5</h2>
          <p className="gaming-featured__desc">New characters, maps, and a 10,000 XP grand prize tournament. Join now!</p>
          <div className="gaming-featured__meta">
            <span><Users size={14} /> 15.8K playing</span>
            <span><Star size={14} /> 4.9 Rating</span>
            <span><TrendingUp size={14} /> #1 Trending</span>
          </div>
          <button className="btn-primary" style={{ marginTop: 16 }}>Play Now</button>
        </div>
      </section>

      {/* Game Grid */}
      <div className="section-title" style={{ marginTop: 28 }}>
        <h2>All Games</h2>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{filtered.length} games</span>
      </div>
      <div className="gaming-grid">
        {filtered.map((game, i) => (
          <div key={i} className="game-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="game-card__cover" style={{ background: `linear-gradient(135deg, ${game.color}15, ${game.color}05)` }}>
              <game.icon size={40} style={{ color: game.color, opacity: 0.7 }} />
              {game.hot && <span className="badge badge-pink game-card__hot">HOT</span>}
            </div>
            <div className="game-card__info">
              <h3 className="game-card__title">{game.title}</h3>
              <p className="game-card__desc">{game.desc}</p>
              <div className="game-card__meta">
                <span className="game-card__genre badge badge-violet">{game.genre}</span>
                <span className="game-card__players"><Users size={12} /> {game.players}</span>
              </div>
              <div className="game-card__footer">
                <div className="game-card__rating">
                  <Star size={13} style={{ color: '#ffaa00', fill: '#ffaa00' }} />
                  <span>{game.rating}</span>
                </div>
                <span className="game-card__xp">{game.xpReward}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamingHub;
