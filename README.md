# 🎉 PartyFinder

Discover house parties near your university campus. Built with React, Node.js, Firebase, and Leaflet.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite                   |
| Styling    | CSS Variables (dark neon theme)   |
| Maps       | Leaflet + OpenStreetMap (free)    |
| Geocoding  | Nominatim / OSM (free, no key)    |
| Auth       | Firebase Google Auth              |
| Database   | Firestore                         |
| Backend    | Node.js + Express                 |
| Validation | Zod (client) + express-validator  |

---

## Project Structure

```
party-finder/
├── client/          # React frontend (Vite)
└── server/          # Node.js + Express backend
```

---

## Setup

### 1. Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → New Project
2. Enable **Authentication** → Google sign-in provider
3. Enable **Firestore Database** → Start in production mode
4. Add a **Web App** → copy the config values
5. Go to **Project Settings → Service Accounts** → Generate new private key → download JSON

### 2. Firestore Indexes

Deploy the required indexes (needed for compound queries):

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:indexes
```

Or create them manually in the Firebase Console as the app prompts you.

### 3. Client Setup

```bash
cd client
npm install
cp .env.example .env      # fill in your Firebase config values
npm run dev               # starts on http://localhost:5173
```

### 4. Server Setup

```bash
cd server
npm install
cp .env.example .env      # fill in your Firebase Admin credentials
```

**Option A — Service account file (local dev, easiest):**
```bash
# Place your downloaded JSON at:
server/service-account.json
# Then in server/.env set:
USE_SERVICE_ACCOUNT_FILE=true
```

**Option B — Environment variables (production):**
```bash
# In server/.env, paste values from your service account JSON:
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=...
```

```bash
npm run dev   # starts on http://localhost:3001
```

---

## API Endpoints

All endpoints require `Authorization: Bearer <firebase-id-token>`.

| Method   | Endpoint                   | Description                        |
|----------|----------------------------|------------------------------------|
| GET      | /api/parties               | Fetch parties (pass ?lat=&lng=&radius=) |
| GET      | /api/parties/mine          | Fetch current user's parties       |
| POST     | /api/parties               | Create a party                     |
| POST     | /api/parties/:id/rsvp      | RSVP to a party                    |
| DELETE   | /api/parties/:id           | Deactivate a party (host only)     |
| GET      | /api/auth/me               | Get current user profile           |
| PATCH    | /api/auth/me               | Update university name             |
| GET      | /health                    | Server health check                |

---

## Firestore Data Model

```
/parties/{partyId}
  hostUid, hostName, hostPhoto
  address, message
  location: GeoPoint(lat, lng)
  date: Timestamp
  maxPeople, currentRSVPs
  parking, byob
  active, createdAt

/users/{uid}
  displayName, email, photoURL
  university, partiesHosted, createdAt
```

---

## Development Notes

- The map uses **CartoDB dark tiles** — no API key needed
- Geocoding uses **Nominatim (OpenStreetMap)** — free, max 1 req/sec
- For production geocoding consider [Geoapify](https://www.geoapify.com/) (free tier: 3000 req/day)
- Rate limits: 100 req/15min globally, 10 party posts/hour per IP

---

## Deployment

**Frontend** → [Vercel](https://vercel.com) (drag in the `/client` folder, set `VITE_API_BASE_URL` to your backend URL)

**Backend** → [Railway](https://railway.app) or [Render](https://render.com) (connect `/server`, set env vars, use `npm start`)