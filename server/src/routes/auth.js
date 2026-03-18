import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { adminDb } from '../firebase/adminConfig.js';

const router = Router();

/**
 * GET /api/auth/me
 * Returns the authenticated user's Firestore profile.
 * Useful for the client to hydrate university info etc.
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const doc = await adminDb.collection('users').doc(req.user.uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({ uid: req.user.uid, ...doc.data() });
  } catch (err) {
    console.error('[GET /auth/me]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/auth/me
 * Update the user's university field (can be extended for other profile fields).
 */
router.patch('/me', verifyToken, async (req, res) => {
  const { university } = req.body;

  if (typeof university !== 'string' || university.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid university value' });
  }

  try {
    await adminDb
      .collection('users')
      .doc(req.user.uid)
      .set({ university: university.trim() }, { merge: true });

    return res.json({ success: true, university: university.trim() });
  } catch (err) {
    console.error('[PATCH /auth/me]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;