/**
 * Geocodes a human-readable address to { lat, lng } using
 * OpenStreetMap's Nominatim API — completely free, no key required.
 *
 * Rate limit: 1 request/second. For production, host your own Nominatim
 * or use a paid provider.
 *
 * @param {string} address - e.g. "123 Main St, Toronto, ON"
 * @returns {Promise<{ lat: number, lng: number, displayName: string }>}
 */
export const geocodeAddress = async (address) => {
  const encoded = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      // Nominatim requires a descriptive User-Agent
      'User-Agent': 'PartyFinder-App/1.0 (student-party-finder)',
    },
  });

  if (!res.ok) throw new Error('Geocoding request failed');

  const data = await res.json();

  if (!data || data.length === 0) {
    throw new Error('Address not found. Try adding a city or postal code.');
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
};

/**
 * Reverse geocodes { lat, lng } to a human-readable address string.
 */
export const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'PartyFinder-App/1.0 (student-party-finder)' },
  });

  if (!res.ok) throw new Error('Reverse geocoding failed');

  const data = await res.json();
  return data.display_name || '';
};