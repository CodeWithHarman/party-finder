import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { geocodeAddress } from '../../utils/geocoder';
import { createPartyIcon } from '../map/PartyMarker';
import 'leaflet/dist/leaflet.css';

const Recenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
};

/**
 * AddressSearch - text input that geocodes on blur/enter,
 * shows a mini map preview of the resolved location.
 *
 * Props:
 *   value       - current address string
 *   onChange    - called with address string
 *   onGeocode   - called with { lat, lng, displayName } when resolved
 *   error       - validation error string from react-hook-form
 */
export const AddressSearch = ({ value, onChange, onGeocode, error }) => {
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [resolvedName, setResolvedName] = useState('');
  const debounceRef = useRef(null);

  const handleGeocode = async (address) => {
    if (!address || address.trim().length < 5) return;
    setGeocoding(true);
    setGeocodeError('');
    try {
      const result = await geocodeAddress(address);
      setResolvedCoords({ lat: result.lat, lng: result.lng });
      setResolvedName(result.displayName);
      onGeocode({ lat: result.lat, lng: result.lng, displayName: result.displayName });
    } catch (err) {
      setGeocodeError(err.message);
      setResolvedCoords(null);
      onGeocode(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleBlur = () => handleGeocode(value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGeocode(value);
    }
  };

  const fieldError = error || geocodeError;

  return (
    <div>
      {/* Input row */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="123 Queen St W, Toronto, ON"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '13px 44px 13px 16px',
            background: 'var(--bg-raised)',
            border: `1px solid ${fieldError ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            transition: 'border-color var(--transition)',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            if (!fieldError) e.target.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
        />

        {/* Status icon */}
        <div style={{
          position: 'absolute', right: '14px', top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '16px',
        }}>
          {geocoding && <Spinner />}
          {!geocoding && resolvedCoords && !fieldError && (
            <span style={{ color: 'var(--teal)' }}>✓</span>
          )}
          {!geocoding && fieldError && (
            <span style={{ color: 'var(--accent)' }}>✕</span>
          )}
          {!geocoding && !resolvedCoords && !fieldError && (
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>📍</span>
          )}
        </div>
      </div>

      {/* Error */}
      {fieldError && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent)' }}>
          {fieldError}
        </p>
      )}

      {/* Hint */}
      {!fieldError && !resolvedCoords && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Press Enter or click away to verify the address on the map
        </p>
      )}

      {/* Resolved display name */}
      {resolvedName && !fieldError && (
        <p style={{
          marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          📍 {resolvedName}
        </p>
      )}

    
    </div>
  );
};

const Spinner = () => (
  <div style={{
    width: '16px', height: '16px',
    border: '2px solid var(--bg-overlay)',
    borderTop: '2px solid var(--teal)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);