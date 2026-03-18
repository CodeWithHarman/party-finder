import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Full-screen spinner while auth loads
const AuthLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px', height: '48px',
        border: '3px solid var(--bg-raised)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
        margin: '0 auto 16px',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading…</p>
    </div>
  </div>
);

/**
 * ProtectedRoute - redirects to / if the user is not logged in.
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

/**
 * PublicRoute - redirects to /dashboard if already logged in.
 * Used for the landing/login page.
 */
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};