import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/verifyToken.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import {
  createParty,
  getPartiesNearby,
  getAllActiveParties,
  getUserParties,
  rsvpParty,
  deactivateParty,
} from '../services/firestoreService.js';

const router = Router();

/**
 * Helper - returns 422 with validation errors if any exist.
 */
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Validation failed', details: errors.array() });
    return false;
  }
  return true;
};

/* ─────────────────────────────────────────────
   GET /api/parties
   Query params: lat, lng, radius (km, default 2)
   Returns parties within radius of the given coordinates.
───────────────────────────────────────────── */
router.get(
  '/',
  verifyToken,
  [
    query('lat').optional().isFloat({ min: -90,  max: 90  }).withMessage('Invalid latitude'),
    query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    query('radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be 0.1–50 km'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const { lat, lng, radius = '2' } = req.query;

      // If no coordinates provided, return all active parties (admin-useful)
      if (!lat || !lng) {
        const parties = await getAllActiveParties();
        return res.json({ parties, count: parties.length });
      }

      const parties = await getPartiesNearby({
        lat:      parseFloat(lat),
        lng:      parseFloat(lng),
        radiusKm: parseFloat(radius),
      });

      return res.json({ parties, count: parties.length });
    } catch (err) {
      console.error('[GET /parties]', err.message);
      return res.status(500).json({ error: 'Failed to fetch parties' });
    }
  }
);

/* ─────────────────────────────────────────────
   GET /api/parties/mine
   Returns all parties posted by the authenticated user.
───────────────────────────────────────────── */
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const parties = await getUserParties(req.user.uid);
    return res.json({ parties, count: parties.length });
  } catch (err) {
    console.error('[GET /parties/mine]', err.message);
    return res.status(500).json({ error: 'Failed to fetch your parties' });
  }
});

/* ─────────────────────────────────────────────
   POST /api/parties
   Create a new party. Strict rate limit applied.
───────────────────────────────────────────── */
router.post(
  '/',
  strictLimiter,
  verifyToken,
  [
    body('address')   .isString().trim().isLength({ min: 5 }).withMessage('Address too short'),
    body('lat')       .isFloat({ min: -90,   max: 90   }).withMessage('Invalid latitude'),
    body('lng')       .isFloat({ min: -180,  max: 180  }).withMessage('Invalid longitude'),
    body('date')      .isISO8601().withMessage('Invalid date format'),
    body('maxPeople') .isInt({ min: 1, max: 500 }).withMessage('maxPeople must be 1–500'),
    body('parking')   .isBoolean().withMessage('parking must be boolean'),
    body('byob')      .isBoolean().withMessage('byob must be boolean'),
    body('message')   .optional().isString().trim().isLength({ max: 280 }).withMessage('Message too long'),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const party = await createParty(req.body, req.user);
      return res.status(201).json({ success: true, party });
    } catch (err) {
      console.error('[POST /parties]', err.message);
      return res.status(500).json({ error: 'Failed to create party' });
    }
  }
);

/* ─────────────────────────────────────────────
   POST /api/parties/:id/rsvp
   Increment RSVP count (transactional, respects max cap).
───────────────────────────────────────────── */
router.post(
  '/:id/rsvp',
  verifyToken,
  [param('id').isString().notEmpty()],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const result = await rsvpParty(req.params.id, req.user.uid);
      return res.json({ success: true, ...result });
    } catch (err) {
      console.error('[POST /parties/:id/rsvp]', err.message);

      if (err.message === 'Party is full')   return res.status(409).json({ error: err.message });
      if (err.message === 'Party not found') return res.status(404).json({ error: err.message });
      return res.status(500).json({ error: 'RSVP failed' });
    }
  }
);

/* ─────────────────────────────────────────────
   DELETE /api/parties/:id
   Soft-delete (deactivate) a party. Host only.
───────────────────────────────────────────── */
router.delete(
  '/:id',
  verifyToken,
  [param('id').isString().notEmpty()],
  async (req, res) => {
    if (!validate(req, res)) return;

    try {
      await deactivateParty(req.params.id, req.user.uid);
      return res.json({ success: true });
    } catch (err) {
      console.error('[DELETE /parties/:id]', err.message);

      if (err.message === 'Forbidden')       return res.status(403).json({ error: 'Not your party' });
      if (err.message === 'Party not found') return res.status(404).json({ error: err.message });
      return res.status(500).json({ error: 'Failed to deactivate party' });
    }
  }
);

export default router;