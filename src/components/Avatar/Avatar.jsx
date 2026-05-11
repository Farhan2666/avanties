import React from 'react';

const Avatar = ({ src, name, size = 40, style = {}, className = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={className}
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: '50%',
          objectFit: 'cover',
          ...style,
        }}
      />
    );
  }

  // Gradient fallback with initials
  const initials = (name || 'U').charAt(0).toUpperCase();
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00f2ff, #7000ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        fontSize: size * 0.4,
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
