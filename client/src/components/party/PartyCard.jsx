import { useState } from 'react';
import { rsvpToParty } from '../../firebase/firestore';
import { formatPartyDate, timeAgo } from '../../utils/formatters';
import { formatDistance } from '../../utils/geoUtils';

const Tag = ({ children, color = 'accent' }) => {
  const colors = {
    accent: { bg: 'var(--accent-dim)', border: 'rgba(255,61,107,0.2)', text: 'var(--accent)' },
    teal:   { bg: 'var(--teal-dim)',   border: 'rgba(0,229,200,0.2)',   text: 'var(--teal)'   },
    purple: { bg: 'var(--purple-dim)', border: 'rgba(155,109,255,0.2)', text: 'var(--purple)' },
  };
  const c = colors[color] || colors.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px',
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-full)',
      fontSize: '11px', fontWeight: '600',
      color: c.text, letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
};

/**
 * PartyCard - shown in the right sidebar when a party marker is clicked.
 */
export const PartyCard = ({ party, onClose, distanceKm, currentUserUid }) => {
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(party.currentRSVPs || 0);

  const isHost = party.hostUid === currentUserUid;
  const spotsLeft = party.maxPeople - rsvpCount;
  const isFull = spotsLeft <= 0;

  const handleRsvp = async () => {
    if (rsvpDone || isFull || isHost) return;
    setRsvpLoading(true);
    try {
      await rsvpToParty(party.id);
      setRsvpCount((c) => c + 1);
      setRsvpDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
      animation: 'slideUp 0.2s ease',
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header bar */}
      <div style={{
        height: '6px',
        background: isHost
          ? 'linear-gradient(90deg, var(--teal), var(--purple))'
          : 'linear-gradient(90deg, var(--accent), var(--purple))',
      }} />

      <div style={{ padding: '20px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {isHost && <Tag color="teal">👑 Your Party</Tag>}
              {party.byob && <Tag color="purple">🍺 BYOB</Tag>}
              {party.parking && <Tag color="accent">🚗 Parking</Tag>}
              {isFull && <Tag color="accent">🔴 Full</Tag>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={party.hostPhoto}
                alt={party.hostName}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border)' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {party.hostName}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {timeAgo(party.createdAt)}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px',
              background: 'var(--bg-raised)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* Address */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px',
          padding: '12px', marginBottom: '12px',
          background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>📍</span>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
              {party.address}
            </div>
            {distanceKm != null && (
              <div style={{ fontSize: '11px', color: 'var(--teal)', marginTop: '3px' }}>
                {formatDistance(distanceKm)} away
              </div>
            )}
          </div>
        </div>

        {/* Date/time */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '12px',
          fontSize: '13px', color: 'var(--text-secondary)',
        }}>
          <span>🗓️</span>
          <span>{formatPartyDate(party.date)}</span>
        </div>

        {/* Message */}
        {party.message && (
          <div style={{
            padding: '12px',
            background: 'var(--bg-raised)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '16px',
            fontStyle: 'italic',
          }}>
            "{party.message}"
          </div>
        )}

        {/* Capacity bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px',
          }}>
            <span>Guests</span>
            <span style={{ color: isFull ? 'var(--accent)' : 'var(--text-secondary)' }}>
              {rsvpCount} / {party.maxPeople}
            </span>
          </div>
          <div style={{
            height: '4px', background: 'var(--bg-overlay)',
            borderRadius: 'var(--radius-full)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min((rsvpCount / party.maxPeople) * 100, 100)}%`,
              background: isFull
                ? 'var(--accent)'
                : 'linear-gradient(90deg, var(--teal), var(--purple))',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease',
            }} />
          </div>
          {!isFull && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </div>
          )}
        </div>

        {/* RSVP Button */}
        {!isHost && (
          <button
            onClick={handleRsvp}
            disabled={rsvpDone || isFull || rsvpLoading}
            style={{
              width: '100%', padding: '12px',
              background: rsvpDone
                ? 'var(--teal-dim)'
                : isFull
                ? 'var(--bg-overlay)'
                : 'var(--accent)',
              border: rsvpDone ? '1px solid rgba(0,229,200,0.3)' : 'none',
              borderRadius: 'var(--radius-md)',
              color: rsvpDone ? 'var(--teal)' : isFull ? 'var(--text-muted)' : 'white',
              fontFamily: 'var(--font-body)',
              fontWeight: '600', fontSize: '14px',
              cursor: rsvpDone || isFull ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition)',
              boxShadow: (!rsvpDone && !isFull) ? 'var(--shadow-accent)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!rsvpDone && !isFull) e.currentTarget.style.opacity = '0.88';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {rsvpLoading ? 'RSVPing…' : rsvpDone ? '✓ You\'re going!' : isFull ? 'Party is full' : "I'm going 🎉"}
          </button>
        )}
      </div>
    </div>
  );
};