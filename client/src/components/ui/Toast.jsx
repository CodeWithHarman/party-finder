import { useState, useEffect, createContext, useContext, useCallback } from 'react';

export const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const icons = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
    warning: '⚠',
  };

  const colors = {
    success: { bg: 'var(--teal-dim)',   border: 'rgba(0,229,200,0.25)',   text: 'var(--teal)'   },
    error:   { bg: 'var(--accent-dim)', border: 'rgba(255,61,107,0.25)',  text: 'var(--accent)' },
    info:    { bg: 'var(--purple-dim)', border: 'rgba(155,109,255,0.25)', text: 'var(--purple)' },
    warning: { bg: 'rgba(255,196,0,0.1)', border: 'rgba(255,196,0,0.25)', text: '#ffc400' },
  };

  const c = colors[toast.type] || colors.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        background: 'var(--bg-surface)',
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        minWidth: '260px',
        maxWidth: '360px',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={() => onRemove(toast.id)}
    >
      {/* Icon */}
      <div style={{
        width: '28px', height: '28px',
        background: c.bg,
        borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: c.text,
        fontSize: '13px', fontWeight: '700',
        flexShrink: 0,
      }}>
        {icons[toast.type]}
      </div>

      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', flex: 1 }}>
        {toast.message}
      </span>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.addToast;
};