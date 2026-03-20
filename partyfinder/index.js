const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { body, query, param, validationResult } = require('express-validator');
const admin = require('firebase-admin');

// Initialize Firebase Admin (automatically configured when deployed)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const app = express();

/* ─────────────────────────────────────────────
   Security & Middleware
───────────────────────────────────────────── */
app.use(helmet());
app.use(cors({ origin: true })); // Allow all origins (Firebase handles auth)
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────────
   Middleware: Verify Firebase Token
───────────────────────────────────────────── */
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('[Auth Error]', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/* ─────────────────────────────────────────────
   Helper: Validation
───────────────────────────────────────────── */
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Validation failed', details: errors.array() });
    return false;
  }
  return true;
};

/* ═════════════════════════════════════════════
   PARTIES ROUTES
═════════════════════════════════════════════ */

/* GET /api/parties - Get all active parties or parties nearby */
app.get(
  '/api/parties',
  verifyToken,
  [
    query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    query('radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be 0.1–50 km'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const { lat, lng, radius = '2' } = req.query;

      // Get all active parties
      const snapshot = await db
        .collection('parties')
        .where('active', '==', true)
        .get();

      let parties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter by radius if coordinates provided
      if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius);

        parties = parties.filter(party => {
          const partyLat = party.lat || party.latitude;
          const partyLng = party.lng || party.longitude;
          
          if (!partyLat || !partyLng) return false;

          const distance = getDistanceFromLatLng(userLat, userLng, partyLat, partyLng);
          return distance <= radiusKm;
        });
      }

      return res.json({ parties, count: parties.length });
    } catch (err) {
      console.error('[GET /parties]', err.message);
      return res.status(500).json({ error: 'Failed to fetch parties' });
    }
  }
);

/* GET /api/parties/mine - Get user's parties */
app.get('/api/parties/mine', verifyToken, async (req, res) => {
  try {
    const snapshot = await db
      .collection('parties')
      .where('userId', '==', req.user.uid)
      .get();

    const parties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ parties, count: parties.length });
  } catch (err) {
    console.error('[GET /parties/mine]', err.message);
    return res.status(500).json({ error: 'Failed to fetch your parties' });
  }
});

/* POST /api/parties - Create a new party */
app.post(
  '/api/parties',
  verifyToken,
  [
    body('address').isString().trim().isLength({ min: 5 }).withMessage('Address too short'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('maxPeople').isInt({ min: 1, max: 500 }).withMessage('maxPeople must be 1–500'),
    body('parking').isBoolean().withMessage('parking must be boolean'),
    body('byob').isBoolean().withMessage('byob must be boolean'),
    body('message').optional().isString().trim().isLength({ max: 280 }).withMessage('Message too long'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const partyData = {
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        date: req.body.date,
        maxPeople: req.body.maxPeople,
        currentRsvps: 0,
        parking: req.body.parking,
        byob: req.body.byob,
        message: req.body.message || '',
        userId: req.user.uid,
        userName: req.user.name || 'Anonymous',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection('parties').add(partyData);

      return res.status(201).json({
        success: true,
        party: { id: docRef.id, ...partyData },
      });
    } catch (err) {
      console.error('[POST /parties]', err.message);
      return res.status(500).json({ error: 'Failed to create party' });
    }
  }
);

/* POST /api/parties/:id/rsvp - RSVP to a party */
app.post(
  '/api/parties/:id/rsvp',
  verifyToken,
  [param('id').isString().notEmpty()],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const partyId = req.params.id;
      const partyRef = db.collection('parties').doc(partyId);
      const partyDoc = await partyRef.get();

      if (!partyDoc.exists) {
        return res.status(404).json({ error: 'Party not found' });
      }

      const party = partyDoc.data();

      if (party.currentRsvps >= party.maxPeople) {
        return res.status(409).json({ error: 'Party is full' });
      }

      await partyRef.update({
        currentRsvps: admin.firestore.FieldValue.increment(1),
      });

      return res.json({
        success: true,
        currentRsvps: party.currentRsvps + 1,
      });
    } catch (err) {
      console.error('[POST /parties/:id/rsvp]', err.message);
      return res.status(500).json({ error: 'RSVP failed' });
    }
  }
);

/* DELETE /api/parties/:id - Delete a party (host only) */
app.delete(
  '/api/parties/:id',
  verifyToken,
  [param('id').isString().notEmpty()],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const partyId = req.params.id;
      const partyRef = db.collection('parties').doc(partyId);
      const partyDoc = await partyRef.get();

      if (!partyDoc.exists) {
        return res.status(404).json({ error: 'Party not found' });
      }

      const party = partyDoc.data();

      // Check if user is the owner
      if (party.userId !== req.user.uid) {
        return res.status(403).json({ error: 'Not your party' });
      }

      // Soft delete
      await partyRef.update({ active: false });

      return res.json({ success: true });
    } catch (err) {
      console.error('[DELETE /parties/:id]', err.message);
      return res.status(500).json({ error: 'Failed to deactivate party' });
    }
  }
);

/* ═════════════════════════════════════════════
   AUTH ROUTES
═════════════════════════════════════════════ */

/* GET /api/auth/me - Get user profile */
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({ uid: req.user.uid, ...doc.data() });
  } catch (err) {
    console.error('[GET /auth/me]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* PATCH /api/auth/me - Update user profile */
app.patch('/api/auth/me', verifyToken, async (req, res) => {
  const { university } = req.body;

  if (typeof university !== 'string' || university.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid university value' });
  }

  try {
    await db
      .collection('users')
      .doc(req.user.uid)
      .set({ university: university.trim() }, { merge: true });

    return res.json({ success: true, university: university.trim() });
  } catch (err) {
    console.error('[PATCH /auth/me]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ═════════════════════════════════════════════
   Health Check (for monitoring)
═════════════════════════════════════════════ */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ═════════════════════════════════════════════
   Export Cloud Function
═════════════════════════════════════════════ */
exports.api = functions.https.onRequest(app);

/* ═════════════════════════════════════════════
   Helper Function: Calculate distance between coordinates
═════════════════════════════════════════════ */
function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
