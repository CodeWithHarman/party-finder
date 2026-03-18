import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostPartyForm } from '../components/party/PostPartyForm';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../components/ui/Toast';

// ✅ Success Banner Component (clean + reusable)
const SuccessBanner = ({ onFindParty, onPostAnother }) => {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          margin: '0 auto 24px',
          boxShadow: 'var(--shadow-accent)',
        }}
      >
        🎉
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          marginBottom: '12px',
        }}
      >
        Party is live!
      </h2>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '15px',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}
      >
        Your party pin has been dropped on the map.
        <br />
        People nearby can find it right now.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={onFindParty}
          style={{
            padding: '12px 24px',
            background: 'var(--teal)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'var(--bg-base)',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          🗺️ See it on the map
        </button>

        <button
          onClick={onPostAnother}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Post another
        </button>
      </div>
    </div>
  );
};

// ✅ Main Page Component
export const PostParty = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [success, setSuccess] = useState(false);

  const handleSuccess = (partyId) => {
    toast('Party posted! Your pin is live on the map 🎉', 'success');
    setSuccess(true);
  };

  return (
    <AppLayout>
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '560px' }}>
          {success ? (
            <SuccessBanner
              onFindParty={() => navigate('/find')}
              onPostAnother={() => setSuccess(false)}
            />
          ) : (
            <>
              {/* Header */}
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  marginBottom: '12px',
                }}
              >
                🎉 Post a Party
              </h1>

              <p style={{ marginBottom: '24px', color: '#666' }}>
                Fill in the details and your party will go live on the map.
              </p>

              {/* Form */}
              <div
                style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #eee',
                }}
              >
                <PostPartyForm onSuccess={handleSuccess} />
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};