# Bihar Vihaan — Tourism & Cultural Platform

A full-stack tourism website for the state of Bihar, India: a public tourism site,
user authentication, an admin dashboard, and a JSON REST API for managing destinations.

> **Tech stack (actual):** Node.js + Express, MongoDB (Mongoose), and a static
> HTML/CSS/JavaScript frontend. (There is also a set of optional Firebase artifacts
> retained for an alternate deployment path — see [Firebase](#firebase-optional).)

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running Locally](#running-locally)
- [Seeding Sample Data](#seeding-sample-data)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Firebase (optional)](#firebase-optional)

---

## Features
- Public tourism website (responsive HTML/CSS/JS, PWA shell)
- User authentication (signup / login / token verify) with JWT + bcrypt
- Admin dashboard with destination CRUD
- JSON REST API
- Security headers (helmet), rate limiting, CORS, NoSQL-injection sanitisation

## Architecture
- **Frontend** — static files in `public/` (served by Express in dev; deployable to
  Vercel as a static site). Vanilla JS modules in `public/assets/js/`.
- **Backend** — Express app (`server.js`) mounting routers under `/api`:
  - `/api/auth` — user signup/login/verify (`backend/routes/auth.js`)
  - `/api/admin` — admin login/verify/logout (`backend/routes/admin.js`)
  - `/api/destinations` — destination CRUD (`backend/routes/destinations.js`)
- **Database** — MongoDB via Mongoose. Models in `backend/models/`
  (`User`, `Destination`).
- **Config** — `config/env.js` centralises and validates all environment config;
  `config/db.js` handles the (fault-tolerant) MongoDB connection.
- **Auth flow** — credentials → JWT (signed with `JWT_SECRET`) → sent as
  `Authorization: Bearer <token>` → verified by `backend/middleware/auth.js`
  (`authenticateToken`, `requireAdmin`).

## Folder Structure
```
.
├── server.js                 # Express entrypoint
├── config/
│   ├── env.js                # Centralised env config + validation
│   └── db.js                 # MongoDB connection helpers
├── backend/
│   ├── routes/               # auth.js, admin.js, destinations.js
│   ├── models/               # User.js, Destination.js
│   ├── middleware/auth.js    # JWT auth + admin guard
│   ├── utils/response.js     # Standard JSON response helpers
│   └── seed.js               # Sample destination seeder
├── public/                   # Static frontend (HTML/CSS/JS, PWA)
│   ├── index.html, login.html, signup.html, admin.html, 404.html
│   └── assets/{css,js,img,icons}
├── docs/                     # Additional documentation
└── .env.example              # Environment template
```
See also `docs/FOLDER_STRUCTURE.md`.

## Prerequisites
- Node.js >= 16
- A MongoDB instance (local `mongodb://localhost:27017` or MongoDB Atlas).
  The server still starts without a database (static pages + health check work),
  but API data operations require MongoDB.

## Installation
```bash
git clone https://github.com/kaushikkishorgupta/bihar-vihan.git
cd bihar-vihan
npm install
cp .env.example .env   # then edit .env
```

## Environment Configuration
All configuration is read from environment variables (see `.env.example`):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | no | `3000` | HTTP port |
| `NODE_ENV` | no | `development` | `production` enables stricter behaviour |
| `MONGODB_URI` | no | `mongodb://localhost:27017/bihar-vihan` | MongoDB connection string |
| `JWT_SECRET` | **yes (prod)** | dev-only fallback | Secret used to sign JWTs |
| `JWT_USER_EXPIRES_IN` | no | `7d` | User token lifetime |
| `JWT_ADMIN_EXPIRES_IN` | no | `24h` | Admin token lifetime |
| `ADMIN_USERNAME` | no | `admin` | Admin login username |
| `ADMIN_PASSWORD_HASH` | prod | – | bcrypt hash of the admin password |
| `ADMIN_PASSWORD` | dev only | `admin123` (dev) | Plaintext admin password (ignored in prod) |
| `CORS_ORIGINS` | no | localhost + vercel | Comma-separated allowed origins |

In **production** the app throws on startup if `JWT_SECRET` is missing, and the admin
login requires `ADMIN_PASSWORD_HASH` (the plaintext `ADMIN_PASSWORD` fallback is
disabled). Generate a hash with:
```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'your-password'
```

## Running Locally
```bash
npm run dev     # nodemon (auto-reload)
# or
npm start       # node server.js
```
Then open http://localhost:3000. Health check: `GET /api/health`.

## Seeding Sample Data
With `MONGODB_URI` set in `.env`:
```bash
node backend/seed.js
```
This clears the `destinations` collection and inserts sample Bihar destinations.

## API Reference
Base path: `/api`. All responses share the envelope
`{ success, message, data?, timestamp }` (errors set `success:false`).

### Auth — `/api/auth`
| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/signup` | – | `{ name, email, password }` | Create user, returns `{ data: { user, token } }` |
| POST | `/login` | – | `{ email, password }` | Login, returns `{ data: { user, token } }` |
| POST | `/verify` | Bearer | – | Verify a user token |

### Admin — `/api/admin`
| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/login` | – | `{ username, password }` | Admin login, returns top-level `{ token, user }` |
| POST | `/verify` | Bearer or `{ token }` | – | Verify an admin token |
| POST | `/logout` | – | – | Stateless logout acknowledgement |

### Destinations — `/api/destinations`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | – | List all destinations |
| GET | `/:id` | – | Get one destination |
| POST | `/` | admin | Create a destination |
| PUT | `/:id` | admin | Update a destination |
| DELETE | `/:id` | admin | Delete a destination |

Destination fields: `name`, `location`, `description`, `image`, `category`,
`bestTime`, `howToReach`, `attractions[]`. See `API_STRUCTURE.md` for examples.

## Security
- Passwords hashed with **bcryptjs** (cost 12); never returned in responses.
- **JWT** auth via `Authorization: Bearer <token>`; secret from `JWT_SECRET`.
- **NoSQL-injection** protection: `express-mongo-sanitize` + string coercion of auth inputs.
- **XSS**: admin/user-supplied content is HTML-escaped before rendering.
- **helmet** security headers + CSP, **express-rate-limit**, configurable **CORS**.
- Secrets are read from the environment only — never commit `.env` or `*.backup`.
  See `docs/ADMIN_SECURITY.md`.

## Deployment
The frontend can deploy to Vercel as a static site (`vercel.json` serves `public/`),
while the Express API runs on a Node host (e.g. Render). For details see
`DEPLOYMENT.md`, `DEPLOYMENT_INSTRUCTIONS.md`, and `PRODUCTION_DEPLOYMENT_GUIDE.md`.

## Firebase (optional)
The repo retains an alternate Firebase/Firestore path (`admin-firebase.js`,
`firestore.rules`, `storage.rules`, `FIREBASE_SCHEMA.md`). It is **not** wired into the
Express API above and is optional; the primary backend is Express + MongoDB.
