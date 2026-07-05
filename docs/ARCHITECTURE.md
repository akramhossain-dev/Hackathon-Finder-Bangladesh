# Architecture — Hackathon Finder Bangladesh

## 1. System Architecture Overview

Hackathon Finder Bangladesh follows a **decoupled client-server architecture** with three primary tiers:

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT TIER                        │
│          Next.js (SSR + CSR)  ·  Tailwind CSS           │
│                   shadcn/ui components                   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS (REST API)
┌──────────────────────────▼──────────────────────────────┐
│                     SERVER TIER                         │
│              Express.js REST API (Node.js)              │
│         Auth Middleware · Zod Validation Layer          │
│         BullMQ Workers (reminders / import jobs)        │
└──────────┬─────────────────────────────┬────────────────┘
           │                             │
┌──────────▼──────────┐    ┌─────────────▼──────────────┐
│    DATA TIER        │    │      CACHE / QUEUE TIER     │
│  MongoDB Atlas      │    │      Redis (Upstash)        │
│  (Mongoose ODM)     │    │   BullMQ job queues         │
└─────────────────────┘    └────────────────────────────┘
```

### Tier Responsibilities

| Tier | Technology | Responsibility |
|------|-----------|----------------|
| **Frontend** | Next.js, Tailwind, shadcn/ui | UI rendering, routing, user interaction, token management |
| **Backend API** | Express.js, Mongoose | Business logic, auth, CRUD, validation, queue dispatch |
| **Database** | MongoDB Atlas | Persistent storage for all collections |
| **Cache/Queue** | Redis + BullMQ | Reminder scheduling, import job queues |

---

## 2. Frontend Architecture

The frontend is a **Next.js** application using the App Router.

### Rendering Strategy

| Page Type | Strategy | Reason |
|-----------|----------|--------|
| Hackathon listing | SSR + ISR | SEO + freshness |
| Hackathon detail | SSR + ISR | SEO per event |
| Organizer profile | SSR + ISR | SEO |
| User dashboard | CSR (client component) | Auth-gated, no SEO requirement |
| Admin panel | CSR | Auth-gated, no SEO requirement |
| Auth pages | CSR | No SEO requirement |

### Frontend Module Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (public)/               # Guest-accessible routes
│   │   ├── page.tsx            # Home / listing
│   │   ├── hackathons/[slug]/  # Event detail
│   │   └── organizers/[slug]/  # Organizer profile
│   ├── (auth)/                 # Auth routes
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/              # Authenticated user routes
│   │   ├── bookmarks/
│   │   ├── reminders/
│   │   ├── submissions/
│   │   └── profile/
│   └── admin/                  # Admin routes
│       ├── hackathons/
│       ├── organizers/
│       ├── categories/
│       ├── submissions/
│       └── jobs/
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── hackathon/              # HackathonCard, HackathonFilter, etc.
│   ├── layout/                 # Navbar, Footer, Sidebar
│   └── admin/                  # Admin-specific components
├── lib/
│   ├── api.ts                  # Axios/fetch API client
│   ├── auth.ts                 # Token handling utilities
│   └── validators/             # Zod schemas (client-side mirror)
├── hooks/                      # Custom React hooks
├── store/                      # Global state (Context or Zustand)
└── types/                      # TypeScript type definitions
```

### Auth Token Handling (Frontend)

- **Access token** stored in memory (React state / Zustand store). Never written to `localStorage`.
- **Refresh token** stored in an `HttpOnly` cookie set by the backend.
- On app load, a `/auth/refresh` call is made silently to rehydrate the access token.
- All API calls include the access token in the `Authorization: Bearer <token>` header.
- A response interceptor handles 401 errors by attempting a token refresh before retrying the original request.

---

## 3. Backend Architecture

The backend is a **Node.js + Express.js** REST API.

### Backend Module Structure

```
src/
├── server.ts                   # Express app entry point
├── config/
│   ├── db.ts                   # Mongoose connection
│   ├── redis.ts                # Redis/BullMQ connection
│   └── env.ts                  # Environment variable loader (Zod-validated)
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── hackathon.routes.ts
│   ├── organizer.routes.ts
│   ├── category.routes.ts
│   ├── bookmark.routes.ts
│   ├── reminder.routes.ts
│   ├── submission.routes.ts
│   ├── notification.routes.ts
│   └── admin/
│       ├── hackathon.admin.routes.ts
│       ├── organizer.admin.routes.ts
│       ├── category.admin.routes.ts
│       ├── submission.admin.routes.ts
│       └── job.admin.routes.ts
├── controllers/                # Request handlers (thin layer)
├── services/                   # Business logic
├── models/                     # Mongoose models
├── middleware/
│   ├── authenticate.ts         # JWT verification
│   ├── authorize.ts            # Role-based access control
│   ├── validate.ts             # Zod schema validation
│   ├── rateLimiter.ts          # express-rate-limit middleware
│   └── errorHandler.ts        # Global error handler
├── queues/
│   ├── reminder.queue.ts       # BullMQ queue for reminders
│   ├── reminder.worker.ts      # BullMQ worker
│   ├── import.queue.ts         # BullMQ queue for scraping jobs
│   └── import.worker.ts        # BullMQ import worker
├── scrapers/
│   ├── runner.ts               # Scraping orchestrator
│   └── adapters/               # Per-source extraction adapters
└── utils/
    ├── ApiError.ts
    ├── ApiResponse.ts
    └── slug.ts
```

### Middleware Stack (per request)

```
Request
  → CORS
  → Helmet
  → Rate Limiter
  → Body Parser
  → Route Matching
      → authenticate (if protected)
      → authorize (role check)
      → validate (Zod)
      → Controller
          → Service
              → Model (MongoDB)
          → Response
  → errorHandler (catches thrown ApiError)
```

---

## 4. Request Lifecycle Overview

### Public Request (e.g., browsing hackathons)

```
Browser → Next.js SSR → fetch /api/v1/hackathons → Express
                                                       → authenticate (skip)
                                                       → HackathonController
                                                       → HackathonService
                                                       → Hackathon.find(...)
                                                       → JSON Response
                      ← rendered HTML with data ←
```

### Authenticated Request (e.g., bookmark)

```
Browser → POST /api/v1/bookmarks
  Authorization: Bearer <accessToken>
        │
        ▼
  authenticate middleware
    → verify JWT signature
    → check expiry
    → attach req.user = { _id, role }
        │
        ▼
  authorize(['user', 'admin'])
    → check req.user.role
        │
        ▼
  validate (Zod)
    → check body: { hackathonId }
        │
        ▼
  BookmarkController → BookmarkService → Bookmark.create(...)
        │
        ▼
  201 Response: { success: true, data: { bookmark } }
```

---

## 5. Authentication Flow (Architecture Level)

```
[Register]
  POST /auth/register
  → Zod validate → hash password (bcrypt)
  → Save user → Issue token pair
  → Set HttpOnly cookie (refresh token)
  → Return access token in body

[Login]
  POST /auth/login
  → Zod validate → lookup user → bcrypt.compare
  → Issue token pair → rotate refresh token
  → Set HttpOnly cookie → return access token

[Silent Refresh]
  POST /auth/refresh (on 401 or app load)
  → Read HttpOnly cookie → validate hash
  → Issue new token pair → rotate
  → Return new access token

[Logout]
  POST /auth/logout
  → Clear refreshTokenHash in DB
  → Clear HttpOnly cookie
  → Client clears in-memory access token
```

See `AUTH.md` for the complete token strategy.

---

## 6. Reminder System Flow

```
User sets reminder
  POST /api/v1/reminders { hackathonId, trigger, offsetHours }
          │
          ├─ Save reminder document to MongoDB
          │    { scheduledAt = targetDate - offsetHours }
          │
          └─ Add delayed job to BullMQ reminder queue
               delay = scheduledAt - Date.now()
                    │
                    │  (time passes...)
                    ▼
             [BullMQ Worker fires job]
                    │
                    ├─ Create notification document in MongoDB
                    │    { user, type: 'reminder_fired', message, relatedHackathon }
                    │
                    └─ (Phase 6) Send email via email provider
```

---

## 7. Scraping and Import Pipeline Flow

```
Trigger: manual (admin) OR cron (BullMQ repeat)
          │
          ▼
[BullMQ import queue]
  job payload: { sourceConfigId }
          │
          ▼
[Import Worker]
  1. Load sourceConfig
  2. Check isActive
  3. Fetch page / feed / API endpoint
  4. Run source adapter (html_scrape / rss_feed / api_endpoint)
  5. Normalize extracted data (Zod schema)
  6. Duplicate check (sourceUrl + title/date fingerprint)
  7. Create hackathon { status: 'pending_review' } for new records
  8. Write jobLog document
  9. Update sourceConfig.lastRunAt
```

See `SCRAPING_AND_IMPORT.md` for full details.

---

## 8. Admin Workflow Overview

```
Admin (role: 'admin') authenticated
          │
          ├─ Hackathon CRUD (/admin/hackathons)
          │    Create → draft → publish → archive
          │    Feature toggle, slug management
          │
          ├─ Organizer CRUD (/admin/organizers)
          │    Deletion blocked if referenced by events
          │
          ├─ Category CRUD (/admin/categories)
          │    Deletion blocked if referenced by events
          │
          ├─ Submission Review (/admin/submissions)
          │    Pending queue → Review → Edit + Approve (creates hackathon)
          │                          → Reject (notifies submitter)
          │
          └─ Job Monitoring (/admin/jobs) [Phase 8]
               Source configs → Run Now / scheduled
               Job logs → inspect errors, item counts
```

---

## 9. Storage and Service Dependencies

| Service | Purpose | Provider |
|---------|---------|---------|
| MongoDB Atlas | Primary database for all collections | Atlas cloud |
| Redis (Upstash) | BullMQ job queues for reminders and import jobs | Upstash |
| Email (Resend) | Transactional reminder emails | Resend API |
| Vercel | Frontend hosting with SSR/ISR | Vercel |
| VPS / Railway | Backend API + worker hosting | Self-hosted or Railway |

---

## 10. Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST | Simpler than GraphQL for this scope |
| SSR framework | Next.js App Router | Built-in SSR/ISR, great SEO, strong ecosystem |
| Job queue | BullMQ + Redis | Reliable delayed jobs, retry support, good DX |
| Validation | Zod (both ends) | Single schema source for runtime + type safety |
| ORM | Mongoose | Mature, schema-based, good TypeScript support |
| Refresh token storage | HttpOnly cookie | Prevents XSS access to refresh token |
| Access token storage | In-memory only | No XSS exposure; refreshed silently on load |
| Worker separation | Separate process | API server crash does not affect job queue and vice versa |
