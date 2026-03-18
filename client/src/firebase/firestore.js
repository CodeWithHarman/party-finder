import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';

export const postParty = async (partyData) => {
  try {
    const docRef = await addDoc(collection(db, 'parties'), {
      ...partyData,
      createdAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error posting party:', error);
    throw error;
  }
};
