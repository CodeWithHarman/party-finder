import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PartyMap } from '../components/map/PartyMap';
import { PartyList } from '../components/party/PartyList';
import { PartyCard } from '../components/party/PartyCard';
import { RadiusSlider } from '../components/ui/RadiusSlider';
import { useGeolocation } from '../hooks/useGeolocation';
import { useParties } from '../hooks/useParties';
import { useAuth } from '../hooks/useAuth';

export const FindParty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coords: userCoords, loading: geoLoading, error: geoError } = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(5);
  const { parties, loading: partiesLoading, refresh } = useParties(userCoords, radiusKm);

  const [selectedParty, setSelectedParty] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('list'); // 'list' or 'detail'
  const [selectedDistance, setSelectedDistance] = useState(null);

  const handlePartyClick = (party, distance) => {
    setSelectedParty(party);
    setSelectedDistance(distance);
    setSidebarTab('detail');
  };

  const handleClose = () => {
    setSelectedParty(null);
    setSidebarTab('list');
  };

  return (
    <AppLayout>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          padding: '24px',
          gap: '24px',
        }}
      >
        {/* ── Sidebar ────────────────────────────── */}
        <aside
          style={{
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-base)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                }}
              >
                Find a Party
              </h2>
              <button
                onClick={refresh}
                title="Refresh"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                ↻
              </button>
            </div>

            {/* Party count badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {partiesLoading ? (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Searching…</span>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{
                    fontWeight: '700',
                    color: parties.length > 0 ? 'var(--teal)' : 'var(--text-muted)',
                  }}>
                    {parties.length}
                  </span>{' '}
                  part{parties.length !== 1 ? 'ies' : 'y'} within{' '}
                  <span style={{ fontWeight: '600' }}>{radiusKm}km</span>
                </span>
              )}

              {geoError && (
                <span style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  padding: '2px 8px',
                  background: 'var(--accent-dim)',
                  borderRadius: 'var(--radius-full)',
                }}>
                  📍 Location unavailable
                </span>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Radius Slider */}
            <RadiusSlider value={radiusKm} onChange={setRadiusKm} />

            {/* Party detail or list */}
            {sidebarTab === 'detail' && selectedParty ? (
              <PartyCard
                party={selectedParty}
                onClose={handleClose}
                distanceKm={selectedDistance}
                currentUserUid={user?.uid}
              />
            ) : (
              <PartyList
                parties={parties}
                selectedId={selectedParty?.id}
                onSelect={handlePartyClick}
                userCoords={userCoords}
                loading={partiesLoading}
              />
            )}
          </div>
        </aside>

        {/* ── Map ────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
          {geoLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 999,
                background: 'rgba(8, 11, 20, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid var(--bg-raised)',
                  borderTop: '3px solid var(--teal)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Getting your location…</p>
            </div>
          )}

          <PartyMap
            userCoords={userCoords}
            parties={parties}
            selectedParty={selectedParty}
            onPartyClick={handlePartyClick}
            radiusKm={radiusKm}
            currentUserUid={user?.uid}
          />

          {!partiesLoading && parties.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 800,
                padding: '8px 20px',
                background: 'rgba(8, 11, 20, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-md)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              🎉 {parties.length} {parties.length === 1 ? 'party' : 'parties'} in your area
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};