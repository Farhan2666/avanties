import React from 'react';
import { useUser } from '../../context/UserContext';
import Avatar from '../../components/Avatar/Avatar';
import {
  Users, MessageSquare, Heart, Share2, Pin, TrendingUp,
  Award, Crown, Shield, Star, ChevronRight, ImagePlus, X, Trash2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Community.css';

const trendingTopics = [
  { tag: '#AventiesLaunch', posts: 1240 },
  { tag: '#FeliaAI', posts: 856 },
  { tag: '#RankedMatch', posts: 642 },
  { tag: '#GamingHub', posts: 431 },
];

const topClans = [
  { rank: 1, name: 'Cyber Knights', members: 1240, color: '#00f2ff' },
  { rank: 2, name: 'Neon Samurai', members: 986, color: '#7000ff' },
  { rank: 3, name: 'Void Walkers', members: 845, color: '#ff2d95' },
];

const getRankColor = (rank) => {
  switch(rank?.toLowerCase()) {
    case 'owner': return '#ff2d95';
    case 'admin': return '#7000ff';
    case 'pro': return '#00f2ff';
    case 'elite': return '#00ff88';
    default: return '#9ca3af';
  }
};

const getRankIcon = (rank) => {
  switch(rank?.toLowerCase()) {
    case 'owner': return '👑';
    case 'admin': return '🛡️';
    case 'pro': return '⭐';
    case 'elite': return '🔥';
    default: return '🔰';
  }
};

const Community = () => {
  const {
    user, posts: userPosts, addPost, toggleLike, commentPost,
    fetchPostComments, postsLoading, commentsLoadingId,
    deletePost, reportPost, restorePost
  } = useUser();
  const [postContent, setPostContent] = React.useState('');
  const [postImage, setPostImage] = React.useState(null);
  const [postImagePreview, setPostImagePreview] = React.useState(null);
  const [expandedComments, setExpandedComments] = React.useState(new Set());
  const [newCommentInput, setNewCommentInput] = React.useState({});
  const [commentSending, setCommentSending] = React.useState({});

  const handlePost = () => {
    if (postContent.trim()) {
      addPost(postContent.trim(), postImage);
      setPostContent('');
      setPostImage(null);
      setPostImagePreview(null);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPostImage(ev.target.result);
      setPostImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setPostImagePreview(null);
  };

  const handleLike = (postId) => {
    if (!postId) return;
    toggleLike(postId);
  };

  const handleCommentToggle = (postId) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else {
        next.add(postId);
        fetchPostComments(postId);
      }
      return next;
    });
  };

  const submitComment = async (postId) => {
    const commentText = newCommentInput[postId];
    if (!commentText || !commentText.trim() || commentSending[postId]) return;

    setCommentSending((prev) => ({ ...prev, [postId]: true }));
    const result = await commentPost(postId, commentText.trim());
    setCommentSending((prev) => ({ ...prev, [postId]: false }));

    if (result?.ok) {
      setNewCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setExpandedComments((prev) => new Set(prev).add(postId));
    } else {
      alert(result?.message || 'Gagal menyimpan komentar.');
    }
  };

  const isAdminOrOwner = user?.rank?.toLowerCase().includes('admin') || user?.rank?.toLowerCase().includes('owner');

  const allPosts = userPosts.filter(p => {
    if (isAdminOrOwner) return true;
    return !p.is_hidden;
  });

  const sharePost = (postId) => {
    const url = `${window.location.origin}/community`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link komunitas disalin ke clipboard!');
    }).catch(err => console.error(err));
  };

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
            <div className="compose-box__input-wrapper">
              <input
                type="text"
                className="compose-box__input"
                placeholder="Share something with the community..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              />
              {postImagePreview && (
                <div className="compose-box__image-preview">
                  <img src={postImagePreview} alt="Preview" />
                  <button className="compose-box__remove-image" onClick={handleRemoveImage}><X size={14} /></button>
                </div>
              )}
              <div className="compose-box__toolbar">
                <button
                  type="button"
                  className="compose-box__image-btn"
                  title="Add image"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = handleImageSelect;
                    input.click();
                  }}
                >
                  <ImagePlus size={18} />
                </button>
              </div>
            </div>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={handlePost}>Post</button>
          </div>

          {postsLoading && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`skel-${i}`}
                  className="post-card glass-panel post-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="post-skeleton__line post-skeleton__line--short"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <motion.div
                    className="post-skeleton__line"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.div
                    className="post-skeleton__line post-skeleton__line--medium"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  />
                </motion.div>
              ))}
            </>
          )}

          {!postsLoading && allPosts.length === 0 && (
            <motion.div
              className="glass-panel"
              style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p style={{ margin: 0, fontSize: 15 }}>Belum ada postingan di feed.</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-tertiary)' }}>
                Jadilah yang pertama share sesuatu ke komunitas!
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {!postsLoading && allPosts.map((post, i) => (
              <motion.article 
                key={post.id || i} 
                className="post-card glass-panel"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.15) }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
              >
              {post.pinned && (
                <div className="post-card__pinned">
                  <Pin size={12} /> Pinned Post
                </div>
              )}
              {post.is_hidden && isAdminOrOwner && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 'bold' }}>
                    🚨 Disembunyikan oleh sistem (Laporan: {post.reports_count})
                  </span>
                  <button className="btn-primary" style={{ background: '#ef4444', fontSize: 12, padding: '6px 12px' }} onClick={() => restorePost(post.id)}>
                    Pulihkan Postingan
                  </button>
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
              {post.imageUrl && (
                <div className="post-card__image">
                  <img src={post.imageUrl} alt="Post image" />
                </div>
              )}
              <div className="post-card__actions">
                <button 
                  className={`post-action${post.likedByMe ? ' post-action--liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                  title={post.likedByMe ? 'Unlike' : 'Like'}
                  aria-pressed={post.likedByMe}
                >
                  <Heart size={16} fill={post.likedByMe ? 'currentColor' : 'none'} /> <span>{post.likes}</span>
                </button>
                <button 
                  className="post-action"
                  onClick={() => handleCommentToggle(post.id)}
                  style={expandedComments.has(post.id) ? { color: 'var(--accent-violet)' } : {}}
                >
                  <MessageSquare size={16} /> <span>{post.comments}</span>
                </button>
                <button className="post-action" onClick={() => sharePost(post.id)}>
                  <Share2 size={16} /> <span>{post.shares}</span>
                </button>
                
                {(isAdminOrOwner || post.isOwn) && (
                  <button className="post-action" style={{ color: '#ef4444' }} onClick={() => { if(window.confirm('Yakin ingin menghapus postingan ini?')) deletePost(post.id); }} title="Hapus Postingan">
                    <Trash2 size={16} />
                  </button>
                )}

                {!(post.rank?.toLowerCase() === 'admin' || post.rank?.toLowerCase() === 'owner') && !post.isOwn && (
                  <button className="post-action" style={{ color: '#eab308' }} onClick={() => { if(window.confirm('Laporkan postingan ini karena melanggar aturan?')) reportPost(post.id); }} title="Laporkan Postingan">
                    <AlertTriangle size={16} />
                  </button>
                )}
              </div>

              {/* Reddit-style Comment Section */}
              {expandedComments.has(post.id) && (
                <div className="post-comments-section" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  {/* List Comments from Database */}
                  <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {commentsLoadingId === Number(post.id) && (
                      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', margin: '8px 0' }}>
                        Memuat komentar...
                      </p>
                    )}
                    {(post.realComments || []).map(comment => (
                      <div key={comment.id} className="comment-item" style={{ display: 'flex', gap: '10px' }}>
                        <Avatar src={comment.avatar} name={comment.author} size={28} />
                        <div className="comment-content" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{comment.author}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{comment.time}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    {commentsLoadingId !== Number(post.id) && (!post.realComments || post.realComments.length === 0) && (
                      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', margin: '10px 0' }}>
                        Belum ada komentar. Jadilah yang pertama!
                      </p>
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="comment-input-area" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Avatar src={user.avatar} name={user.displayName} size={32} />
                    <div style={{ flex: 1, display: 'flex', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '4px 4px 4px 16px' }}>
                      <input 
                        type="text" 
                        placeholder="Tulis balasan..." 
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '13px', outline: 'none' }}
                        value={newCommentInput[post.id] || ''}
                        onChange={(e) => setNewCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                      />
                      <button 
                        className="btn-primary" 
                        style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '16px' }}
                        onClick={() => submitComment(post.id)}
                        disabled={commentSending[post.id]}
                      >
                        {commentSending[post.id] ? '...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.article>
          ))}
          </AnimatePresence>
        </div>

        {/* Sidebar Widgets */}
        <aside className="community-sidebar">
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i} 
              className="community-widget glass-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
            >
              <h3 className="community-widget__title">
                {i === 0 ? <TrendingUp size={16} /> : i === 1 ? <Shield size={16} /> : <Users size={16} />} 
                {i === 0 ? ' Trending' : i === 1 ? ' Top Clans' : ' Online Now'}
              </h3>
              {i === 0 ? (
                <div className="trending-list">
                  {trendingTopics.map((t, j) => (
                    <div key={j} className="trending-item">
                      <span className="trending-item__tag">{t.tag}</span>
                      <span className="trending-item__count">{t.posts} posts</span>
                    </div>
                  ))}
                </div>
              ) : i === 1 ? (
                <>
                  <div className="clan-list">
                    {topClans.map((clan, j) => (
                      <div key={j} className="clan-item">
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
                </>
              ) : (
                <div className="online-avatars">
                  {['#00f2ff','#7000ff','#ff2d95','#00ff88','#ffaa00','#8b5cf6','#f43f5e','#06b6d4'].map((c, j) => (
                    <div key={j} className="online-avatar" style={{ background: c, zIndex: 10 - j }} />
                  ))}
                  <span className="online-count">+2,340 online</span>
                </div>
              )}
            </motion.div>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default Community;
