import React from 'react';

export const AppLayout = ({ children, fullHeight = false }) => {
  return (
    <div style={{
      minHeight: fullHeight ? '100vh' : 'auto',
      height: fullHeight ? '100%' : 'auto',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: fullHeight ? 'hidden' : 'auto',
      margin: 0,
      padding: 0,
      border: 'none',
    }}>
      {children}
    </div>
  );
};
