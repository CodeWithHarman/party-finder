import React from 'react';

export const AppLayout = ({ children, fullHeight = false }) => {
  return (
    <div style={{
      minHeight: fullHeight ? '100vh' : 'auto',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
    }}>
      {children}
    </div>
  );
};
