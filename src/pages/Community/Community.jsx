import React from 'react';
import { useUser } from '../../context/UserContext';
import Avatar from '../../components/Avatar/Avatar';
import {
  Users, MessageSquare, Heart, Share2, Pin, TrendingUp,
  Award, Crown, Shield, Star, ChevronRight
} from 'lucide-react';
import './Community.css';

const trendingTopics = [
  { tag: '#SeasonFinale', posts: '2.4K' },
  { tag: '#NewUpdate', posts: '1.8K' },
  { tag: '#ProTips', posts: '956' },
  { tag: '#ClanWars', posts: '734' },
];

const posts = [
  {
    author: 'NightHawk',
    rank: 'Diamond',
    avatar: '#ff2d95',
    time: '2h ago',
    content: 'Just hit Diamond rank in Legends Arena! The new combo system is insane 🔥 Anyone else loving the Season 5 update?',
    likes: 234,
    comments: 45,
    shares: 12,
    pinned: false,
  },
  {
    author: 'PixelQueen',
    rank: 'Platinum',
    avatar: '#7000ff',
    time: '4h ago',
    content: 'Looking for clan members for the upcoming Clan Wars tournament. Must be Level 20+ and active daily. DM me or reply here! 🏆',
    likes: 156,
    comments: 67,
    shares: 23,
    pinned: true,
  },
  {
    author: 'ShadowByte',
    rank: 'Gold',
    avatar: '#00f2ff',
    time: '6h ago',
    content: 'Pro tip: In Shadow Realm, you can double your XP by completing the hidden dungeon quests before the daily reset. Thank me later 😎',
    likes: 498,
    comments: 89,
    shares: 156,
    pinned: false,
  },
  {
    author: 'CyberWolf',
    rank: 'Master',
    avatar: '#00ff88',
    time: '8h ago',
    content: 'The Avanties community is honestly the best gaming community I\'ve ever been part of. Shoutout to the mod team for keeping things clean! 💚',
    likes: 312,
    comments: 34,
    shares: 8,
    pinned: false,
  },
];

const topClans = [
  { name: 'Cyber Knights', members: 156, rank: 1, color: '#ffaa00' },
  { name: 'Shadow Legion', members: 132, rank: 2, color: '#c0c0c0' },
  { name: 'Neon Wolves', members: 98, rank: 3, color: '#cd7f32' },
];

const getRankIcon = (rank) => {
  switch(rank) {
    case 'Master': return <Crown size={12} />;
    case 'Diamond': return <Award size={12} />;
    case 'Platinum': return <Shield size={12} />;
    default: return <Star size={12} />;
  }
};

const getRankColor = (rank) => {
  switch(rank) {
    case 'Master': return '#ff2d95';
    case 'Diamond': return '#00f2ff';
    case 'Platinum': return '#a855f7';
    default: return '#ffaa00';
  }
};

const Community = () => {
  const { user, posts: userPosts, addPost, likePost, commentPost } = useUser();
  const [postContent, setPostContent] = React.useState('');

  const handlePost = () => {
    if (postContent.trim()) {
      addPost(postContent.trim());
      setPostContent('');
    }
  };

  const handleComment = (postId) => {
    const comment = window.prompt("Tulis komentar kamu untuk postingan ini:");
    if (comment && comment.trim() !== "") {
      commentPost(postId);
      alert("Komentar berhasil dikirim!");
    }
  };

  const allPosts = [...userPosts, ...posts];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Users size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-violet)' }} />Community</h1>
        <p>Connect, share, and grow with fellow gamers</p>
      </div>

      <div className="community-layout">
        {/* Main Feed */}
        <div className="community-feed">
          {/* Compose */}
          <div className="compose-box glass-panel">
            <Avatar src={user.avatar} name={user.displayName} size={40} className="compose-box__avatar-wrapper" />
            <input
              type="text"
              className="compose-box__input"
              placeholder="Share something with the community..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePost()}
            />
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={handlePost}>Post</button>
          </div>

          {/* Posts */}
          {allPosts.map((post, i) => (
            <article key={post.id || i} className="post-card glass-panel" style={{ animationDelay: `${i * 0.08}s` }}>
              {post.pinned && (
                <div className="post-card__pinned">
                  <Pin size={12} /> Pinned Post
                </div>
              )}
              <div className="post-card__header">
                {post.isOwn ? (
                  <Avatar src={post.avatar} name={post.author} size={40} />
                ) : (
                  <div className="post-card__avatar" style={{ background: post.avatar }} />
                )}
                <div className="post-card__author-info">
                  <div className="post-card__author-row">
                    <span className="post-card__name">{post.author}</span>
                    <span className="post-card__rank" style={{ color: getRankColor(post.rank), background: `${getRankColor(post.rank)}15` }}>
                      {getRankIcon(post.rank)} {post.rank}
                    </span>
                  </div>
                  <span className="post-card__time">{post.time}</span>
                </div>
              </div>
              <p className="post-card__content">{post.content}</p>
              <div className="post-card__actions">
                <button 
                  className="post-action" 
                  onClick={() => likePost(post.id)}
                  style={post.likes > 0 ? { color: 'var(--accent-pink)' } : {}}
                >
                  <Heart size={16} /> <span>{post.likes}</span>
                </button>
                <button 
                  className="post-action"
                  onClick={() => handleComment(post.id)}
                >
                  <MessageSquare size={16} /> <span>{post.comments}</span>
                </button>
                <button className="post-action"><Share2 size={16} /> <span>{post.shares}</span></button>
              </div>
            </article>
          ))}
        </div>

        {/* Sidebar Widgets */}
        <aside className="community-sidebar">
          {/* Trending */}
          <div className="community-widget glass-panel">
            <h3 className="community-widget__title"><TrendingUp size={16} /> Trending</h3>
            <div className="trending-list">
              {trendingTopics.map((t, i) => (
                <div key={i} className="trending-item">
                  <span className="trending-item__tag">{t.tag}</span>
                  <span className="trending-item__count">{t.posts} posts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clans */}
          <div className="community-widget glass-panel">
            <h3 className="community-widget__title"><Shield size={16} /> Top Clans</h3>
            <div className="clan-list">
              {topClans.map((clan, i) => (
                <div key={i} className="clan-item">
                  <div className="clan-item__rank" style={{ color: clan.color }}>#{clan.rank}</div>
                  <div className="clan-item__info">
                    <span className="clan-item__name">{clan.name}</span>
                    <span className="clan-item__members">{clan.members} members</span>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center', fontSize: 12 }}>
              View All Clans
            </button>
          </div>

          {/* Online Members */}
          <div className="community-widget glass-panel">
            <h3 className="community-widget__title"><Users size={16} /> Online Now</h3>
            <div className="online-avatars">
              {['#00f2ff','#7000ff','#ff2d95','#00ff88','#ffaa00','#8b5cf6','#f43f5e','#06b6d4'].map((c, i) => (
                <div key={i} className="online-avatar" style={{ background: c, zIndex: 10 - i }} />
              ))}
              <span className="online-count">+2,340 online</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Community;
