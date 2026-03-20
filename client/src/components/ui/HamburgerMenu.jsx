import React from 'react';

export const HamburgerMenu = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 10000,
        width: '44px',
        height: '44px',
        minWidth: '44px',
        minHeight: '44px',
        background: 'rgba(8, 11, 20, 0.9)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(12px)',
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(8, 11, 20, 0.95)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(8, 11, 20, 0.9)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={isOpen ? 'Close menu' : 'Open menu'}
    >
      {/* Hamburger lines */}
      <div
        style={{
          width: '22px',
          height: '2px',
          background: 'currentColor',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg) translateY(8px)' : 'rotate(0)',
        }}
      />
      <div
        style={{
          width: '22px',
          height: '2px',
          background: 'currentColor',
          transition: 'all 0.3s ease',
          opacity: isOpen ? 0 : 1,
        }}
      />
      <div
        style={{
          width: '22px',
          height: '2px',
          background: 'currentColor',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(-45deg) translateY(-8px)' : 'rotate(0)',
        }}
      />
    </button>
  );
};
