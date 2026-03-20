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
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

const PARTIES_COLLECTION = 'parties';

/**
 * Post a new party to Firestore.
 * @param {object} partyData - party fields from the form
 * @param {object} user - the authenticated Firebase user
 */
export const postParty = async (partyData, user) => {
  // Validate coordinates
  if (!partyData.lat || !partyData.lng || isNaN(partyData.lat) || isNaN(partyData.lng)) {
    throw new Error('Invalid coordinates: please geocode the address first');
  }

  const docRef = await addDoc(collection(db, PARTIES_COLLECTION), {
    hostUid: user.uid,
    hostName: user.displayName,
    hostPhoto: user.photoURL,
    address: partyData.address,
    message: partyData.message,
    maxPeople: Number(partyData.maxPeople),
    currentRsvps: 0,
    parking: partyData.parking,
    byob: partyData.byob,
    // Save coordinates as separate fields for compatibility with backend
    lat: Number(partyData.lat),
    lng: Number(partyData.lng),
    // Also save as GeoPoint for spatial queries
    location: new GeoPoint(Number(partyData.lat), Number(partyData.lng)),
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
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    // Use separate lat/lng fields if available (new format), otherwise extract from GeoPoint
    let lat = data.lat;
    let lng = data.lng;
    
    if (!lat || !lng) {
      // Fall back to extracting from GeoPoint
      const location = data.location || {};
      lat = location.latitude !== undefined ? location.latitude : location._lat;
      lng = location.longitude !== undefined ? location.longitude : location._lng;
    }
    
    return {
      id: d.id,
      ...data,
      lat,
      lng,
    };
  });
};

/**
 * Fetch parties hosted by a specific user.
 */
export const fetchUserParties = async (uid) => {
  const q = query(
    collection(db, PARTIES_COLLECTION),
    where('hostUid', '==', uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    // Use separate lat/lng fields if available (new format), otherwise extract from GeoPoint
    let lat = data.lat;
    let lng = data.lng;
    
    if (!lat || !lng) {
      // Fall back to extracting from GeoPoint
      const location = data.location || {};
      lat = location.latitude !== undefined ? location.latitude : location._lng;
      lng = location.longitude !== undefined ? location.longitude : location._lng;
    }
    
    return {
      id: d.id,
      ...data,
      lat,
      lng,
    };
  });
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

/**
 * Auto-deactivate parties whose date has passed.
 * Client-side filtering to avoid needing an index.
 */
export const autoDeactivateExpiredParties = async () => {
  try {
    const now = new Date();
    
    // Query only active parties (simple query, no index needed)
    const activePartiesRef = await getDocs(
      query(
        collection(db, PARTIES_COLLECTION),
        where('active', '==', true)
      )
    );

    // Filter expired ones client-side
    const expiredDocs = activePartiesRef.docs.filter((partyDoc) => {
      const partyDate = partyDoc.data().date?.toDate?.() || new Date(partyDoc.data().date);
      return partyDate < now;
    });

    // Batch update expired parties to inactive
    if (expiredDocs.length > 0) {
      const batch = writeBatch(db);
      expiredDocs.forEach((partyDoc) => {
        batch.update(partyDoc.ref, { active: false });
      });
      await batch.commit();
      console.log(`✓ Auto-deactivated ${expiredDocs.length} expired parties`);
    }
  } catch (err) {
    console.error('Error auto-deactivating expired parties:', err);
  }
};

/**
 * Create a notification when someone RSVPs to a party.
 * Stores notifications for both the RSVP user and the party host.
 */
export const createRsvpNotification = async (party, rsvpUser) => {
  if (!rsvpUser) return;
  
  try {
    const notificationsRef = collection(db, 'notifications');
    const timestamp = serverTimestamp();
    
    // Notification for the party host
    await addDoc(notificationsRef, {
      type: 'rsvp',
      recipientUid: party.hostUid,
      senderUid: rsvpUser.uid,
      senderName: rsvpUser.displayName,
      senderPhoto: rsvpUser.photoURL,
      partyId: party.id,
      partyAddress: party.address,
      read: false,
      createdAt: timestamp,
    });

    // Notification for the RSVP user (confirmation)
    await addDoc(notificationsRef, {
      type: 'rsvp_confirmed',
      recipientUid: rsvpUser.uid,
      partyId: party.id,
      partyAddress: party.address,
      hostName: party.hostName,
      hostPhoto: party.hostPhoto,
      read: false,
      createdAt: timestamp,
    });
  } catch (err) {
    console.error('Error creating RSVP notification:', err);
    // Don't throw - notification failure shouldn't break RSVP
  }
};