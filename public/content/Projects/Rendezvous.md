# Rendezvous

A full-stack event discovery and social carpooling platform that helps you find cool things happening locally in your city — concerts, meetups, community events — and coordinate rides with friends to get there together.

Built as a Senior Capstone Project (Startup Track) at NJIT.

---

## What It Does

Rendezvous aggregates local events from multiple sources (Ticketmaster, Google Events), displays them on an interactive map centered around your neighborhood, and lets you see which friends are attending. You can RSVP, create your own events, offer or join carpools, and build a social network around the things happening near you.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Express.js, TypeScript |
| Database | MySQL (mysql2 with connection pooling) |
| Auth | JWT (HTTP-only cookies) + bcryptjs |
| Maps | Leaflet + react-leaflet |
| Geocoding | Geoapify Geocoder Autocomplete API |
| UI Components | Radix UI primitives |
| Forms | React Hook Form + Zod |
| Email | Nodemailer via Gmail SMTP |
| Testing | Cypress (E2E) |

---

## Architecture & Technical Decisions

### Backend: Stateless JWT Auth with HTTP-only Cookies

Authentication is handled with JWTs signed server-side and stored in HTTP-only, secure cookies on the client — not in `localStorage`. This prevents XSS-based token theft. Tokens carry a 1-hour expiration with the user's `userId`, `email`, `name`, `address`, and `verified` flag embedded in the payload. Password hashing uses bcryptjs with 10 salt rounds.

Email verification is implemented with 6-digit codes stored in a dedicated `EmailVerifications` table with a 24-hour expiration and a `Used` flag to prevent replay attacks.

### Database: Relational Schema with Careful Constraint Design

The schema has 9 tables with explicit foreign key relationships:

- **Friends** — a self-referencing `Users` join with a `Status` enum (`Pending`/`Accepted`) and a unique constraint on the user-pair to prevent duplicate friend records.
- **RSVP** — unique constraint on `(UserID, EventID)` to prevent double-RSVPs at the database level, not just application logic.
- **Map** — coordinates stored separately from `Events`, decoupling geocoding from event creation and allowing events to exist without resolved coordinates.
- **CarpoolParticipants** — composite primary key `(CarpoolID, UserID)` enforces the constraint that a user can only be in one carpool per event at the schema level.
- **EmailVerifications** — stores expiring verification codes with a `Used` boolean so codes can't be reused even within the expiration window.

### Event Recommendations: Social Graph Ranking

The recommendation algorithm on `/api/events/recommended/:userId` doesn't just sort events by date — it ranks events by how many of the requesting user's friends are attending, then falls back to chronological order. This surfaces socially relevant events over raw recency, making the feed feel personal without requiring ML infrastructure.

### Multi-Source Event Aggregation

Events come from three sources, each with its own ingestion pattern:

1. **Ticketmaster Discovery API** — a scraper endpoint (`POST /api/events/scrape-ticketmaster`) fetches paginated results (200 per page) filtered to New Jersey, deduplicates against existing records, and stores them. Designed to be run on-demand by an admin rather than on a cron to avoid rate limit issues.
2. **HASDATA Google SERP API** — scrapes Google Events search results for a given query, returning structured event data. Enables discovery of hyperlocal events that don't appear on Ticketmaster.
3. **User-created events** — full CRUD with public/private visibility. Private events are only visible to the host or accepted friends.

### Carpooling: Host-First Participant Model

When a user creates a carpool offer for an event, they are automatically added to `CarpoolParticipants` and their `AvailableSeats` is decremented. This ensures the host is always counted as an occupant, preventing overcounting. The host also auto-RSVPs to the event. Other users can request to join; the host accepts or rejects via `CarpoolRequests` before the user is moved to `CarpoolParticipants`. Visibility of carpool offers is scoped: you only see carpools from your friends for that event, keeping the system social rather than open-marketplace.

### Transportation Planning

`/api/transport` integrates OpenRouteService to calculate both driving and walking routes between a user's stored address and an event's coordinates. Returns distance (meters + miles) and duration (minutes) for both modes, giving users the information to decide whether to join a carpool or walk.

### Map-Centric UX

The home dashboard centers a Leaflet map on the authenticated user's geocoded address. Events are pinned as markers; coordinates are resolved at creation time via Geoapify and stored in the `Map` table. This separation means the map lookup is a simple `JOIN` rather than a live geocoding call on every page load.

### Fuzzy Search

User search uses `fuzzysort` rather than a SQL `LIKE` query. This tolerates typos and partial matches without requiring a full-text search index on the database, which would be overkill for a user directory at this scale.

### Frontend: Server-Side Auth Guard

Each protected Next.js page reads the JWT from the cookie server-side in `page.tsx` and redirects to `/auth` before rendering if the token is missing or expired. This means unauthenticated users never see a flash of protected content, and the auth check happens at the server rather than in a client-side effect.

### Event Visibility Model

Events have an `IsPublic` boolean. The backend enforces:
- Public events: visible to all authenticated users
- Private events: visible only to the host or users with an accepted friendship with the host

This is evaluated per-query rather than stored as a role, keeping the access control logic close to the data.

---

## Project Structure

```
CS491-Rendezvous/
├── backend/
│   ├── src/
│   │   ├── routes/         # Express route handlers (auth, events, friends, rsvp, carpool, transport, verify)
│   │   ├── db.ts           # MySQL connection pool
│   │   └── index.ts        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── features/       # Feature-scoped components (auth, events, friends, profile, verify)
│   │   └── components/     # Shared UI components (navbar, map, forms, Radix UI wrappers)
│   └── package.json
├── cypress/                # End-to-end tests
└── cypress.config.js
```

---

## Setup

### 1. Environment Variables

#### `backend/.env`

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
EMAIL_USER=
EMAIL_PW=
TICKETMASTER_KEY=
ORS_KEY=
HASDATA_API_KEY=
FRONTEND_URL=
```

#### `frontend/.env`

```env
NEXT_PUBLIC_JWT_SECRET=
NEXT_PUBLIC_GEOAPIFY_KEY=
NEXT_PUBLIC_API_URL=
```

> **Note:** The database is hosted on NJIT infrastructure. You must be on NJIT Wi-Fi or connected via the **Cisco Secure Client VPN** to reach it.

---

### 2. Backend

```bash
cd backend
npm install
npm run build
npm run start
```

Runs on `http://localhost:8080`.

---

### 3. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
npm run start
```

Runs on `http://localhost:3000`.

---

### 4. End-to-End Tests (Optional)

With both servers running, from the project root:

```bash
npm install
npm run cypress:open
```

---

## External Services

| Service | Purpose |
|---|---|
| Ticketmaster Discovery API | Aggregate local NJ events |
| HASDATA Google SERP API | Scrape Google Events results |
| OpenRouteService API | Driving + walking route calculations |
| Geoapify Geocoder API | Address autocomplete + coordinates |
| Gmail SMTP (Nodemailer) | Email verification codes |
