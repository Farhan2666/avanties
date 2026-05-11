import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

const defaultUser = {
  display_name: 'New Player',
  username: 'player',
  bio: '',
  avatar_url: null,
  rank: 'Newbie',
  level: 1,
  xp: 0,
  xp_max: 1000,
  total_xp: 0,
};

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(defaultUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUser(defaultUser);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found, which is fine initially
      
      if (data) {
        // Map database fields to the ones components expect
        setUser({
          ...data,
          displayName: data.display_name,
          avatar: data.avatar_url,
          xpMax: data.xp_max,
        });
      }
      
      fetchPosts();
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (display_name, rank, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const formattedPosts = data.map(p => ({
          id: p.id,
          author: p.profiles?.display_name || 'Unknown',
          rank: p.profiles?.rank || 'Newbie',
          avatar: p.profiles?.avatar_url,
          time: new Date(p.created_at).toLocaleDateString(),
          content: p.content,
          likes: p.likes,
          comments: p.comments,
          shares: p.shares,
          pinned: p.pinned,
          isOwn: p.author_id === session?.user?.id
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
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

  const addPost = async (content) => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          author_id: session.user.id,
          content: content,
        }])
        .select()
        .single();

      if (error) throw error;

      // Optimistically add to UI
      const newPost = {
        id: data.id,
        author: user.displayName || user.display_name,
        rank: user.rank,
        avatar: user.avatar || user.avatar_url,
        time: 'Just now',
        content,
        likes: 0,
        comments: 0,
        shares: 0,
        pinned: false,
        isOwn: true,
      };
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const likePost = async (postId) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
    
    // Real DB update (simplified logic, usually needs a separate likes table to prevent multiple likes)
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      await supabase
        .from('posts')
        .update({ likes: post.likes + 1 })
        .eq('id', postId);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider value={{ session, user, updateUser, posts, addPost, likePost, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
