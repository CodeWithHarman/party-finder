import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  GeoPoint,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';

const PARTIES_COLLECTION = 'parties';

/**
 * Post a new party to Firestore.
 * @param {object} partyData - party fields from the form
 * @param {object} user - the authenticated Firebase user
 */
export const postParty = async (partyData, user) => {
  const docRef = await addDoc(collection(db, PARTIES_COLLECTION), {
    hostUid: user.uid,
    hostName: user.displayName,
    hostPhoto: user.photoURL,
    address: partyData.address,
    message: partyData.message,
    maxPeople: Number(partyData.maxPeople),
    currentRSVPs: 0,
    parking: partyData.parking,
    byob: partyData.byob,
    location: new GeoPoint(partyData.lat, partyData.lng),
    date: partyData.date,
    active: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Fetch all active parties.
 * Client-side distance filtering is applied in useParties hook.
 */
export const fetchActiveParties = async () => {
  const q = query(
    collection(db, PARTIES_COLLECTION),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    // Normalise GeoPoint to plain object for easy use
    lat: d.data().location.latitude,
    lng: d.data().location.longitude,
  }));
};

/**
 * Fetch parties hosted by a specific user.
 */
export const fetchUserParties = async (uid) => {
  const q = query(
    collection(db, PARTIES_COLLECTION),
    where('hostUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    lat: d.data().location.latitude,
    lng: d.data().location.longitude,
  }));
};

/**
 * Increment RSVP count for a party.
 */
export const rsvpToParty = async (partyId) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  const snapshot = await getDoc(partyRef);
  if (!snapshot.exists()) throw new Error('Party not found');
  const current = snapshot.data().currentRSVPs || 0;
  await updateDoc(partyRef, { currentRSVPs: current + 1 });
};

/**
 * Deactivate (soft-delete) a party — only the host should call this.
 */
export const deactivateParty = async (partyId) => {
  const partyRef = doc(db, PARTIES_COLLECTION, partyId);
  await updateDoc(partyRef, { active: false });
};

/**
 * Hard delete a party document (admin use / testing).
 */
export const deleteParty = async (partyId) => {
  await deleteDoc(doc(db, PARTIES_COLLECTION, partyId));
};