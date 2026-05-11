import React from 'react';
import { useUser } from '../../context/UserContext';
import Avatar from '../../components/Avatar/Avatar';
import {
  Settings as SettingsIcon, User, Shield, Bell, Palette,
  Monitor, Moon, Globe, Key, Link, Volume2, Eye, Upload
} from 'lucide-react';
import './Settings.css';

const ToggleSwitch = ({ checked, onChange }) => (
  <div className={`toggle-switch ${checked ? 'toggle-switch--on' : ''}`} onClick={() => onChange(!checked)}>
    <div className="toggle-switch__knob" />
  </div>
);

const SettingRow = ({ icon: Icon, label, desc, children }) => (
  <div className="setting-row">
    <div className="setting-row__left">
      <div className="setting-row__icon"><Icon size={18} /></div>
      <div className="setting-row__info">
        <span className="setting-row__label">{label}</span>
        {desc && <span className="setting-row__desc">{desc}</span>}
      </div>
    </div>
    <div className="setting-row__right">{children}</div>
  </div>
);

const Settings = () => {
  const { user, updateUser } = useUser();
  const [notifications, setNotifications] = React.useState(true);
  const [sound, setSound] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [publicProfile, setPublicProfile] = React.useState(true);
  const [twoFactor, setTwoFactor] = React.useState(false);

  const tabs = ['Profile', 'Appearance', 'Notifications', 'Privacy', 'Connections'];
  const [activeTab, setActiveTab] = React.useState('Profile');

  // Profile Form State
  const [displayName, setDisplayName] = React.useState(user.displayName);
  const [bio, setBio] = React.useState(user.bio);
  const [avatarPreview, setAvatarPreview] = React.useState(user.avatar);
  const fileInputRef = React.useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateUser({
      displayName,
      bio,
      avatar: avatarPreview
    });
    // Could add a toast notification here
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><SettingsIcon size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12, color: 'var(--text-secondary)' }} />Settings</h1>
        <p>Manage your account, preferences, and integrations</p>
      </div>

      <div className="settings-layout">
        {/* Tabs */}
        <nav className="settings-tabs">
          {tabs.map(t => (
            <button
              key={t}
              className={`settings-tab ${activeTab === t ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >{t}</button>
          ))}
        </nav>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'Profile' && (
            <section className="settings-section animate-fade-in">
              <h2 className="settings-section__title">Profile Settings</h2>
              <div className="settings-profile-card glass-panel">
                <div className="settings-profile-avatar">
                  <Avatar src={avatarPreview} name={displayName} size={80} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleAvatarChange} 
                  />
                  <button className="settings-profile-avatar__edit" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    Change Avatar
                  </button>
                </div>
                <div className="settings-profile-fields">
                  <div className="settings-field">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="settings-input" 
                    />
                  </div>
                  <div className="settings-field">
                    <label>Username</label>
                    <input type="text" value={user.username} className="settings-input" disabled />
                  </div>
                  <div className="settings-field">
                    <label>Bio</label>
                    <textarea 
                      className="settings-textarea" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleSaveProfile}>Save Changes</button>
            </section>
          )}

          {activeTab === 'Appearance' && (
            <section className="settings-section animate-fade-in">
              <h2 className="settings-section__title">Appearance</h2>
              <div className="settings-group glass-panel">
                <SettingRow icon={Moon} label="Dark Mode" desc="Use dark theme across the platform">
                  <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
                </SettingRow>
                <SettingRow icon={Palette} label="Accent Color" desc="Choose your accent color">
                  <div className="color-swatches">
                    {['#00f2ff', '#7000ff', '#ff2d95', '#00ff88', '#ffaa00'].map(c => (
                      <div key={c} className="color-swatch" style={{ background: c }} />
                    ))}
                  </div>
                </SettingRow>
                <SettingRow icon={Monitor} label="Compact Mode" desc="Reduce spacing in the UI">
                  <ToggleSwitch checked={false} onChange={() => {}} />
                </SettingRow>
              </div>
            </section>
          )}

          {activeTab === 'Notifications' && (
            <section className="settings-section animate-fade-in">
              <h2 className="settings-section__title">Notifications</h2>
              <div className="settings-group glass-panel">
                <SettingRow icon={Bell} label="Push Notifications" desc="Receive alerts for quests and events">
                  <ToggleSwitch checked={notifications} onChange={setNotifications} />
                </SettingRow>
                <SettingRow icon={Volume2} label="Sound Effects" desc="Play sounds for XP and achievements">
                  <ToggleSwitch checked={sound} onChange={setSound} />
                </SettingRow>
                <SettingRow icon={Globe} label="Community Updates" desc="Get notified for community posts">
                  <ToggleSwitch checked={true} onChange={() => {}} />
                </SettingRow>
              </div>
            </section>
          )}

          {activeTab === 'Privacy' && (
            <section className="settings-section animate-fade-in">
              <h2 className="settings-section__title">Privacy & Security</h2>
              <div className="settings-group glass-panel">
                <SettingRow icon={Eye} label="Public Profile" desc="Allow others to see your profile and stats">
                  <ToggleSwitch checked={publicProfile} onChange={setPublicProfile} />
                </SettingRow>
                <SettingRow icon={Key} label="Two-Factor Authentication" desc="Add an extra layer of security">
                  <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} />
                </SettingRow>
                <SettingRow icon={Shield} label="Data & Privacy" desc="Download or delete your data">
                  <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Manage</button>
                </SettingRow>
              </div>
            </section>
          )}

          {activeTab === 'Connections' && (
            <section className="settings-section animate-fade-in">
              <h2 className="settings-section__title">Connections</h2>
              <div className="settings-group glass-panel">
                <SettingRow icon={Link} label="Discord" desc="Link your Discord account">
                  <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Connect</button>
                </SettingRow>
                <SettingRow icon={Link} label="Steam" desc="Sync your Steam game library">
                  <span className="badge badge-emerald">Connected</span>
                </SettingRow>
                <SettingRow icon={Link} label="Twitch" desc="Stream integration">
                  <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Connect</button>
                </SettingRow>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
