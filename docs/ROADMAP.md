# Roadmap — Hackathon Finder Bangladesh

## Overview

This roadmap defines the phased implementation plan for building the Hackathon Finder Bangladesh platform from the ground up. Each phase has clear objectives, deliverables, and dependencies. Phases build on each other sequentially; however, independent sub-tasks within a phase may be developed in parallel.

---

## Phase 1 — Project Setup and Foundations

**Objective**: Establish the full-stack project skeleton, tooling, and development environment so that all subsequent phases can build on a consistent foundation.

### Deliverables

**Backend**
- [ ] Initialize Node.js + TypeScript project with Express.js
- [ ] Configure `tsconfig.json`, `eslint`, `prettier`
- [ ] Implement environment variable loading and validation with Zod (`config/env.ts`)
- [ ] Connect to MongoDB Atlas with Mongoose (`config/db.ts`)
- [ ] Connect to Redis (Upstash) with `ioredis` (`config/redis.ts`)
- [ ] Implement global error handler middleware (`ApiError`, `ApiResponse` classes)
- [ ] Implement health check endpoint: `GET /api/v1/health`
- [ ] Set up `helmet`, `cors`, `morgan`, `express-rate-limit`
- [ ] Set up folder structure: `routes/`, `controllers/`, `services/`, `models/`, `middleware/`, `queues/`

**Frontend**
- [ ] Initialize Next.js project with TypeScript and App Router
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up `lib/api.ts` (Axios instance with base URL + interceptors)
- [ ] Create base layout: Navbar, Footer
- [ ] Configure `NEXT_PUBLIC_API_URL` and environment handling

**Shared**
- [ ] Set up GitHub repository with branch protection on `main`
- [ ] Create `.env.example` for both frontend and backend
- [ ] Create `README.md` with setup instructions

### Dependencies
- MongoDB Atlas cluster provisioned
- Redis (Upstash) instance created
- Vercel project connected to GitHub repo

---

## Phase 2 — Core Data Models and Backend Foundations

**Objective**: Define and implement all Mongoose models, seed initial reference data, and build the validation middleware layer.

### Deliverables

- [ ] Implement all Mongoose models: `User`, `Hackathon`, `Organizer`, `Category`, `Bookmark`, `Reminder`, `Submission`, `Notification`, `SourceConfig`, `JobLog`
- [ ] Define indexes for all collections as specified in DATABASE.md
- [ ] Implement `validate` middleware using Zod schemas for all request bodies
- [ ] Implement `authenticate` and `authorize` middleware
- [ ] Write Zod schemas for all request bodies (auth, hackathon, organizer, category, bookmark, reminder, submission)
- [ ] Implement slug generation utility (`utils/slug.ts`)
- [ ] Create database seeder script: seed 3–5 categories, 2–3 organizers, 5 sample hackathons
- [ ] Write unit tests for Zod schemas and utility functions

### Dependencies
- Phase 1 complete

---

## Phase 3 — Public Hackathon Listing and Details

**Objective**: Build the full public-facing hackathon discovery experience: listing, search, filtering, detail pages, and organizer pages.

### Deliverables

**Backend**
- [ ] `GET /api/v1/hackathons` — paginated listing with all filters and full-text search
- [ ] `GET /api/v1/hackathons/:slug` — single event detail with populated organizer + categories
- [ ] `GET /api/v1/organizers` — organizer list
- [ ] `GET /api/v1/organizers/:slug` — organizer profile with their events
- [ ] `GET /api/v1/categories` — category list

**Frontend**
- [ ] Home page with hackathon listing grid/list view
- [ ] Search input with debounced query
- [ ] Filter panel: event type, mode, city, category, organizer, deadline range, has prize
- [ ] Filter state serialized to URL query params
- [ ] Pagination component
- [ ] `HackathonCard` component
- [ ] Hackathon detail page (`/hackathons/[slug]`)
- [ ] Organizer profile page (`/organizers/[slug]`)
- [ ] Proper `<head>` meta tags (title, description, OG tags) on listing and detail pages
- [ ] Loading skeletons and empty states

### Dependencies
- Phase 2 complete (models and seeded data)

---

## Phase 4 — Auth and User Dashboard

**Objective**: Implement the complete authentication flow and the user-facing dashboard (bookmarks, reminders, profile).

### Deliverables

**Backend**
- [ ] `POST /auth/register`
- [ ] `POST /auth/login`
- [ ] `POST /auth/refresh`
- [ ] `POST /auth/logout`
- [ ] `GET /users/me`
- [ ] `PATCH /users/me`
- [ ] `PATCH /users/me/password`
- [ ] `GET /bookmarks`, `POST /bookmarks`, `DELETE /bookmarks/:hackathonId`, `GET /bookmarks/check/:hackathonId`
- [ ] BullMQ reminder queue setup (`queues/reminder.queue.ts`, `queues/reminder.worker.ts`)
- [ ] `GET /reminders`, `POST /reminders`, `DELETE /reminders/:reminderId`
- [ ] `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- [ ] Reminder worker: creates notification document on job fire

**Frontend**
- [ ] Register page (`/register`)
- [ ] Login page (`/login`)
- [ ] Auth store (Zustand or Context) holding access token in memory
- [ ] Axios response interceptor for silent token refresh on 401
- [ ] Protected route wrapper component
- [ ] User dashboard layout with sidebar navigation
- [ ] Bookmarks page (`/dashboard/bookmarks`)
- [ ] Bookmark toggle button on HackathonCard (filled/unfilled state)
- [ ] Reminders page (`/dashboard/reminders`)
- [ ] Profile page (`/dashboard/profile`) — view and edit name, avatar, password
- [ ] Notification dropdown in Navbar with unread count badge

### Dependencies
- Phase 2 (models), Phase 3 (hackathon detail page for bookmark button)

---

## Phase 5 — Admin Panel Core

**Objective**: Build the complete admin management interface for hackathons, organizers, and categories.

### Deliverables

**Backend**
- [ ] `POST /admin/hackathons`
- [ ] `PATCH /admin/hackathons/:id`
- [ ] `PATCH /admin/hackathons/:id/status`
- [ ] `PATCH /admin/hackathons/:id/feature`
- [ ] `DELETE /admin/hackathons/:id` (with cascade to bookmarks/reminders)
- [ ] `POST /admin/organizers`, `PATCH /admin/organizers/:id`, `DELETE /admin/organizers/:id`
- [ ] `POST /admin/categories`, `PATCH /admin/categories/:id`, `DELETE /admin/categories/:id`
- [ ] Admin analytics endpoint: `GET /admin/stats`
- [ ] Admin seeder script to create first admin user

**Frontend**
- [ ] Admin route group (`/admin/*`) with admin-only route guard
- [ ] Admin layout with sidebar
- [ ] Dashboard overview page with stats cards
- [ ] Hackathon management: list, create, edit, delete, status actions
- [ ] Organizer management: list, create, edit, delete
- [ ] Category management: list, create, edit, delete
- [ ] Confirmation dialogs for all delete actions
- [ ] Slug auto-generation with manual override in forms

### Dependencies
- Phase 4 (auth middleware complete)

---

## Phase 6 — Reminders and Notifications

**Objective**: Complete the reminder pipeline with email delivery and improve the in-app notification experience.

### Deliverables

**Backend**
- [ ] Integrate email provider (Resend SDK)
- [ ] Implement email template for reminder notification
- [ ] Extend reminder worker to send email after creating notification document
- [ ] Handle edge cases: hackathon deleted after reminder set, past scheduled times

**Frontend**
- [ ] Full notifications page (`/dashboard/notifications`) with paginated list
- [ ] Real-time unread count update after marking as read
- [ ] Reminder form with trigger type selector (deadline vs start date) and offset selector

### Dependencies
- Phase 4 (reminder queue operational), Email provider configured

---

## Phase 7 — Submissions and Moderation

**Objective**: Build the user submission flow and the admin review queue.

### Deliverables

**Backend**
- [ ] `GET /submissions/mine`, `POST /submissions`, `PATCH /submissions/:id`, `DELETE /submissions/:id`
- [ ] `GET /admin/submissions`, `GET /admin/submissions/:id`
- [ ] `POST /admin/submissions/:id/approve` (creates hackathon, notifies submitter)
- [ ] `POST /admin/submissions/:id/reject` (notifies submitter)
- [ ] Notification creation on approval and rejection

**Frontend**
- [ ] Submit hackathon page (`/dashboard/submissions/new`)
- [ ] My submissions page (`/dashboard/submissions`) with status badges
- [ ] Admin submission queue page (`/admin/submissions`) with Pending/Approved/Rejected tabs
- [ ] Admin submission review page with approve and reject actions
- [ ] Pre-populated edit form shown to admin before approving

### Dependencies
- Phase 5 (admin panel), Phase 6 (notification system)

---

## Phase 8 — Scraping and Import System

**Objective**: Build the semi-automated data import pipeline with admin monitoring.

### Deliverables

**Backend**
- [ ] BullMQ import queue and worker (`queues/import.queue.ts`, `queues/import.worker.ts`)
- [ ] Scraper runner with robots.txt check and User-Agent header
- [ ] `html_scrape` adapter using Cheerio
- [ ] `rss_feed` adapter using `rss-parser`
- [ ] `api_endpoint` adapter using `axios`
- [ ] Normalization layer with Zod schema validation
- [ ] Duplicate detection (sourceUrl match + title+date fingerprint)
- [ ] Quality score computation
- [ ] Job log creation on every run
- [ ] Admin source config CRUD: `GET/POST /admin/sources`, `PATCH /admin/sources/:id`
- [ ] `POST /admin/sources/:id/run` (manual trigger)
- [ ] `GET /admin/sources/:id/logs` (paginated job logs)
- [ ] Optional: cron-based auto-scheduling using `node-cron` or BullMQ's `repeat` feature

**Frontend**
- [ ] Source configs page (`/admin/jobs/sources`)
- [ ] Source config create/edit form
- [ ] Job logs page (`/admin/jobs/logs`) with filters
- [ ] Run Now button with status polling
- [ ] Import tab in submission review queue for `pending_review` imported records

### Dependencies
- Phase 5 (admin panel), Phase 7 (submission review workflow for imported record moderation)

---

## Phase 9 — Hardening, Optimization, and Polish

**Objective**: Prepare the platform for production quality: performance, security audit, SEO completeness, and UX polish.

### Deliverables

**Performance**
- [ ] Add ISR (`revalidate`) to hackathon listing and detail pages
- [ ] Implement MongoDB query profiling and add missing indexes
- [ ] Audit and optimize N+1 queries (use `populate` selectively, avoid over-fetching)
- [ ] Add response compression (`compression` middleware on backend)
- [ ] Lazy-load heavy components on frontend

**Security**
- [ ] Full security audit against SECURITY.md checklist
- [ ] Verify all admin routes are protected at API level (not just UI)
- [ ] Penetration test auth flows (refresh token rotation, brute force)
- [ ] Review and tighten CSP headers
- [ ] Ensure no sensitive fields leak in any response payload

**SEO and Accessibility**
- [ ] Verify `sitemap.xml` generation for all published hackathon pages
- [ ] Verify `robots.txt` configuration
- [ ] Run Lighthouse audit; address score below 90 for Performance and SEO
- [ ] Add `aria-label` and keyboard navigation to interactive components

**Testing**
- [ ] Backend: integration tests for all auth flows
- [ ] Backend: integration tests for hackathon CRUD and filtering
- [ ] Backend: integration tests for submission approval/rejection
- [ ] Frontend: E2E tests (Playwright) for critical user journeys: register → bookmark → set reminder

**Documentation**
- [ ] Update all docs to reflect any implementation changes
- [ ] Write `CONTRIBUTING.md` with code style guide and PR process
- [ ] Record a short demo video

### Dependencies
- All previous phases complete

---

## Phase Summary Table

| Phase | Name | Key Output |
|-------|------|------------|
| 1 | Project Setup | Working skeleton, connected to DB and Redis |
| 2 | Data Models | All Mongoose models, Zod schemas, seeded data |
| 3 | Public Listing | Browsable, filterable, searchable hackathon directory |
| 4 | Auth + Dashboard | Login, bookmarks, reminders, notifications |
| 5 | Admin Panel | Full CRUD for events, organizers, categories |
| 6 | Reminders + Email | Email delivery for reminders |
| 7 | Submissions | Community submission + admin moderation |
| 8 | Import Pipeline | Semi-automated event ingestion from external sources |
| 9 | Hardening | Production-ready: performance, security, SEO, tests |
