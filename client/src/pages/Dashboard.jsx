import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';

const ActionCard = ({ emoji, title, description, tags, accentColor, glowColor, onClick }) => (
  <div
    onClick={onClick}
    style={{
      flex: 1,
      minWidth: '280px',
      maxWidth: '380px',
      padding: '40px 36px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      cursor: 'pointer',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.borderColor = accentColor + '60';
      e.currentTarget.style.boxShadow = `0 16px 48px ${glowColor}`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {/* Glow blob */}
    <div style={{
      position: 'absolute', top: '-60px', right: '-60px',
      width: '180px', height: '180px',
      background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
      borderRadius: '50%', pointerEvents: 'none',
    }} />

    <div style={{ fontSize: '48px', marginBottom: '20px' }}>{emoji}</div>

    <h2 style={{
      fontFamily: 'var(--font-display)',
      fontSize: '26px',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      marginBottom: '12px',
      color: accentColor,
    }}>
      {title}
    </h2>

    <p style={{
      color: 'var(--text-secondary)',
      fontSize: '14px',
      lineHeight: '1.7',
      marginBottom: '24px',
    }}>
      {description}
    </p>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
      {tags.map((tag) => (
        <span key={tag} style={{
          padding: '4px 10px',
          background: accentColor + '15',
          border: `1px solid ${accentColor}25`,
          borderRadius: 'var(--radius-full)',
          fontSize: '11px',
          fontWeight: '600',
          color: accentColor,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>
          {tag}
        </span>
      ))}
    </div>

    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      color: accentColor, fontWeight: '600', fontSize: '14px',
    }}>
      <span>Get started</span>
      <span style={{ fontSize: '18px' }}>→</span>
    </div>
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <AppLayout>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,61,107,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Greeting */}
        <div style={{ textAlign: 'center', marginBottom: '56px', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px', fontWeight: '600',
            color: 'var(--accent)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            <span>✦</span> Welcome back, {firstName}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            lineHeight: '1.1',
            marginBottom: '16px',
          }}>
            What are you<br />
            <span style={{
              color: 'var(--accent)',
              textShadow: '0 0 40px var(--accent-glow)',
            }}>up to tonight?</span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '17px',
            fontWeight: '300',
          }}>
            Find a party nearby or host your own
          </p>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <ActionCard
            emoji="🗺️"
            title="Find a Party"
            description="Browse house parties happening near your campus right now. Filter by distance and vibe."
            tags={['Map view', 'Radius search', 'RSVP']}
            accentColor="var(--teal)"
            glowColor="rgba(0, 229, 200, 0.15)"
            onClick={() => navigate('/find')}
          />
          <ActionCard
            emoji="🎉"
            title="Post a Party"
            description="Hosting something? Drop a pin, add the details, and let people know what's going down."
            tags={['Parking', 'BYOB', 'Guest cap']}
            accentColor="var(--accent)"
            glowColor="rgba(255, 61, 107, 0.15)"
            onClick={() => navigate('/post')}
          />
        </div>
      </div>
    </AppLayout>
  );
};