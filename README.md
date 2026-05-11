# SyncShift

> Geolocation-aware attendance tracking for distributed and field-based workforces.

SyncShift is a production-grade clock-in/clock-out platform that validates employee location
using server-side GPS checks, enforces configurable work schedules with grace periods, and
provides administrators with rich reporting, audit trails, and CSV/PDF export capabilities.

Built as a monorepo with a **Node.js/Express** REST API, **React** web dashboard, and
**React Native/Expo** mobile app — all backed by **PostgreSQL** and secured with RS256 JWTs,
bcrypt hashing, and OS-level encrypted token storage.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Security Model](#security-model)
- [Development Phases](#development-phases)
- [Testing](#testing)
- [License](#license)

---

## Key Features

- **Server-side GPS validation** — Haversine distance checks against admin-configured office
  geofences; client coordinates are never trusted alone
- **Secure dual-token auth** — Short-lived RS256 JWTs (15 min) + opaque refresh tokens stored
  in httpOnly cookies on web and Expo SecureStore on mobile
- **Rich reporting** — Individual and team reports with preset ranges (`week`, `2weeks`,
  `month`) or custom date ranges, plus CSV and PDF export
- **Schedule enforcement** — Shift times with per-schedule grace-minute tolerance and
  automatic late-arrival detection
- **Immutable audit trail** — All admin corrections stored with admin ID, timestamp, and
  mandatory justification note
- **Role-based access control** — `employee`, `admin`, and `superadmin` roles enforced via
  server-side middleware; frontend role state is never trusted
- **Cross-platform** — Full admin dashboard on web; mobile-first clock-in/out experience for
  field employees
- **Background jobs** — Automatic session close for sessions exceeding configured max hours;
  nightly report aggregation

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Node.js · Express · PostgreSQL (raw SQL + knex) |
| Web      | React · Vite · Axios · Context API              |
| Mobile   | React Native · Expo · SecureStore               |
| Auth     | JWT (RS256) · bcrypt (cost 12) · httpOnly cookies |
| Jobs     | node-cron                                       |
| Export   | pdfkit (PDF) · csv-stringify (CSV)              |
| Infra    | Docker Compose · Nginx                          |
| Testing  | Jest · Supertest                                |

---

## Architecture

```
┌──────────────────┐   ┌──────────────────┐
│   Web (React)    │   │  Mobile (Expo)   │
│  Admin + Employee│   │  Employee-facing │
└────────┬─────────┘   └────────┬─────────┘
         └──────────┬───────────┘
                    │  HTTPS / REST / JSON
         ┌──────────┴───────────┐
         │   Node.js · Express  │
         │  ┌─────────────────┐ │
         │  │   controllers   │ │
         │  │    services     │ │
         │  │  repositories   │ │
         │  └─────────────────┘ │
         │  Auth · Attendance   │
         │  Reports · Admin     │
         └──────────┬───────────┘
                    │
         ┌──────────┴───────────┐
         │      PostgreSQL      │
         │  users               │
         │  attendance_sessions │
         │  work_schedules      │
         │  office_locations    │
         └──────────────────────┘
```

The admin dashboard is part of the React web app — there is no separate admin deployable.
Web and mobile share the same REST API with no divergence in business logic.

---

## Project Structure

```
syncshift/
│
├── backend/
│   ├── src/
│   │   ├── config/            # DB connection, env loader, constants
│   │   ├── controllers/       # HTTP layer — parse request, call service, respond
│   │   ├── services/          # Business logic — all computation lives here
│   │   ├── repositories/      # Data layer — raw SQL, one file per entity
│   │   ├── routes/            # Express routers — mount validators + controllers
│   │   ├── middleware/        # auth, role-guard, rate-limiter, error handler
│   │   ├── validators/        # Request schema validation (Joi)
│   │   ├── utils/             # date.utils · geo.utils · time.utils · logger
│   │   ├── jobs/              # autoSignout.job.js · reportCleanup.job.js
│   │   ├── docs/              # api.docs.yaml (OpenAPI / Swagger)
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Entry point
│   ├── database/              # Migrations, seeds, schema.sql (outside src/)
│   │   ├── migrations/
│   │   └── seeds/
│   ├── tests/                 # Jest + Supertest
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios instance + per-resource request functions
│   │   ├── components/        # Shared UI — Button, Card, Loader, Map
│   │   ├── pages/             # Login · Register · Dashboard · Attendance · Reports
│   │   ├── hooks/             # useAuth · useLocation · useAttendance
│   │   ├── context/           # AuthContext — token state + refresh logic
│   │   ├── utils/             # formatters.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── screens/           # Login · Dashboard · ClockIn · History
│   │   ├── services/          # SecureStore token handling + API wrappers
│   │   └── components/
│   └── package.json
│
├── infrastructure/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── scripts/
│   ├── setup.sh               # Create .env, run migrations, seed admin user
│   ├── seed-admin.sh          # Standalone admin seed
│   └── deploy.sh              # Pull, rebuild containers, run migrations
│
└── README.md
```

> **Note on `repositories/`** — this project uses raw SQL via `pg` with `knex` for migrations.
> There is no ORM. The `repositories/` layer handles all database interaction directly.
> The `database/` directory sits at the `backend/` root, outside `src/`, because migrations
> are infrastructure artefacts, not application source code.

---

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Docker + Docker Compose (recommended)
- Expo CLI (for mobile)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/syncshift.git
cd syncshift
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Open backend/.env and fill in DB credentials, JWT secrets, and cookie domain
```

### 3. Install dependencies

```bash
# Backend
cd backend && npm install

# Web frontend
cd ../frontend && npm install

# Mobile
cd ../mobile && npm install
```

### 4. Start infrastructure (PostgreSQL + Nginx)

```bash
docker-compose -f infrastructure/docker-compose.yml up -d
```

### 5. Run migrations and seed admin

```bash
cd backend
npx knex migrate:latest
../scripts/seed-admin.sh
```

The seed script creates a default superadmin account. Credentials are printed to stdout
once — save them immediately.

### 6. Start services

```bash
# API — runs on :5000
cd backend && npm run dev

# Web dashboard — runs on :3000
cd frontend && npm start

# Mobile (Expo Go)
cd mobile && npx expo start
```

---

## Environment Variables

Full reference in `backend/.env.example`. Key variables:

| Variable              | Example                        | Notes                                      |
|-----------------------|--------------------------------|--------------------------------------------|
| `NODE_ENV`            | `production`                   |                                            |
| `PORT`                | `5000`                         |                                            |
| `DB_HOST`             | `localhost`                    |                                            |
| `DB_PORT`             | `5432`                         |                                            |
| `DB_NAME`             | `syncshift`                    |                                            |
| `DB_USER`             | `syncshift_user`               |                                            |
| `DB_PASSWORD`         | `***`                          | Never commit a real value                  |
| `JWT_ACCESS_SECRET`   | `***`                          | RS256 private key path or inline secret    |
| `JWT_REFRESH_SECRET`  | `***`                          |                                            |
| `ACCESS_TOKEN_TTL`    | `15m`                          |                                            |
| `REFRESH_TOKEN_TTL`   | `7d`                           |                                            |
| `COOKIE_DOMAIN`       | `yourdomain.com`               | httpOnly refresh cookie scope              |
| `CORS_ORIGIN`         | `https://app.yourdomain.com`   |                                            |
| `MAX_CHECK_IN_RADIUS` | `100`                          | Default geofence radius in metres          |

---

## API Reference

Full OpenAPI specification at `backend/src/docs/api.docs.yaml`.
When the dev server is running, Swagger UI is available at `http://localhost:5000/api/docs`.

### Endpoint Summary

#### Auth

| Method | Path                  | Access  | Description                          |
|--------|-----------------------|---------|--------------------------------------|
| POST   | `/api/auth/register`  | Public  | Register new employee account        |
| POST   | `/api/auth/login`     | Public  | Return access + refresh tokens       |
| POST   | `/api/auth/refresh`   | Public  | Exchange refresh token for new pair  |
| POST   | `/api/auth/logout`    | Auth    | Invalidate refresh token             |

#### Attendance (Employee)

| Method | Path                         | Access | Description                          |
|--------|------------------------------|--------|--------------------------------------|
| POST   | `/api/attendance/signin`     | Auth   | Clock in — validates GPS server-side |
| POST   | `/api/attendance/signout`    | Auth   | Clock out — computes hours_worked    |
| GET    | `/api/attendance/status`     | Auth   | Current open session or null         |
| GET    | `/api/attendance/history`    | Auth   | Own records, paginated               |

#### Admin — Users

| Method | Path                       | Access | Description                          |
|--------|----------------------------|--------|--------------------------------------|
| GET    | `/api/admin/users`         | Admin  | List all users with schedule info    |
| GET    | `/api/admin/users/:id`     | Admin  | Single user detail                   |
| PATCH  | `/api/admin/users/:id`     | Admin  | Update role, schedule, active status |

#### Admin — Attendance

| Method | Path                                 | Access | Description                        |
|--------|--------------------------------------|--------|------------------------------------|
| GET    | `/api/admin/attendance`              | Admin  | All sessions, filterable           |
| GET    | `/api/admin/attendance/:userId`      | Admin  | All sessions for one user          |
| PATCH  | `/api/admin/attendance/:sessionId`   | Admin  | Manual correction with audit note  |

#### Reports

| Method | Path                                          | Access | Description                              |
|--------|-----------------------------------------------|--------|------------------------------------------|
| GET    | `/api/admin/reports/user/:userId`             | Admin  | Individual report — `?preset=` or `?from=&to=` |
| GET    | `/api/admin/reports/team`                     | Admin  | All users for a period                   |
| GET    | `/api/admin/reports/user/:userId?export=csv`  | Admin  | Download CSV                             |
| GET    | `/api/admin/reports/user/:userId?export=pdf`  | Admin  | Download PDF                             |

**Report presets:** `?preset=week` · `?preset=2weeks` · `?preset=month`
**Custom range:** `?from=YYYY-MM-DD&to=YYYY-MM-DD`

#### Office Locations

| Method | Path                          | Access | Description              |
|--------|-------------------------------|--------|--------------------------|
| GET    | `/api/admin/locations`        | Admin  | List all geofence zones  |
| POST   | `/api/admin/locations`        | Admin  | Create new zone          |
| PATCH  | `/api/admin/locations/:id`    | Admin  | Update radius or coords  |
| DELETE | `/api/admin/locations/:id`    | Admin  | Deactivate zone          |

---

## Security Model

| Concern             | Implementation                                                              |
|---------------------|-----------------------------------------------------------------------------|
| Password hashing    | bcrypt, cost factor 12                                                      |
| Access token        | JWT signed with RS256, 15-minute TTL                                        |
| Refresh token       | Opaque token, 7-day TTL, stored server-side in DB                           |
| Web token storage   | Access token in memory; refresh token in httpOnly + Secure + SameSite=Strict cookie |
| Mobile token storage| Expo SecureStore (iOS Keychain / Android Keystore)                          |
| Transport           | HTTPS only; HSTS enforced via Nginx                                         |
| Rate limiting       | 10 req/min on auth endpoints; 60 req/min general                            |
| GPS enforcement     | Server-side Haversine check — client coordinates never trusted alone        |
| Role enforcement    | Middleware-enforced per route — frontend role state is never the authority  |
| Audit trail         | Admin corrections stored with admin ID + timestamp + mandatory note         |

---

## Development Phases

| Phase | Name                    | Status      | Key Deliverables                                              |
|-------|-------------------------|-------------|---------------------------------------------------------------|
| 1     | Backend Foundation      | 🔲 Pending  | Scaffold · DB migrations · Auth endpoints · middleware        |
| 2     | Attendance Core         | 🔲 Pending  | Sign-in/out · GPS validation · session management            |
| 3     | Reporting & Export      | 🔲 Pending  | Report queries · presets · CSV/PDF export · late detection    |
| 4     | Web Frontend            | 🔲 Pending  | React app · AuthContext · employee + admin pages             |
| 5     | Mobile App              | 🔲 Pending  | Expo · SecureStore · geolocation · shared API layer          |
| 6     | Admin Controls          | 🔲 Pending  | Location CRUD · manual corrections · schedule management     |
| 7     | Hardening & Deploy      | 🔲 Pending  | Rate limiting · HTTPS · Docker Compose · setup/deploy scripts |

Phases 4 and 5 can run in parallel once Phase 3 is complete.

---

## Testing

Each phase has a defined test checklist that must pass before the next phase begins.

```bash
# Run all backend tests
cd backend && npm test

# Run tests with coverage
cd backend && npm run test:coverage

# Run a specific test file
cd backend && npx jest tests/auth.test.js
```

Test files live in `backend/tests/` and cover:

- `auth.test.js` — register, login, token refresh, logout, invalid credential handling
- `attendance.test.js` — sign-in/out flows, GPS boundary enforcement, double sign-in prevention
- `report.test.js` — date range resolution, summary computation, export generation

---

## Database Schema (Summary)

| Table                 | Key Columns                                                          |
|-----------------------|----------------------------------------------------------------------|
| `users`               | id · name · email · password_hash · role · schedule_id · is_active  |
| `work_schedules`      | id · name · shift_start · shift_end · grace_minutes                  |
| `office_locations`    | id · name · latitude · longitude · radius_m · is_active             |
| `attendance_sessions` | id · user_id · signed_in_at · signed_out_at · hours_worked · is_late |

All timestamps stored as `TIMESTAMPTZ` (UTC). Clients handle timezone display.

---

## License

Confidential — internal use only.
© 2026 Engineering Team. All rights reserved.