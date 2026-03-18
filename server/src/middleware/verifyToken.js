import { adminAuth } from '../firebase/adminConfig.js';

/**
 * verifyToken middleware
 *
 * Expects:  Authorization: Bearer <firebase-id-token>
 * Attaches: req.user = { uid, email, name, picture }
 *
 * Responds 401 if the token is missing, expired, or invalid.
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorised',
      message: 'Missing or malformed Authorization header.',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    req.user = {
      uid:     decoded.uid,
      email:   decoded.email,
      name:    decoded.name,
      picture: decoded.picture,
    };
    next();
  } catch (err) {
    console.error('[verifyToken] Invalid token:', err.code, err.message);

    const status = err.code === 'auth/id-token-expired' ? 401 : 403;
    return res.status(status).json({
      error:   status === 401 ? 'Token expired'   : 'Forbidden',
      message: status === 401 ? 'Please re-login.' : 'Invalid token.',
    });
  }
};