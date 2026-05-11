import React from 'react';
import {
  Send, Sparkles, Bot, User, Lightbulb, Gamepad2,
  Target, TrendingUp, RefreshCw
} from 'lucide-react';
import './FeliaAI.css';

const initialMessages = [
  {
    role: 'felia',
    content: "Hey Commander! 💜 I'm Felia, your AI companion on Avanties. I can help you with quests, game recommendations, strategy tips, or just chat. What's on your mind?",
    time: '14:30',
  },
];

const quickPrompts = [
  { icon: Target, label: 'Daily quest tips' },
  { icon: Gamepad2, label: 'Recommend a game' },
  { icon: TrendingUp, label: 'How to rank up fast' },
  { icon: Lightbulb, label: 'Pro strategies' },
];

const feliaReplies = [
  "Great question! Based on your play style, I'd recommend focusing on the Shadow Realm daily dungeons. They give 500 XP per run, and you can do 3 per day. That's 1,500 XP guaranteed! 🎯",
  "Looking at your stats, you're really close to Diamond rank! You need about 2,000 more XP. I'd suggest completing the 'Ancient Trials' quest chain — it rewards 3,500 XP total and unlocks a rare title! ✨",
  "For your current level, Legends Arena PvP matches give the best XP-to-time ratio. Pro tip: queue during off-peak hours (early morning) for faster matchmaking and easier opponents. 😎",
  "I noticed you haven't tried Mystic Forge yet! It's perfect for your exploration-heavy playstyle. Plus, there's a limited event running that gives double XP this week. Don't miss it! 🔥",
];

const FeliaAI = () => {
  const [messages, setMessages] = React.useState(initialMessages);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatRef = React.useRef(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = feliaReplies[Math.floor(Math.random() * feliaReplies.length)];
      setMessages(prev => [...prev, {
        role: 'felia',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="felia-page">
      {/* Chat Area */}
      <div className="felia-chat-area">
        {/* Header */}
        <div className="felia-chat-header">
          <div className="felia-chat-header__left">
            <div className="felia-avatar-sm">
              <div className="felia-avatar-sm__inner" />
              <div className="felia-avatar-sm__status" />
            </div>
            <div>
              <h2 className="felia-chat-header__name">Felia AI</h2>
              <span className="felia-chat-header__status">Online — Your personal AI companion</span>
            </div>
          </div>
          <button className="btn-ghost" style={{ padding: '8px 14px' }}>
            <RefreshCw size={14} /> New Chat
          </button>
        </div>

        {/* Messages */}
        <div className="felia-messages" ref={chatRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`felia-msg felia-msg--${msg.role}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="felia-msg__avatar">
                {msg.role === 'felia' ? (
                  <div className="felia-msg__avatar-bot"><Bot size={18} /></div>
                ) : (
                  <div className="felia-msg__avatar-user"><User size={18} /></div>
                )}
              </div>
              <div className="felia-msg__bubble">
                <p className="felia-msg__text">{msg.content}</p>
                <span className="felia-msg__time">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="felia-msg felia-msg--felia">
              <div className="felia-msg__avatar">
                <div className="felia-msg__avatar-bot"><Bot size={18} /></div>
              </div>
              <div className="felia-msg__bubble felia-typing">
                <span className="felia-typing__dot" />
                <span className="felia-typing__dot" />
                <span className="felia-typing__dot" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="felia-quick-prompts">
            {quickPrompts.map((p, i) => (
              <button key={i} className="felia-quick-btn glass-panel" onClick={() => sendMessage(p.label)}>
                <p.icon size={16} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="felia-input-bar">
          <div className="felia-input-wrapper glass-panel">
            <Sparkles size={18} style={{ color: 'var(--accent-violet)', minWidth: 18 }} />
            <input
              type="text"
              placeholder="Ask Felia anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="felia-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Felia Info Sidebar */}
      <aside className="felia-info-sidebar">
        <div className="felia-info-card">
          <div className="felia-orb-large">
            <div className="felia-orb-large__core" />
            <div className="felia-orb-large__ring" />
          </div>
          <h3 className="felia-info-card__name">Felia AI</h3>
          <p className="felia-info-card__tagline">Your Personal Gaming Companion</p>
          <div className="felia-info-card__stats">
            <div className="felia-stat">
              <span className="felia-stat__value">1,247</span>
              <span className="felia-stat__label">Chats</span>
            </div>
            <div className="felia-stat">
              <span className="felia-stat__value">98%</span>
              <span className="felia-stat__label">Accuracy</span>
            </div>
            <div className="felia-stat">
              <span className="felia-stat__value">24/7</span>
              <span className="felia-stat__label">Available</span>
            </div>
          </div>
        </div>

        <div className="felia-capabilities glass-panel">
          <h4>What I can do</h4>
          <ul>
            <li><Target size={14} /> Quest & XP guidance</li>
            <li><Gamepad2 size={14} /> Game recommendations</li>
            <li><TrendingUp size={14} /> Strategy coaching</li>
            <li><Lightbulb size={14} /> Tips & pro tricks</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default FeliaAI;
