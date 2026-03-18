import { auth } from '../firebase/config';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get the current user's Firebase ID token.
 * Automatically refreshes if expired.
 */
const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
};

/**
 * Core fetch wrapper.
 * Attaches Authorization header, handles JSON parsing and error responses.
 */
const apiFetch = async (path, options = {}) => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
};

/* ─────────────────────────────────────────────
   Parties
───────────────────────────────────────────── */

/**
 * Fetch parties near given coordinates within radiusKm.
 */
export const apiGetParties = (lat, lng, radiusKm = 2) =>
  apiFetch(`/api/parties?lat=${lat}&lng=${lng}&radius=${radiusKm}`);

/**
 * Fetch parties posted by the current user.
 */
export const apiGetMyParties = () =>
  apiFetch('/api/parties/mine');

/**
 * Post a new party.
 * @param {object} partyData - form data including lat/lng from geocoder
 */
export const apiPostParty = (partyData) =>
  apiFetch('/api/parties', {
    method: 'POST',
    body:   JSON.stringify(partyData),
  });

/**
 * RSVP to a party by ID.
 */
export const apiRsvpParty = (partyId) =>
  apiFetch(`/api/parties/${partyId}/rsvp`, { method: 'POST' });

/**
 * Deactivate (soft-delete) one of the current user's parties.
 */
export const apiDeleteParty = (partyId) =>
  apiFetch(`/api/parties/${partyId}`, { method: 'DELETE' });

/* ─────────────────────────────────────────────
   Auth / Profile
───────────────────────────────────────────── */

/**
 * Get the current user's profile from Firestore (via backend).
 */
export const apiGetMe = () =>
  apiFetch('/api/auth/me');

/**
 * Update the current user's university name.
 */
export const apiUpdateUniversity = (university) =>
  apiFetch('/api/auth/me', {
    method: 'PATCH',
    body:   JSON.stringify({ university }),
  });