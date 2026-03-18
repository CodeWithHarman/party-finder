import { formatPartyDate } from '../../utils/formatters';
import { haversineDistance, formatDistance } from '../../utils/geoUtils';

const PartyListItem = ({ party, isSelected, onClick, userCoords }) => {
  const dist = userCoords
    ? haversineDistance(userCoords.latitude, userCoords.longitude, party.latitude, party.longitude)
    : null;

  const spotsLeft = party.maxPeople - (party.currentRSVPs || 0);
  const isFull = spotsLeft <= 0;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px',
        background: isSelected ? 'var(--accent-dim)' : 'var(--bg-raised)',
        border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--transition)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--bg-overlay)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--bg-raised)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
    >
      {/* Row 1: host + distance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={party.hostPhoto}
            alt={party.hostName}
            style={{ width: '26px', height: '26px', borderRadius: '50%', border: '2px solid var(--border)' }}
          />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {party.hostName?.split(' ')[0]}'s party
          </span>
        </div>
        {dist != null && (
          <span style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: '600' }}>
            {formatDistance(dist)}
          </span>
        )}
      </div>

      {/* Row 2: address */}
      <div style={{
        fontSize: '12px', color: 'var(--text-secondary)',
        marginBottom: '8px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        📍 {party.address}
      </div>

      {/* Row 3: date + tags */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {formatPartyDate(party.date)}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {party.byob && (
            <span style={{ fontSize: '11px' }}>🍺</span>
          )}
          {party.parking && (
            <span style={{ fontSize: '11px' }}>🚗</span>
          )}
          <span style={{
            fontSize: '11px', fontWeight: '600',
            color: isFull ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {isFull ? 'Full' : `${spotsLeft} spots`}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * PartyList - scrollable sidebar list of nearby parties.
 */
export const PartyList = ({ parties, selectedId, onSelect, userCoords, loading }) => {
  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid var(--bg-raised)',
          borderTop: '3px solid var(--accent)',
          borderRadius: '50%',
          margin: '0 auto 12px',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Finding parties…</p>
      </div>
    );
  }

  if (parties.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
          No parties nearby
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px', lineHeight: '1.6' }}>
          Try increasing the search radius or check back later
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parties.map((party) => (
        <PartyListItem
          key={party.id}
          party={party}
          isSelected={party.id === selectedId}
          onClick={() => onSelect(party)}
          userCoords={userCoords}
        />
      ))}
    </div>
  );
};