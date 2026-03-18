import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { standardLimiter } from './middleware/rateLimiter.js';
import partiesRouter from './routes/parties.js';
import authRouter    from './routes/auth.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

/* ─────────────────────────────────────────────
   Security & parsing middleware
───────────────────────────────────────────── */

// Helmet sets secure HTTP headers
app.use(helmet());

// CORS — only allow the React dev server and production domain
const allowedOrigins = [
  'http://localhost:5173',                   // Vite dev server
  process.env.CLIENT_URL,                    // Production frontend URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true }));

// Apply standard rate limit to all API routes
app.use('/api', standardLimiter);

/* ─────────────────────────────────────────────
   Routes
───────────────────────────────────────────── */
app.use('/api/parties', partiesRouter);
app.use('/api/auth',    authRouter);

/* ─────────────────────────────────────────────
   Health check
───────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ─────────────────────────────────────────────
   404 handler
───────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/* ─────────────────────────────────────────────
   Global error handler
───────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('[Unhandled error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

/* ─────────────────────────────────────────────
   Start
───────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🎉 PartyFinder server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;