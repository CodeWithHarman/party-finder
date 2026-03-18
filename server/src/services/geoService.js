/**
 * Server-side geo utilities.
 *
 * Firestore doesn't support native geo-radius queries natively without
 * GeoFirestore. Instead, we use a lat/lng bounding-box to pre-filter
 * documents (cheap), then apply precise Haversine filtering in memory.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Haversine distance in km between two coordinates.
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Returns a lat/lng bounding box for a given centre + radius.
 * Used to limit how many Firestore documents we pull before filtering.
 *
 * @param {number} lat      - centre latitude
 * @param {number} lng      - centre longitude
 * @param {number} radiusKm - search radius in km
 * @returns {{ minLat, maxLat, minLng, maxLng }}
 */
export const getBoundingBox = (lat, lng, radiusKm) => {
  const latDelta = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos(toRad(lat));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
};

/**
 * Filters an array of party objects to those within radiusKm of centre.
 * Each party must have { lat, lng } numeric fields.
 */
export const filterByRadius = (parties, centreLat, centreLng, radiusKm) =>
  parties.filter((p) => haversineDistance(centreLat, centreLng, p.lat, p.lng) <= radiusKm);