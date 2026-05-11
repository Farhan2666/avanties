import React from 'react';

const defaultUser = {
  displayName: 'Commander',
  username: '@commander_elite',
  bio: 'Elite Guardian on Avanties. Gaming is life. 🎮',
  avatar: null, // null = use gradient fallback
  rank: 'Elite Guardian',
  level: 24,
  xp: 12450,
  xpMax: 15000,
  totalXp: 124500,
};

const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = React.useState(() => {
    try {
      const saved = localStorage.getItem('avanties_user');
      return saved ? { ...defaultUser, ...JSON.parse(saved) } : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const [posts, setPosts] = React.useState(() => {
    try {
      const saved = localStorage.getItem('avanties_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist user data
  React.useEffect(() => {
    localStorage.setItem('avanties_user', JSON.stringify(user));
  }, [user]);

  // Persist posts
  React.useEffect(() => {
    localStorage.setItem('avanties_posts', JSON.stringify(posts));
  }, [posts]);

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const addPost = (content) => {
    const newPost = {
      id: Date.now(),
      author: user.displayName,
      rank: user.rank,
      avatar: user.avatar,
      time: 'Just now',
      content,
      likes: 0,
      comments: 0,
      shares: 0,
      pinned: false,
      isOwn: true,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, posts, addPost, likePost }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

export default UserContext;
