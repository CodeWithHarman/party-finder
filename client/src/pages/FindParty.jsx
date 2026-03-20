import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PartyMap } from '../components/map/PartyMap';
import { PartyList } from '../components/party/PartyList';
import { PartyCard } from '../components/party/PartyCard';
import { RadiusSlider } from '../components/ui/RadiusSlider';
import { HamburgerMenu } from '../components/ui/HamburgerMenu';
import { useGeolocation } from '../hooks/useGeolocation';
import { useParties } from '../hooks/useParties';
import { useAuth } from '../hooks/useAuth';

// Better mobile detection
const getIsMobile = () => {
  // Check multiple factors for reliable mobile detection
  if (typeof window === 'undefined') return false;
  
  // Primary check: viewport width
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  return vw < 1024;
};

export const FindParty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location: userCoords, loading: geoLoading, error: geoError } = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(5);
  const { parties, loading: partiesLoading, refetch } = useParties();

  const [selectedParty, setSelectedParty] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('list'); // 'list' or 'detail'
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(getIsMobile());

  // Better mobile detection with ResizeObserver
  useLayoutEffect(() => {
    const checkMobile = () => {
      const mobile = getIsMobile();
      setIsMobile(mobile);
      if (mobile) {
        setMobileMenuOpen(false); // Close menu when switching to mobile
      }
    };

    // Check on mount
    checkMobile();

    // Listen to resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when party is selected
  useEffect(() => {
    if (isMobile && selectedParty) {
      setMobileMenuOpen(false);
    }
  }, [selectedParty, isMobile]);

  const handlePartyClick = (party, distance) => {
    setSelectedParty(party);
    setSelectedDistance(distance);
    setSidebarTab('detail');
  };

  const handleClose = () => {
    setSelectedParty(null);
    setSidebarTab('list');
  };

  const handlePartyDeleted = (partyId) => {
    // Remove the deleted party from the list and close the card
    handleClose();
    refetch(); // Refresh parties list
  };

  // Sidebar content component
  const SidebarContent = () => (
    <>
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
            onClick={refetch}
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
            currentUser={user}
            onPartyDeleted={handlePartyDeleted}
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
    </>
  );

  if (isMobile) {
    // ═══════════════════════════════════════════════════════════════
    // MOBILE LAYOUT: Full-screen map with slide-out sidebar
    // ═══════════════════════════════════════════════════════════════
    return (
      <AppLayout fullHeight>
        {/* Full screen map */}
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
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
                top: '72px',
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
              }}
            >
              🎉 {parties.length} {parties.length === 1 ? 'party' : 'parties'} found
            </div>
          )}

          {/* Hamburger Menu */}
          <HamburgerMenu isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

          {/* Overlay backdrop */}
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9000,
                animation: 'fadeIn 0.3s ease',
              }}
            />
          )}

          {/* Sliding sidebar panel */}
          <aside
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: '320px',
              maxWidth: '85vw',
              background: 'var(--bg-base)',
              zIndex: 9500,
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: mobileMenuOpen ? '4px 0 20px rgba(0, 0, 0, 0.3)' : 'none',
            }}
          >
            <SidebarContent />
          </aside>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      </AppLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT: Side-by-side layout
  // ═══════════════════════════════════════════════════════════════
  return (
    <AppLayout>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100vh',
          padding: '24px',
          gap: '24px',
        }}
      >
        {/* Sidebar */}
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
          <SidebarContent />
        </aside>

        {/* Map */}
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