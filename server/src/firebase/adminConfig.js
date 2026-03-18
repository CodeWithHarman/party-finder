import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Initialise Firebase Admin SDK once.
 *
 * Credentials are read from environment variables (recommended for production)
 * OR from a local service-account JSON file for local development.
 *
 * To use a local file, place your downloaded service account JSON at:
 *   server/service-account.json
 * and set USE_SERVICE_ACCOUNT_FILE=true in server/.env
 */

let app;

if (!admin.apps.length) {
  let credential;

  if (process.env.USE_SERVICE_ACCOUNT_FILE === 'true') {
    // Local dev: load JSON file
    const filePath = resolve(__dirname, '../../service-account.json');
    const serviceAccount = JSON.parse(readFileSync(filePath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Production: load from env vars
    credential = admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
    });
  }

  app = admin.initializeApp({ credential });
}

export const adminAuth = admin.auth();
export const adminDb   = admin.firestore();
export default admin;