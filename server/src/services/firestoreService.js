import { adminDb } from '../firebase/adminConfig.js';
import { FieldValue, GeoPoint, Timestamp } from 'firebase-admin/firestore';
import { getBoundingBox, haversineDistance } from './geoService.js';

const PARTIES = 'parties';
const USERS   = 'users';

/* ─────────────────────────────────────────────
   PARTIES
───────────────────────────────────────────── */

/**
 * Create a new party document.
 * Called from POST /api/parties
 */
export const createParty = async (data, user) => {
  const ref = adminDb.collection(PARTIES).doc();

  const party = {
    hostUid:      user.uid,
    hostName:     user.name    || 'Anonymous',
    hostPhoto:    user.picture || '',
    address:      data.address,
    message:      data.message || '',
    maxPeople:    Number(data.maxPeople),
    currentRSVPs: 0,
    parking:      Boolean(data.parking),
    byob:         Boolean(data.byob),
    location:     new GeoPoint(Number(data.lat), Number(data.lng)),
    date:         Timestamp.fromDate(new Date(data.date)),
    active:       true,
    createdAt:    FieldValue.serverTimestamp(),
  };

  await ref.set(party);

  // Increment user's hosted party count
  await adminDb.collection(USERS).doc(user.uid).set(
    { partiesHosted: FieldValue.increment(1) },
    { merge: true }
  );

  return { id: ref.id, ...party };
};

/**
 * Fetch active parties within a bounding box, then filter precisely by radius.
 *
 * Firestore limitation: we can only use one inequality field per query,
 * so we filter on lat server-side and apply lng + distance in memory.
 */
export const getPartiesNearby = async ({ lat, lng, radiusKm = 2 }) => {
  const { minLat, maxLat } = getBoundingBox(lat, lng, radiusKm);

  const snapshot = await adminDb
    .collection(PARTIES)
    .where('active', '==', true)
    .where('location', '>=', new GeoPoint(minLat, -180))
    .where('location', '<=', new GeoPoint(maxLat,  180))
    .orderBy('location')
    .get();

  const parties = snapshot.docs.map((doc) => ({
    id:  doc.id,
    ...doc.data(),
    lat: doc.data().location.latitude,
    lng: doc.data().location.longitude,
  }));

  // Precise in-memory filter
  return parties.filter(
    (p) => haversineDistance(lat, lng, p.lat, p.lng) <= radiusKm
  );
};

/**
 * Fetch all active parties (no radius filtering - for admin/testing use).
 */
export const getAllActiveParties = async () => {
  const snapshot = await adminDb
    .collection(PARTIES)
    .where('active', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id:  doc.id,
    ...doc.data(),
    lat: doc.data().location.latitude,
    lng: doc.data().location.longitude,
  }));
};

/**
 * Fetch parties posted by a specific user.
 */
export const getUserParties = async (uid) => {
  const snapshot = await adminDb
    .collection(PARTIES)
    .where('hostUid', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id:  doc.id,
    ...doc.data(),
    lat: doc.data().location.latitude,
    lng: doc.data().location.longitude,
  }));
};

/**
 * Increment the RSVP count for a party, respecting maxPeople cap.
 */
export const rsvpParty = async (partyId, uid) => {
  const ref = adminDb.collection(PARTIES).doc(partyId);

  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error('Party not found');

    const { currentRSVPs, maxPeople, active } = doc.data();
    if (!active)               throw new Error('Party is no longer active');
    if (currentRSVPs >= maxPeople) throw new Error('Party is full');

    tx.update(ref, { currentRSVPs: FieldValue.increment(1) });
    return { spotsLeft: maxPeople - currentRSVPs - 1 };
  });
};

/**
 * Soft-delete (deactivate) a party. Only the host may do this.
 */
export const deactivateParty = async (partyId, uid) => {
  const ref  = adminDb.collection(PARTIES).doc(partyId);
  const doc  = await ref.get();

  if (!doc.exists)               throw new Error('Party not found');
  if (doc.data().hostUid !== uid) throw new Error('Forbidden');

  await ref.update({ active: false });
};