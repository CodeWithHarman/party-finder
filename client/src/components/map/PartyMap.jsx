import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet';
import { createPartyIcon, createUserIcon } from './PartyMarker';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Vite/Webpack bundlers
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * FlyToLocation - helper component that flies the map to a new center.
 */
const FlyToLocation = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

/**
 * PartyMap - renders the Leaflet map with:
 * - User's location marker (pulsing blue dot)
 * - Radius circle overlay
 * - Party markers (red = others, teal = yours)
 * - Click handler to select a party
 */
export const PartyMap = ({
  userCoords,
  parties,
  selectedParty,
  onPartyClick,
  radiusKm,
  currentUserUid,
}) => {
  const defaultCenter = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [43.6532, -79.3832]; // Toronto fallback

  return (
    <MapContainer
      center={defaultCenter}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      attributionControl={false}
    >
      {/* Dark tile layer from CartoDB */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />

      {/* Fly to user location when it loads */}
      {userCoords && (
        <FlyToLocation center={[userCoords.lat, userCoords.lng]} zoom={14} />
      )}

      {/* Fly to selected party */}
      {selectedParty && (
        <FlyToLocation
          center={[selectedParty.lat, selectedParty.lng]}
          zoom={15}
        />
      )}

      {/* User location dot */}
      {userCoords && (
        <Marker
          position={[userCoords.lat, userCoords.lng]}
          icon={createUserIcon()}
          zIndexOffset={1000}
        />
      )}

      {/* Radius circle */}
      {userCoords && (
        <Circle
          center={[userCoords.lat, userCoords.lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: 'rgba(0, 229, 200, 0.6)',
            fillColor: 'rgba(0, 229, 200, 0.06)',
            fillOpacity: 1,
            weight: 1.5,
            dashArray: '6 6',
          }}
        />
      )}

      {/* Party markers */}
      {parties.map((party) => {
        const isHost = party.hostUid === currentUserUid;
        const isSelected = selectedParty?.id === party.id;

        return (
          <Marker
            key={party.id}
            position={[party.lat, party.lng]}
            icon={createPartyIcon(isHost, isSelected)}
            eventHandlers={{
              click: () => onPartyClick(party),
            }}
            zIndexOffset={isSelected ? 500 : 0}
          />
        );
      })}
    </MapContainer>
  );
};