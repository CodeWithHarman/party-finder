import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';

const provider = new GoogleAuthProvider();

export const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Login successful:', result.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 48px',
        maxWidth: '480px',
        width: '90%',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '28px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Logo */}
        <div style={{
          width: '72px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '42px',
          margin: '0 auto 24px',
        }}>
          🎉
        </div>

        <h1 style={{
          fontSize: '40px',
          fontWeight: '800',
          margin: '0 0 12px 0',
          color: '#000000',
          fontFamily: 'Syne, sans-serif',
        }}>
          Party<span style={{
            background: 'linear-gradient(135deg, #00e5c8, #9b6dff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Finder</span>
        </h1>

        <p style={{
          color: '#666666',
          fontSize: '16px',
          margin: '0 0 40px 0',
          lineHeight: '1.6',
          fontWeight: '300',
        }}>
          Discover house parties near your campus.<br />
          Find your scene, or host your own.
        </p>

        {/* Feature pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '40px',
        }}>
          {['📍 Near your campus', '🗺️ Map view', '🎟️ RSVP instantly', '🚗 Parking info'].map((f) => (
            <span key={f} style={{
              padding: '6px 14px',
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: '9999px',
              fontSize: '12px',
              color: '#666666',
              fontWeight: '500',
            }}>
              {f}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 32px',
              background: 'white',
              color: '#333',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
              minWidth: '220px',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>

        <p style={{
          fontSize: '11px',
          color: '#999999',
          margin: '20px 0 0 0',
        }}>
          University students only · 18+ · Be safe
        </p>
      </div>
    </div>
  );
};