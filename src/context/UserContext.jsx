import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

let likesTableReady = null;

const isMissingTableError = (error) =>
  error?.code === 'PGRST205' ||
  error?.code === '42P01' ||
  error?.message?.includes('post_likes');

const checkLikesTable = async () => {
  if (likesTableReady !== null) return likesTableReady;
  const { error } = await supabase.from('post_likes').select('post_id').limit(1);
  likesTableReady = !error;
  return likesTableReady;
};

const normalizePostId = (id) => Number(id);

const formatCommentRow = (c, profileMap = {}) => ({
  id: c.id,
  text: c.content,
  author:
    c.profiles?.display_name ||
    profileMap[c.author_id]?.display_name ||
    'Unknown',
  avatar: c.profiles?.avatar_url || profileMap[c.author_id]?.avatar_url,
  time: new Date(c.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
});

const loadCommentsForPosts = async (postIds) => {
  const ids = [...new Set(postIds.map(normalizePostId).filter(Boolean))];
  if (!ids.length) return {};

  let rows = [];

  const joined = await supabase
    .from('comments')
    .select(
      `id, content, created_at, post_id, author_id, profiles!author_id (display_name, avatar_url)`
    )
    .in('post_id', ids)
    .order('created_at', { ascending: true });

  if (!joined.error && joined.data) {
    rows = joined.data;
  } else {
    const plain = await supabase
      .from('comments')
      .select('id, content, created_at, post_id, author_id')
      .in('post_id', ids)
      .order('created_at', { ascending: true });

    rows = plain.data || [];

    if (rows.length) {
      const authorIds = [...new Set(rows.map((c) => c.author_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', authorIds);

      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
      rows = rows.map((c) => ({ ...c, profiles: profileMap[c.author_id] }));
    }
  }

  const byPost = {};
  for (const c of rows) {
    const pid = normalizePostId(c.post_id);
    if (!byPost[pid]) byPost[pid] = [];
    byPost[pid].push(formatCommentRow(c));
  }
  return byPost;
};

const getLikedPostIds = async (userId, authUser = null) => {
  if (!userId) return new Set();

  if (await checkLikesTable()) {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);
    if (!error && data) return new Set(data.map((l) => normalizePostId(l.post_id)));
  }

  const metaLikes = (authUser?.user_metadata?.liked_posts || []).map(normalizePostId);
  return new Set(metaLikes);
};

const POSTS_PAGE_SIZE = 20;

const defaultUser = {
  display_name: 'New Player',
  displayName: 'New Player', // For UI
  username: 'player',
  bio: '',
  avatar_url: null,
  avatar: null, // For UI
  rank: 'Newbie',
  level: 1,
  xp: 0,
  xp_max: 1000,
  xpMax: 1000, // For UI
  total_xp: 0,
};

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(defaultUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoadingId, setCommentsLoadingId] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchPosts(session.user.id, session.user);
      } else {
        setUser(defaultUser);
        setPosts([]);
        setLoading(false);
        setPostsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      // PGRST116 is "No rows found". If profile doesn't exist, we create it as an ADMIN!
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId, 
            display_name: 'New Player', 
            username: 'player_' + userId.substring(0,6), 
            rank: 'Newbie', 
            level: 1,
            xp: 0,
            xp_max: 1000
          }])
          .select()
          .single();
          
        if (!insertError) {
          data = newProfile;
          error = null;
        } else {
          console.error("Failed to auto-create admin profile:", insertError);
        }
      } else if (error) {
        throw error;
      }
      
      if (data) {
        // Map database fields to the ones components expect
        setUser({
          ...data,
          displayName: data.display_name,
          avatar: data.avatar_url,
          xpMax: data.xp_max,
        });
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (userId = null, authUser = null) => {
    setPostsLoading(true);
    try {
      const [joined, likedPostIds] = await Promise.all([
        supabase
          .from('posts')
          .select(`
            *,
            profiles!author_id (display_name, rank, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(POSTS_PAGE_SIZE),
        userId ? getLikedPostIds(userId, authUser).catch(() => new Set()) : Promise.resolve(new Set()),
      ]);

      let data = joined.data;
      let error = joined.error;

      if (error) {
        const plain = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(POSTS_PAGE_SIZE);
        data = plain.data;
        error = plain.error;

        if (!error && data?.length) {
          const authorIds = [...new Set(data.map((p) => p.author_id).filter(Boolean))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, rank, avatar_url')
            .in('id', authorIds);

          const profileMap = Object.fromEntries((profiles || []).map((pr) => [pr.id, pr]));
          data = data.map((p) => ({ ...p, profiles: profileMap[p.author_id] }));
        }
      }

      if (error) throw error;

      if (data) {
        let localImages = {};
        try { localImages = JSON.parse(localStorage.getItem('postImages') || '{}'); } catch {}

        const formattedPosts = data.map((p) => ({
          id: normalizePostId(p.id),
          author: p.profiles?.display_name || 'Unknown',
          rank: p.profiles?.rank || 'Newbie',
          avatar: p.profiles?.avatar_url,
          time: new Date(p.created_at).toLocaleDateString(),
          content: p.content,
          imageUrl: p.image_url || localImages[p.id] || null,
          likes: p.likes ?? 0,
          comments: p.comments ?? 0,
          shares: p.shares ?? 0,
          pinned: p.pinned,
          isOwn: p.author_id === userId,
          likedByMe: likedPostIds.has(normalizePostId(p.id)),
          is_hidden: p.is_hidden || false,
          reports_count: p.reports_count || 0,
          realComments: [],
          commentsLoaded: false,
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchPostComments = async (postId) => {
    const pid = normalizePostId(postId);
    const existing = posts.find((p) => normalizePostId(p.id) === pid);
    if (existing?.commentsLoaded) return;

    setCommentsLoadingId(pid);
    try {
      const commentsByPost = await loadCommentsForPosts([pid]);
      const comments = commentsByPost[pid] || [];

      setPosts((prev) =>
        prev.map((p) =>
          normalizePostId(p.id) === pid
            ? {
                ...p,
                realComments: comments,
                comments: comments.length || p.comments,
                commentsLoaded: true,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoadingId(null);
    }
  };

  const updateUser = async (updates) => {
    if (!session?.user?.id) return;
    
    // Map camelCase to snake_case for DB
    const dbUpdates = {
      display_name: updates.displayName !== undefined ? updates.displayName : user.display_name,
      bio: updates.bio !== undefined ? updates.bio : user.bio,
      avatar_url: updates.avatar !== undefined ? updates.avatar : user.avatar_url,
      updated_at: new Date(),
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, ...dbUpdates });
        
      if (error) throw error;
      
      // Update local state
      setUser(prev => ({ 
        ...prev, 
        ...updates,
        display_name: dbUpdates.display_name,
        avatar_url: dbUpdates.avatar_url
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addPost = async (content, imageUrl = null) => {
    if (!session?.user?.id) return;

    try {
      const postData = {
        author_id: session.user.id,
        content: content,
        image_url: imageUrl,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      // Store image in localStorage by post ID (DB column may not exist yet)
      if (imageUrl && data?.id) {
        try {
          const stored = JSON.parse(localStorage.getItem('postImages') || '{}');
          stored[data.id] = imageUrl;
          localStorage.setItem('postImages', JSON.stringify(stored));
        } catch (e) { console.warn('Failed to store image locally:', e); }
      }

      const newPost = {
        id: data.id,
        author: user.displayName || user.display_name,
        rank: user.rank,
        avatar: user.avatar || user.avatar_url,
        time: 'Just now',
        content,
        imageUrl: imageUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        pinned: false,
        isOwn: true,
        likedByMe: false,
        is_hidden: false,
        reports_count: 0,
        realComments: [],
        commentsLoaded: true,
      };
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const toggleLike = async (postId) => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const pid = normalizePostId(postId);
    const post = posts.find((p) => normalizePostId(p.id) === pid);
    if (!post) return;

    const wasLiked = post.likedByMe;

    setPosts((prev) =>
      prev.map((p) =>
        normalizePostId(p.id) === pid
          ? {
              ...p,
              likedByMe: !wasLiked,
              likes: Math.max(0, (p.likes ?? 0) + (wasLiked ? -1 : 1)),
            }
          : p
      )
    );

    try {
      if (await checkLikesTable()) {
        if (wasLiked) {
          const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', pid)
            .eq('user_id', userId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('post_likes')
            .insert({ post_id: pid, user_id: userId });
          if (error) throw error;
        }
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const current = authUser?.user_metadata?.liked_posts || [];
        const updated = wasLiked
          ? current.filter((id) => normalizePostId(id) !== pid)
          : [...new Set([...current.map(normalizePostId), pid])];

        const { error: metaError } = await supabase.auth.updateUser({
          data: { liked_posts: updated },
        });
        if (metaError) throw metaError;

        // Fallback robust direct DB update instead of failing RPCs
        const { data: postData } = await supabase
          .from('posts')
          .select('likes')
          .eq('id', pid)
          .single();
        const currentLikes = postData?.likes ?? 0;
        const newLikes = Math.max(0, currentLikes + (wasLiked ? -1 : 1));

        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes: newLikes })
          .eq('id', pid);
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      await fetchPosts(userId);
    }
  };

  const commentPost = async (postId, content) => {
    if (!session?.user?.id || !content?.trim()) {
      return { ok: false, message: 'Login dulu untuk berkomentar.' };
    }

    const pid = normalizePostId(postId);
    const trimmed = content.trim();

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: pid,
          author_id: session.user.id,
          content: trimmed,
        })
        .select('id, content, created_at')
        .single();

      if (error) throw error;

      const formattedComment = {
        id: data.id,
        text: data.content,
        author: user.displayName || user.display_name || 'Unknown',
        avatar: user.avatar || user.avatar_url,
        time: 'Baru saja',
      };

      setPosts((prev) =>
        prev.map((p) => {
          if (normalizePostId(p.id) !== pid) return p;
          const nextComments = [...(p.realComments || []), formattedComment];
          return {
            ...p,
            realComments: nextComments,
            comments: nextComments.length,
            commentsLoaded: true,
          };
        })
      );

      return { ok: true };
    } catch (error) {
      console.error('Error saving comment:', error);
      return {
        ok: false,
        message: error.message || 'Gagal menyimpan komentar. Coba lagi.',
      };
    }
  };

  const deletePost = async (postId) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const reportPost = async (postId) => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    try {
      const [{ data: post }, { count: totalUsers }] = await Promise.all([
        supabase.from('posts').select('reports_count, reported_by').eq('id', postId).single(),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);
      
      if (!post) return;
      const reportedBy = post.reported_by || [];
      if (reportedBy.includes(userId)) {
        alert('Anda sudah melaporkan post ini.');
        return; 
      }
      
      const newReportsCount = (post.reports_count || 0) + 1;
      const newReportedBy = [...reportedBy, userId];
      
      const threshold = Math.max(1, Math.floor((totalUsers || 1) / 2));
      const isHidden = newReportsCount >= threshold;

      const { error } = await supabase.from('posts').update({
        reports_count: newReportsCount,
        reported_by: newReportedBy,
        is_hidden: isHidden
      }).eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p, 
        reports_count: newReportsCount, 
        is_hidden: isHidden 
      } : p));
      
      if (isHidden) {
        alert('Post telah disembunyikan karena jumlah laporan mencapai batas.');
      } else {
        alert('Laporan berhasil dikirim.');
      }
    } catch (err) {
      console.error('Error reporting post:', err);
    }
  };

  const restorePost = async (postId) => {
    try {
      const { error } = await supabase.from('posts').update({
        is_hidden: false,
        reports_count: 0,
        reported_by: []
      }).eq('id', postId);
      
      if (error) throw error;
      
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p, is_hidden: false, reports_count: 0 
      } : p));
    } catch (err) {
      console.error('Error restoring post:', err);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider value={{
      session, user, updateUser, posts, addPost, toggleLike, commentPost,
      fetchPostComments, fetchPosts, logout, loading, postsLoading, commentsLoadingId,
      deletePost, reportPost, restorePost
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
