import L from 'leaflet';

/**
 * Creates a custom DivIcon for a party marker.
 * @param {boolean} isHost - true if this party belongs to the current user
 * @param {boolean} isSelected - true if this marker is currently selected
 */
export const createPartyIcon = (isHost = false, isSelected = false) => {
  const accent = isHost ? '#00e5c8' : '#ff3d6b';
  const glow = isHost ? 'rgba(0,229,200,0.5)' : 'rgba(255,61,107,0.5)';
  const size = isSelected ? 52 : 42;
  const emoji = isHost ? '👑' : '🎉';

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${accent};
      border-radius: 50% 50% 50% 4px;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 ${isSelected ? 24 : 14}px ${glow},
                  0 4px 12px rgba(0,0,0,0.4);
      border: 2px solid rgba(255,255,255,0.25);
      transition: all 0.18s ease;
      cursor: pointer;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: ${isSelected ? 22 : 18}px;
        line-height: 1;
        display: block;
      ">${emoji}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
  });
};

/**
 * Creates a pulsing "you are here" icon for the user's location.
 */
export const createUserIcon = () => {
  const html = `
    <div style="position: relative; width: 20px; height: 20px;">
      <div style="
        position: absolute; inset: 0;
        background: #4d9fff;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(77,159,255,0.6);
        z-index: 2;
      "></div>
      <div style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 40px; height: 40px;
        background: rgba(77,159,255,0.25);
        border-radius: 50%;
        animation: pulse-ring 1.8s ease-out infinite;
      "></div>
      <style>
        @keyframes pulse-ring {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(2);   opacity: 0; }
        }
      </style>
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};