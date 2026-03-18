import rateLimit from 'express-rate-limit';

/**
 * Standard limiter — applied to all API routes.
 * 100 requests per 15 minutes per IP.
 */
export const standardLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    error:   'Too Many Requests',
    message: 'You are being rate limited. Please wait a few minutes.',
  },
});

/**
 * Strict limiter — applied to write operations (POST /parties).
 * 10 new parties per hour per IP — prevents spam posting.
 */
export const strictLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    error:   'Too Many Requests',
    message: 'You can only post 10 parties per hour.',
  },
});