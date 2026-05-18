import React from 'react';
import { Gamepad2, ExternalLink, Star, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import './GamingHub.css';

const tabs = [
  { id: 'free', label: 'Free Games', icon: Gamepad2 },
  { id: 'deals', label: 'Steam Deals', icon: DollarSign },
  { id: 'news', label: 'Game News', icon: TrendingUp },
];

const freeSources = [
  { name: 'Steam Free to Play', url: 'https://store.steampowered.com/genre/Free%20to%20Play', icon: '🎮', desc: 'Thousands of free games on Steam' },
  { name: 'Epic Games Free', url: 'https://store.epicgames.com/en-US/free-games', icon: '🔄', desc: 'New free game every week' },
  { name: 'Prime Gaming', url: 'https://gaming.amazon.com/home', icon: '📦', desc: 'Free games with Prime membership' },
  { name: 'GOG Free Games', url: 'https://www.gog.com/en/games?price=0', icon: '🟠', desc: 'DRM-free freebies' },
  { name: 'itch.io Free', url: 'https://itch.io/games/free', icon: '🎨', desc: 'Indie games, many free' },
  { name: 'r/FreeGameFindings', url: 'https://www.reddit.com/r/FreeGameFindings/', icon: '📢', desc: 'Community-tracked free games & giveaways' },
];

const GamingHub = () => {
  const [activeTab, setActiveTab] = React.useState('free');
  const [deals, setDeals] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchDeals = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=12&onSale=1');
      if (res.ok) {
        const data = await res.json();
        setDeals(Array.isArray(data) ? data : []);
      }
    } catch {
      setError('Failed to load Steam deals. Try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { if (activeTab === 'deals') fetchDeals(); }, [activeTab, fetchDeals]);

  const fmt$ = (p) => p ? `$${parseFloat(p).toFixed(2)}` : 'Free';
  const pct = (s) => s ? `-${Math.round(parseFloat(s))}%` : '';

  const renderFreeGames = () => (
    <>
      <section className="gaming-featured glass-panel" style={{ marginBottom: 24 }}>
        <div className="gaming-featured__bg" style={{ background: 'linear-gradient(135deg, #00ff8815, #00f2ff15)' }} />
        <div className="gaming-featured__content">
          <span className="badge badge-emerald">Auto-updated sources</span>
          <h2 className="gaming-featured__title">Find Free Games</h2>
          <p className="gaming-featured__desc">
            Game APIs don't support live fetching from browsers, so we've curated the best sources for you. 
            Click any source below to see the latest free games directly.
          </p>
        </div>
      </section>
      <div className="section-title">
        <h2>Free Game Sources</h2>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Updated automatically by each platform</span>
      </div>
      <div className="gaming-grid">
        {freeSources.map((src, i) => (
          <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer" className="game-card glass-card" style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
            <div className="game-card__cover" style={{ background: `linear-gradient(135deg, hsl(${i * 60}, 50%, 25%), hsl(${i * 60 + 30}, 50%, 15%))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 40 }}>{src.icon}</span>
            </div>
            <div className="game-card__info">
              <h3 className="game-card__title">{src.name}</h3>
              <p className="game-card__desc" style={{ fontSize: 12, lineHeight: 1.4 }}>{src.desc}</p>
              <div className="game-card__footer" style={{ marginTop: 12, border: 'none', paddingTop: 0 }}>
                <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  Browse Free Games <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );

  const renderDeals = () => (
    <>
      {deals.length > 0 && (
        <section className="gaming-featured glass-panel" style={{ marginBottom: 24 }}>
          <div className="gaming-featured__bg" style={{ background: 'linear-gradient(135deg, #ff2d9515, #7000ff15)' }} />
          <div className="gaming-featured__content">
            <span className="badge badge-pink">Best Deal</span>
            <h2 className="gaming-featured__title">{deals[0].title}</h2>
            <p className="gaming-featured__desc">Steam sale — save big on this title!</p>
            <div className="gaming-featured__meta" style={{ gap: 16 }}>
              <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{fmt$(deals[0].normalPrice)}</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: 20 }}>{fmt$(deals[0].salePrice)}</span>
              <span className="badge badge-pink">{pct(deals[0].savings)}</span>
            </div>
            <a href={`https://www.cheapshark.com/redirect?dealID=${deals[0].dealID}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              View Deal <ExternalLink size={16} />
            </a>
          </div>
        </section>
      )}
      <div className="section-title">
        <h2>Steam Deals</h2>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{deals.length} deals today</span>
      </div>
      {deals.length > 0 ? (
        <div className="gaming-grid">
          {deals.map((deal, i) => (
            <a key={deal.dealID} href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`} target="_blank" rel="noopener noreferrer" className="game-card glass-card" style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
              <div className="game-card__cover" style={{ background: `linear-gradient(135deg, hsl(${i * 60}, 50%, 30%), hsl(${i * 60 + 30}, 50%, 20%))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={40} style={{ opacity: 0.3 }} />
                <span className="badge badge-pink game-card__hot" style={{ position: 'absolute', top: 8, right: 8 }}>{pct(deal.savings)}</span>
              </div>
              <div className="game-card__info">
                <h3 className="game-card__title" style={{ fontSize: 15 }}>{deal.title}</h3>
                <div className="game-card__meta" style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{fmt$(deal.normalPrice)}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-emerald)', marginLeft: 8 }}>{fmt$(deal.salePrice)}</span>
                </div>
                <div className="game-card__footer" style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Star size={12} /> Metacritic: {deal.metacriticScore || 'N/A'}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-tertiary)' }}>No Steam deals right now. Try refreshing.</p>
        </div>
      )}
    </>
  );

  const renderNews = () => (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <TrendingUp size={48} style={{ opacity: 0.2, marginBottom: 16, color: 'var(--accent-cyan)' }} />
      <h3 style={{ marginBottom: 8 }}>Game News Coming Soon</h3>
      <p style={{ color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
        We're integrating live RSS feeds from IGN, PCGamer, and Steam News. Check back soon!
      </p>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['IGN', 'PC Gamer', 'Kotaku', 'Steam'].map(s => (
          <a key={s} href={`https://www.google.com/search?q=${encodeURIComponent(s + ' game news')}`} target="_blank" rel="noopener noreferrer" className="chip" style={{ cursor: 'pointer' }}>
            <ExternalLink size={14} /> {s}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Gamepad2 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-cyan)' }} />Gaming Hub</h1>
        <p>Live game deals, free games, and industry news — updated daily</p>
      </div>

      <div className="gaming-toolbar" style={{ marginBottom: 24 }}>
        <div className="gaming-chips" style={{ gap: 8 }}>
          {tabs.map(t => (
            <button key={t.id} className={`chip ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
          {activeTab === 'deals' && (
            <button className="chip" style={{ marginLeft: 'auto' }} onClick={fetchDeals} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div className="felia-typing" style={{ display: 'inline-flex', gap: 6, marginBottom: 12 }}>
            <span className="felia-typing__dot" /><span className="felia-typing__dot" /><span className="felia-typing__dot" />
          </div>
          <p>Loading game data from Steam & FreeToGame...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--accent-pink)', marginBottom: 12 }}>{error}</p>
          <button className="btn-primary" onClick={fetchDeals}>Try Again</button>
        </div>
      )}

      {!loading && !error && activeTab === 'free' && renderFreeGames()}
      {!loading && !error && activeTab === 'deals' && renderDeals()}
      {!loading && !error && activeTab === 'news' && renderNews()}
    </div>
  );
};

export default GamingHub;
