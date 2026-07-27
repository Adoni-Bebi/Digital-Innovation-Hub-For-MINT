# Digital Innovation Hub for MinT

A centralized, role-based web platform that digitizes and organizes Ethiopia's technology startup ecosystem — connecting startup founders, investors, and government regulators (MinT) in a single, secure, verifiable system.

> Built in alignment with the Ministry of Innovation and Technology's (MinT) mandate and the **Digital Ethiopia 2030** strategy.

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Alignment with MinT / Digital Ethiopia 2030](#alignment-with-mint--digital-ethiopia-2030)
4. [System Actors](#system-actors)
5. [Core Modules & Features](#core-modules--features)
6. [Tech Stack](#tech-stack)
7. [System Architecture](#system-architecture)
8. [Database Design](#database-design)
9. [API Reference](#api-reference)
10. [User Flows](#user-flows)
11. [Non-Functional Requirements](#non-functional-requirements)
12. [Security Considerations](#security-considerations)
13. [Project Folder Structure](#project-folder-structure)
14. [Environment Variables](#environment-variables)
15. [Installation & Setup](#installation--setup)
16. [Running the Project](#running-the-project)
17. [Testing Strategy](#testing-strategy)
18. [Deployment](#deployment)
19. [Project Roadmap](#project-roadmap)
20. [Team](#team)
21. [License](#license)

---

## Overview

The Digital Innovation Hub for MinT is not a static company directory. It is an **active deal-flow and verification engine**: startups are officially vetted by MinT before appearing publicly, which gives investors confidence to engage, and investors must go through a controlled request process before they can view a startup's sensitive documents (pitch decks, financial projections, legal registration).

The platform's core differentiator is the **Secure Data Room** — a permission-gated document vault that lets a startup show a public summary to everyone, while keeping sensitive materials hidden behind an explicit, revocable, founder-approved access grant.

## Problem Statement

Ethiopia's tech ecosystem currently lacks a centralized, trusted system connecting three groups:

- **Startups**, who have no single official channel to be discovered by legitimate investors or recognized by government programs.
- **Investors**, who have no reliable way to verify that a startup is legitimate before spending time on due diligence, and no safe channel to request sensitive financial data.
- **MinT**, who has no aggregate visibility into the health of the startup ecosystem it is meant to support — sector distribution, verification volume, or how many real investor connections are being made.

This platform solves all three problems in one system, with government-backed verification as the trust anchor.

## Alignment with MinT / Digital Ethiopia 2030

- **Digitalization of government oversight**: replaces informal, offline vetting of startups with a structured digital verification queue and audit trail.
- **Investment facilitation**: gives domestic and international investors a credible, government-endorsed pipeline of vetted Ethiopian startups.
- **Ecosystem telemetry**: gives MinT real analytics (sector trends, verification throughput, deal-flow volume) it does not currently have, supporting evidence-based policy decisions.
- **Technology transfer & innovation support**: directly serves MinT's stated mandate to promote and organize the domestic innovation and startup ecosystem.

## System Actors

The system enforces strict **Role-Based Access Control (RBAC)** with three primary roles, each with a distinct dashboard and permission set.

| Role | Description | Primary Goal |
|---|---|---|
| **Startup Founder (Innovator)** | Creates and manages a startup profile, uploads Data Room documents, reviews and grants/revokes investor access requests | Get discovered, get verified, get funded |
| **Investor (VC / Angel / ESO)** | Browses the verified startup directory, filters by sector/stage/location, requests Data Room access | Discover and evaluate legitimate investment opportunities |
| **MinT Administrator** | Reviews and approves/rejects startup verification requests, monitors ecosystem-wide analytics | Maintain platform integrity, measure ecosystem health |

## Core Modules & Features

### Module A — Identity & Onboarding

- **Multi-role registration**: on sign-up, a user selects their role (Startup, Investor, or Admin — Admin accounts are seeded/invited only, not self-registered).
- **Startup profile onboarding**: a required multi-step form capturing Sector, Funding Stage, Team Size, Location, and a Problem/Solution statement. A profile cannot be submitted for verification until every required field is complete.
- **Investor KYC (Know Your Customer)**: investors must submit organizational details — Organization Website, Investment Ticket Size range, and Focus Area(s) — before they are permitted to send any Data Room access requests. Unverified investor accounts can browse the public directory but cannot request access.
- **JWT-based authentication**: stateless session tokens issued at login, refreshed via a refresh-token rotation flow, with role encoded in the token payload and re-validated server-side on every protected request.

### Module B — Startup Directory & Search Engine

- **Public directory**: a searchable grid/list of all **MinT-Verified** startups only. Pending or rejected startups never appear here.
- **Advanced filtering**: combinable filters for:
  - Sector — FinTech, AgriTech, EdTech, HealthTech, LogisticsTech, CleanTech, Other
  - Funding Stage — Idea, Pre-seed, Seed, Series A
  - Location — Addis Ababa, Bahir Dar, Hawassa, Mekelle, Adama, Regional IT Parks, Other
- **Public vs. private profile split**: the public card shows company name, logo, one-line description, sector, and stage. Team details, financials, and documents remain private until access is explicitly granted.
- **Pagination and sort**: results are paginated (default 12 per page) and sortable by newest, most requested, and alphabetical.

### Module C — Deal Flow & Secure Data Room

This is the platform's signature module.

- **Data Room Vault**: each startup can upload a defined set of document types — Pitch Deck (PDF), Financial Projections (PDF/XLSX), Business Registration/License (PDF), and up to three supplementary documents. Files are stored in cloud object storage (not directly in MongoDB) with only signed, time-limited URLs referenced in the database.
- **Access Request flow**: an investor viewing a verified startup's public profile can click "Request Data Room Access." This creates an `AccessRequest` document with status `pending` and triggers a notification (in-app + email) to the founder.
- **Founder review**: the founder sees the requesting investor's KYC profile (organization, ticket size, focus area) before deciding. They can **Approve**, **Deny**, or take no action (request remains pending).
- **Revocation**: an approved investor's access can be revoked by the founder at any time; revocation immediately invalidates any active signed document URLs for that investor.
- **Access history**: every grant, denial, and revocation is timestamped and logged for both the founder's and MinT's audit visibility.

### Module D — MinT Verification & Analytics Dashboard

- **Verification Queue**: newly registered startup profiles enter a `pending` state and appear in a dedicated admin queue, sorted oldest-first (FIFO), with a badge count of items awaiting review.
- **Review interface**: admins view the full submitted profile plus any uploaded business registration document, and can **Approve** (status becomes `verified`, profile becomes publicly visible) or **Reject** (status becomes `rejected`, with a required rejection reason sent to the founder so they can correct and resubmit).
- **Official Badging**: verified startups display a "MinT-Verified" badge on their public card and profile page.
- **Ecosystem Telemetry / Analytics Dashboard**: chart-based visualizations covering:
  - Registered vs. verified vs. rejected startup counts, over time
  - Distribution of verified startups by sector (pie/bar chart)
  - Distribution by funding stage and by location
  - Monthly Data Room access requests submitted vs. approved (deal-flow volume trend line)
  - Average time-to-verification (queue efficiency metric)
- **Privacy-preserving telemetry**: MinT's analytics show aggregate counts and trends only — admins can see *that* 50 Data Room requests were approved this month, but not the private document contents or in-platform messages between founders and investors.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | **React** (Vite) | Single-page application, component-driven UI |
| Frontend state | React Context + `useReducer` (or Redux Toolkit for larger team preference) | Auth state, role-based UI rendering |
| Styling | Tailwind CSS | Utility-first styling, responsive design out of the box |
| Charts | Recharts | Analytics dashboard visualizations |
| Backend | **Express.js** (Node.js) | REST API server |
| Database | **MongoDB** (Atlas) via **Mongoose** ODM | Document storage, schema validation |
| Authentication | JSON Web Tokens (JWT) + bcrypt | Stateless auth, password hashing |
| File Storage | Cloud object storage (e.g. AWS S3 / Cloudinary) with signed URLs | Secure Data Room document storage |
| Email Notifications | Nodemailer + SMTP (or a transactional email API) | Access-request and verification-status notifications |
| API Documentation | Swagger / OpenAPI | Machine-readable API contract for the endpoints listed below |
| Testing | Jest + Supertest (backend), React Testing Library (frontend) | Unit and integration testing |
| Deployment | Docker + a cloud host (e.g. Render, Railway, or a VPS) | Containerized deployment |

## System Architecture

```
                              ┌─────────────────────┐
                              │   React Frontend     │
                              │  (Vite, Tailwind)     │
                              │  - Public Directory   │
                              │  - Founder Dashboard  │
                              │  - Investor Dashboard │
                              │  - Admin Dashboard    │
                              └──────────┬───────────┘
                                         │ REST (HTTPS, JWT in Authorization header)
                              ┌──────────▼───────────┐
                              │   Express.js API      │
                              │  - Auth middleware     │
                              │  - Role-guard middleware│
                              │  - Controllers/Routes  │
                              │  - Validation layer    │
                              └───┬───────────────┬───┘
                                  │               │
                     ┌────────────▼───┐   ┌───────▼─────────────┐
                     │   MongoDB       │   │  Cloud Object Storage│
                     │  (Mongoose)     │   │  (signed URLs only)  │
                     │  - Users        │   │  - Pitch decks        │
                     │  - Startups     │   │  - Financials          │
                     │  - AccessRequests│   │  - Registration docs  │
                     │  - Notifications│   └───────────────────────┘
                     └─────────────────┘
```

The backend never returns raw storage credentials or public bucket URLs — every document link served to an authorized investor is a short-lived, signed URL generated on demand for that specific request.

## Database Design

All collections are managed through Mongoose schemas with server-side validation. Relationships that would be relational joins in SQL are modeled here via `ObjectId` references with `.populate()`.

### `User`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `fullName` | String | Required |
| `email` | String | Required, unique, indexed |
| `passwordHash` | String | bcrypt hash, never returned in API responses |
| `role` | String enum | `founder`, `investor`, `admin` |
| `isEmailVerified` | Boolean | Default `false` |
| `createdAt` / `updatedAt` | Date | Timestamps (Mongoose `timestamps: true`) |

### `StartupProfile`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `founder` | ObjectId (ref `User`) | Required |
| `companyName` | String | Required |
| `logoUrl` | String | Optional at creation, required before submission |
| `sector` | String enum | FinTech, AgriTech, EdTech, HealthTech, LogisticsTech, CleanTech, Other |
| `fundingStage` | String enum | Idea, Pre-seed, Seed, Series A |
| `location` | String enum | Addis Ababa, Bahir Dar, Hawassa, Mekelle, Adama, Regional IT Parks, Other |
| `teamSize` | Number | Required |
| `oneLineDescription` | String | Max 150 characters, shown on public card |
| `problemStatement` | String | Required, private-until-verified detail field |
| `solutionStatement` | String | Required |
| `status` | String enum | `draft`, `pending`, `verified`, `rejected` |
| `rejectionReason` | String | Populated only when `status === 'rejected'` |
| `verifiedAt` | Date | Set when an admin approves |
| `verifiedBy` | ObjectId (ref `User`) | Which admin approved it |
| `createdAt` / `updatedAt` | Date | Timestamps |

### `DataRoomDocument`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `startup` | ObjectId (ref `StartupProfile`) | Required |
| `documentType` | String enum | `pitch_deck`, `financials`, `business_registration`, `supplementary` |
| `storageKey` | String | Object storage key/path, never exposed directly to the client |
| `originalFileName` | String | Required |
| `uploadedAt` | Date | Timestamp |

### `InvestorProfile`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `user` | ObjectId (ref `User`) | Required, one-to-one |
| `organizationName` | String | Required |
| `organizationWebsite` | String | Required |
| `investmentTicketSize` | String enum | `<$10k`, `$10k-$50k`, `$50k-$250k`, `$250k+` |
| `focusAreas` | [String] | One or more sector enum values |
| `kycStatus` | String enum | `incomplete`, `submitted`, `approved` |
| `createdAt` / `updatedAt` | Date | Timestamps |

### `AccessRequest`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `startup` | ObjectId (ref `StartupProfile`) | Required |
| `investor` | ObjectId (ref `User`) | Required |
| `status` | String enum | `pending`, `approved`, `denied`, `revoked` |
| `requestedAt` | Date | Timestamp |
| `decidedAt` | Date | Set on approve/deny |
| `revokedAt` | Date | Set if the founder later revokes an approved grant |

### `AccessLog`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `accessRequest` | ObjectId (ref `AccessRequest`) | Required |
| `action` | String enum | `requested`, `approved`, `denied`, `revoked`, `document_viewed` |
| `actor` | ObjectId (ref `User`) | Who performed the action |
| `timestamp` | Date | Required |

### `Notification`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `recipient` | ObjectId (ref `User`) | Required |
| `type` | String enum | `verification_approved`, `verification_rejected`, `access_requested`, `access_approved`, `access_denied`, `access_revoked` |
| `message` | String | Human-readable notification text |
| `isRead` | Boolean | Default `false` |
| `createdAt` | Date | Timestamp |

## API Reference

Base URL: `/api/v1`

All protected routes require `Authorization: Bearer <JWT>`. Role-restricted routes are marked accordingly.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user with `role: founder \| investor` |
| POST | `/auth/login` | Public | Authenticate and receive access + refresh tokens |
| POST | `/auth/refresh` | Public (valid refresh token) | Issue a new access token |
| POST | `/auth/logout` | Authenticated | Invalidate the current refresh token |

### Startups

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/startups` | Founder | Create a startup profile (status: `draft`) |
| PUT | `/startups/:id` | Founder (owner) | Update own startup profile |
| POST | `/startups/:id/submit` | Founder (owner) | Submit profile for verification (status → `pending`) |
| GET | `/startups` | Public | List verified startups, supports `?sector=`, `?stage=`, `?location=`, `?page=` |
| GET | `/startups/:id` | Public | Public view of a single verified startup |
| GET | `/startups/:id/full` | Founder (owner) or approved Investor | Full profile including private fields |

### Data Room

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/startups/:id/documents` | Founder (owner) | Upload a Data Room document |
| DELETE | `/documents/:docId` | Founder (owner) | Remove a document |
| GET | `/documents/:docId/signed-url` | Investor with `approved` access only | Returns a short-lived signed URL |

### Access Requests

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/startups/:id/access-requests` | Investor (KYC `approved`) | Request Data Room access |
| GET | `/access-requests/incoming` | Founder | List requests for the founder's startup |
| GET | `/access-requests/outgoing` | Investor | List the investor's own requests |
| PATCH | `/access-requests/:id/approve` | Founder (owner) | Approve a pending request |
| PATCH | `/access-requests/:id/deny` | Founder (owner) | Deny a pending request |
| PATCH | `/access-requests/:id/revoke` | Founder (owner) | Revoke a previously approved request |

### Investor KYC

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/investors/kyc` | Investor | Submit KYC details |
| GET | `/investors/me` | Investor | Get own investor profile |

### Admin / MinT

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/verification-queue` | Admin | List `pending` startup profiles, oldest-first |
| PATCH | `/admin/startups/:id/approve` | Admin | Approve a startup (status → `verified`) |
| PATCH | `/admin/startups/:id/reject` | Admin | Reject a startup, requires `reason` in body |
| GET | `/admin/analytics/overview` | Admin | Aggregate counts: registered/verified/rejected totals |
| GET | `/admin/analytics/sector-distribution` | Admin | Verified startup count grouped by sector |
| GET | `/admin/analytics/stage-distribution` | Admin | Verified startup count grouped by funding stage |
| GET | `/admin/analytics/deal-flow` | Admin | Monthly access-request submitted vs. approved trend |
| GET | `/admin/analytics/verification-time` | Admin | Average time from `pending` to `verified` |

### Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Authenticated | List the current user's notifications |
| PATCH | `/notifications/:id/read` | Authenticated | Mark a notification as read |

## User Flows

### Flow 1 — Startup Verification Journey

1. Founder registers and selects the `founder` role.
2. Founder completes the startup onboarding form; profile is saved with `status: draft`.
3. Founder clicks "Submit for Verification"; profile status changes to `pending` and enters the admin queue.
4. MinT Admin opens the Verification Queue, reviews the profile details and uploaded business registration document.
5. Admin clicks **Approve**. System sets `status: verified`, records `verifiedAt` and `verifiedBy`, and the profile becomes publicly visible in the directory. A notification is sent to the founder.
   - If the admin instead clicks **Reject**, they must provide a `rejectionReason`; the founder is notified and can edit and resubmit the profile.

### Flow 2 — Investor Deal-Flow Journey

1. Investor registers, selects the `investor` role, and completes KYC (`kycStatus: submitted` → `approved` after basic validation).
2. Investor browses the public directory and filters by sector (e.g. "AgriTech").
3. Investor opens a verified startup's public profile and reads the summary, but the financial projections are hidden.
4. Investor clicks "Request Data Room Access," creating an `AccessRequest` with `status: pending`.
5. Founder receives an in-app and email notification, reviews the investor's KYC profile, and clicks **Approve**.
6. `AccessRequest.status` becomes `approved`; an `AccessLog` entry is recorded.
7. Investor can now request signed URLs for each Data Room document and view them; each view is logged.
8. If the founder later clicks **Revoke**, `status` becomes `revoked`, and any further signed-URL requests from that investor for that startup are rejected server-side.

## Non-Functional Requirements

- **Security & Privacy**: unverified or unapproved investors must never be able to access private startup data, whether through the UI or by guessing API routes/IDs directly. Document storage URLs must always be short-lived and signed — never permanently public.
- **Scalability**: the schema is designed with explicit `ObjectId` references and `.populate()` rather than deeply embedded documents, so relationships (one investor → many requests, one startup → many requests) scale cleanly as data volume grows.
- **Usability**: the interface must be usable by both highly technical users (developers, investors) and non-technical users (some MinT administrative staff), which drives the choice of a clean, componentized Tailwind-based design over a dense, jargon-heavy admin UI.
- **Availability**: the API should target 99% uptime during business hours for a production pilot; database backups should run on at least a daily schedule.
- **Auditability**: every state-changing action on an `AccessRequest` or a `StartupProfile` verification decision must be logged with an actor and timestamp, satisfying the government transparency requirement.
- **Performance**: directory listing endpoints must support pagination and must not return unbounded result sets; target sub-500ms response time for the directory listing endpoint under normal load.

## Security Considerations

- Passwords are hashed with bcrypt (minimum 10 salt rounds); plaintext passwords are never logged or stored.
- JWT access tokens are short-lived (15 minutes); refresh tokens are longer-lived (7 days), stored as httpOnly cookies, and rotated on each use.
- All role-guard checks are enforced **server-side** in Express middleware — the frontend hiding a button is a UX convenience only, never the actual access control.
- Data Room document storage keys are never sent to the client; only time-limited signed URLs are generated per authorized request, and every signed-URL issuance is logged in `AccessLog`.
- All API input is validated and sanitized server-side (e.g. via `express-validator` or `Joi`) to prevent injection and malformed-data attacks, independent of client-side form validation.
- Rate limiting is applied to authentication endpoints (`/auth/login`, `/auth/register`) to mitigate brute-force attempts.
- CORS is configured to explicitly allow only the deployed frontend origin(s), not `*`.

## Project Folder Structure

```
digital-innovation-hub-mint/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instance + API call functions per resource
│   │   ├── components/            # Reusable UI components
│   │   ├── context/                # AuthContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── directory/           # Public startup directory + filters
│   │   │   ├── founder/             # Founder dashboard, profile editor, Data Room manager
│   │   │   ├── investor/            # Investor dashboard, KYC form, request tracker
│   │   │   └── admin/               # Verification queue, analytics dashboard
│   │   ├── routes/                 # React Router route definitions + role guards
│   │   ├── hooks/                  # Custom hooks (useAuth, useFetch, etc.)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/                  # DB connection, environment config
│   │   ├── models/                  # Mongoose schemas (User, StartupProfile, etc.)
│   │   ├── controllers/             # Route handler logic per resource
│   │   ├── routes/                  # Express route definitions per resource
│   │   ├── middleware/              # auth.js, roleGuard.js, errorHandler.js, validators/
│   │   ├── services/                # storage.js (signed URLs), email.js, analytics.js
│   │   ├── utils/                   # helper functions
│   │   └── app.js
│   ├── tests/                       # Jest + Supertest test suites
│   ├── server.js                    # Entry point
│   └── package.json
│
├── docs/
│   ├── api-spec.yaml               # OpenAPI/Swagger definition
│   └── er-diagram.png              # Entity-relationship diagram
│
├── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Environment Variables

Create a `.env` file in `server/` based on the template below. Never commit the actual `.env` file — only `.env.example` is tracked in version control.

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/digital-innovation-hub-mint

# Auth
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# File Storage (example: AWS S3)
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-central-1
AWS_S3_BUCKET=digital-innovation-hub-mint-documents
SIGNED_URL_EXPIRY_SECONDS=300

# Email (transactional notifications)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=no-reply@digital-innovation-hub-mint.et

# Client
CLIENT_URL=http://localhost:5173
```

## Installation & Setup

### Prerequisites

- Node.js v18 or later
- npm v9 or later
- A MongoDB Atlas cluster (or a local MongoDB instance for development)
- An AWS S3 bucket (or equivalent object storage) for Data Room documents
- An SMTP provider or transactional email API key for notifications

### Steps

1. Clone the repository:
   ```
   git clone https://github.com/<your-org>/digital-innovation-hub-mint.git
   cd digital-innovation-hub-mint
   ```

2. Install backend dependencies:
   ```
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../client
   npm install
   ```

4. Copy the environment template and fill in real values:
   ```
   cd ../server
   cp .env.example .env
   ```

5. Seed the database with an initial admin account:
   ```
   npm run seed:admin
   ```

## Running the Project

Run backend and frontend in separate terminals during development.

**Backend:**
```
cd server
npm run dev
```
The API will be available at `http://localhost:5000/api/v1`.

**Frontend:**
```
cd client
npm run dev
```
The app will be available at `http://localhost:5173`.

**Using Docker Compose (runs both services + MongoDB together):**
```
docker-compose up --build
```

## Testing Strategy

- **Backend unit tests**: Jest, covering controller logic and Mongoose model validation in isolation, with the database layer mocked.
- **Backend integration tests**: Supertest against a test MongoDB instance (e.g. `mongodb-memory-server`), covering full request/response cycles for auth, startup submission, and the access-request approval flow end-to-end.
- **Frontend component tests**: React Testing Library, covering role-guarded rendering (e.g. an investor never sees the "Approve" button), form validation, and the directory filter behavior.
- **Manual QA checklist**: covers the two full user flows documented above (Startup Verification Journey, Investor Deal-Flow Journey) before each release.

Run all backend tests:
```
cd server
npm test
```

Run all frontend tests:
```
cd client
npm test
```

## Deployment

1. Build the frontend for production: `cd client && npm run build`, producing a static `dist/` bundle.
2. Serve the built frontend either via a static host (e.g. Netlify, Vercel) or via the Express server itself in production mode.
3. Deploy the Express API to a container-friendly host (e.g. Render, Railway, or a self-managed VPS with Docker).
4. Set all production environment variables (see [Environment Variables](#environment-variables)) in the hosting platform's secret manager — never in source control.
5. Point `MONGODB_URI` to the production Atlas cluster, with IP allowlisting or VPC peering configured appropriately.
6. Configure the production CORS origin to the deployed frontend's exact domain.
7. Set up daily automated MongoDB Atlas backups.

## Project Roadmap

**Phase 1 (this internship deliverable):** Modules A–D as specified above — identity/onboarding, public directory, Data Room deal-flow, and MinT verification/analytics.

**Phase 2 (future extension, out of scope for this delivery):**
- In-platform messaging between founders and investors after an access grant
- Multilingual AI assistant to guide new users to the right MinT program
- Innovation competition submission and judging workflow
- Digital certificate issuance and QR-based verification for competition winners and training completions
- Mentor-matching module connecting startups with vetted industry mentors

## Team

This project is developed by a student team as part of an internship at the Ministry of Innovation and Technology (MinT), Ethiopia.

## License

This project is released under the MIT License. See the `LICENSE` file for full terms.
