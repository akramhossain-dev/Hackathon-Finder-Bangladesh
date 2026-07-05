# Database — Hackathon Finder Bangladesh

## 1. Overview

The platform uses **MongoDB** via the **Mongoose** ODM. All collections are hosted on **MongoDB Atlas**. This document defines the schema, field types, indexes, relationships, and sample documents for every collection used by the platform.

---

## 2. Enum Reference

These enum values must be used consistently across the codebase.

| Enum | Values |
|------|--------|
| `EventType` | `hackathon`, `coding contest`, `ideathon`, `innovation challenge` |
| `EventMode` | `online`, `offline`, `hybrid` |
| `EventStatus` | `draft`, `published`, `archived`, `pending_review` |
| `UserRole` | `guest`, `user`, `admin` |
| `SubmissionStatus` | `pending`, `approved`, `rejected` |
| `ReminderTrigger` | `registration_deadline`, `event_start` |
| `NotificationType` | `reminder_fired`, `submission_approved`, `submission_rejected` |
| `JobStatus` | `queued`, `running`, `completed`, `failed` |
| `SourceType` | `html_scrape`, `rss_feed`, `api_endpoint` |

---

## 3. Collections

---

### 3.1 `users`

**Purpose:** Stores all registered user accounts and their role.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | Primary key |
| `name` | String | ✅ | — | Display name |
| `email` | String | ✅ | — | Unique, lowercase |
| `passwordHash` | String | ✅ | — | bcrypt hash; never returned in responses |
| `role` | String (enum) | ✅ | `user` | `user` or `admin` |
| `avatar` | String | ❌ | `null` | URL to avatar image |
| `refreshTokenHash` | String | ❌ | `null` | Hashed current refresh token |
| `isActive` | Boolean | ✅ | `true` | Soft-disable accounts |
| `createdAt` | Date | auto | now | Mongoose timestamps |
| `updatedAt` | Date | auto | now | Mongoose timestamps |

**Indexes:**
- `{ email: 1 }` — unique
- `{ role: 1 }` — for admin queries

**Sample Document:**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Rafiq Ahmed",
  "email": "rafiq@example.com",
  "passwordHash": "$2b$12$...",
  "role": "user",
  "avatar": null,
  "refreshTokenHash": "$2b$12$...",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

### 3.2 `hackathons`

**Purpose:** The core collection storing all hackathon and competition events.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | Primary key |
| `name` | String | ✅ | — | Event name |
| `slug` | String | ✅ | — | URL-safe unique slug |
| `description` | String | ✅ | — | Full event description (Markdown) |
| `shortDescription` | String | ✅ | — | 1–2 sentence summary for cards |
| `eventType` | String (enum) | ✅ | — | `EventType` enum |
| `mode` | String (enum) | ✅ | — | `EventMode` enum |
| `status` | String (enum) | ✅ | `draft` | `EventStatus` enum |
| `isFeatured` | Boolean | ✅ | `false` | Pinned to top of listing |
| `organizer` | ObjectId (ref: organizers) | ✅ | — | Reference |
| `categories` | [ObjectId] (ref: categories) | ✅ | `[]` | Array of category refs |
| `tags` | [String] | ❌ | `[]` | Free-form tags for search |
| `city` | String | ❌ | `null` | City (for offline/hybrid events) |
| `venue` | String | ❌ | `null` | Venue address or name |
| `bannerImageUrl` | String | ❌ | `null` | URL to event banner |
| `websiteUrl` | String | ❌ | `null` | Official event website |
| `registrationUrl` | String | ❌ | `null` | Registration link |
| `registrationDeadline` | Date | ❌ | `null` | Deadline to register |
| `eventStartDate` | Date | ❌ | `null` | Event start date |
| `eventEndDate` | Date | ❌ | `null` | Event end date |
| `teamSizeMin` | Number | ❌ | `1` | Minimum team size |
| `teamSizeMax` | Number | ❌ | `null` | Maximum team size (null = unlimited) |
| `hasPrize` | Boolean | ✅ | `false` | Whether prizes are offered |
| `prizeDetails` | String | ❌ | `null` | Prize pool description |
| `eligibility` | String | ❌ | `null` | Who can participate |
| `sourceUrl` | String | ❌ | `null` | Original URL (for imported events) |
| `importedBy` | ObjectId (ref: sourceConfigs) | ❌ | `null` | Which source imported this |
| `submittedBy` | ObjectId (ref: users) | ❌ | `null` | Which user submitted this |
| `createdAt` | Date | auto | now | |
| `updatedAt` | Date | auto | now | |

**Indexes:**
- `{ slug: 1 }` — unique
- `{ status: 1, registrationDeadline: 1 }` — listing queries
- `{ organizer: 1 }` — organizer event queries
- `{ categories: 1 }` — category filter
- `{ mode: 1, city: 1 }` — mode/city filter
- `{ eventType: 1 }` — event type filter
- `{ isFeatured: 1, status: 1 }` — featured listing
- `{ name: "text", description: "text", tags: "text" }` — full-text search

**Sample Document:**
```json
{
  "_id": "64b2c3d4e5f6a7b8c9d0e1f2",
  "name": "DIU Hackathon 2025",
  "slug": "diu-hackathon-2025",
  "shortDescription": "48-hour hackathon at Daffodil International University.",
  "eventType": "hackathon",
  "mode": "offline",
  "status": "published",
  "isFeatured": true,
  "organizer": "64c3d4e5f6a7b8c9d0e1f2a3",
  "categories": ["64d4e5f6a7b8c9d0e1f2a3b4"],
  "tags": ["48-hour", "university", "dhaka"],
  "city": "Dhaka",
  "venue": "DIU Campus, Ashulia",
  "registrationDeadline": "2025-03-01T23:59:59Z",
  "eventStartDate": "2025-03-15T09:00:00Z",
  "eventEndDate": "2025-03-17T09:00:00Z",
  "teamSizeMin": 2,
  "teamSizeMax": 4,
  "hasPrize": true,
  "prizeDetails": "First prize: BDT 1,00,000",
  "registrationUrl": "https://forms.gle/...",
  "websiteUrl": "https://diu.edu.bd/hackathon-2025",
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-10T08:00:00Z"
}
```

---

### 3.3 `organizers`

**Purpose:** Stores event organizer profiles (universities, companies, NGOs).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | Organizer name |
| `slug` | String | ✅ | — | Unique URL slug |
| `description` | String | ❌ | `null` | About the organizer |
| `logoUrl` | String | ❌ | `null` | Logo image URL |
| `websiteUrl` | String | ❌ | `null` | Official website |
| `email` | String | ❌ | `null` | Contact email |
| `socialLinks` | Object | ❌ | `{}` | `{ facebook, linkedin, twitter }` |
| `createdAt` | Date | auto | now | |
| `updatedAt` | Date | auto | now | |

**Indexes:**
- `{ slug: 1 }` — unique
- `{ name: "text" }` — text search

---

### 3.4 `categories`

**Purpose:** Stores event categories used for filtering (e.g., AI/ML, FinTech).

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | Category label |
| `slug` | String | ✅ | — | Unique slug |
| `description` | String | ❌ | `null` | Short description |
| `createdAt` | Date | auto | now | |

**Indexes:**
- `{ slug: 1 }` — unique

---

### 3.5 `bookmarks`

**Purpose:** Tracks which hackathons a user has bookmarked.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `user` | ObjectId (ref: users) | ✅ | — | |
| `hackathon` | ObjectId (ref: hackathons) | ✅ | — | |
| `createdAt` | Date | auto | now | |

**Indexes:**
- `{ user: 1, hackathon: 1 }` — unique compound (prevents duplicates)
- `{ user: 1 }` — user's bookmark list

---

### 3.6 `reminders`

**Purpose:** Stores user-configured reminders linked to hackathon events.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `user` | ObjectId (ref: users) | ✅ | — | |
| `hackathon` | ObjectId (ref: hackathons) | ✅ | — | |
| `trigger` | String (enum) | ✅ | — | `ReminderTrigger` enum |
| `offsetHours` | Number | ✅ | — | Hours before trigger to fire |
| `scheduledAt` | Date | ✅ | — | Computed fire time |
| `bullJobId` | String | ❌ | `null` | BullMQ job ID for cancellation |
| `fired` | Boolean | ✅ | `false` | Whether the job has fired |
| `createdAt` | Date | auto | now | |

**Indexes:**
- `{ user: 1 }` — user's reminders
- `{ user: 1, hackathon: 1, trigger: 1 }` — unique per trigger type per user per event

---

### 3.7 `submissions`

**Purpose:** Community-submitted hackathon suggestions pending admin review.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `submittedBy` | ObjectId (ref: users) | ✅ | — | |
| `status` | String (enum) | ✅ | `pending` | `SubmissionStatus` enum |
| `name` | String | ✅ | — | Proposed event name |
| `description` | String | ✅ | — | |
| `eventType` | String (enum) | ✅ | — | |
| `mode` | String (enum) | ✅ | — | |
| `organizer` | String | ✅ | — | Free-text organizer name |
| `city` | String | ❌ | `null` | |
| `websiteUrl` | String | ❌ | `null` | |
| `registrationUrl` | String | ❌ | `null` | |
| `registrationDeadline` | Date | ❌ | `null` | |
| `eventStartDate` | Date | ❌ | `null` | |
| `reviewedBy` | ObjectId (ref: users) | ❌ | `null` | Admin who reviewed |
| `reviewNote` | String | ❌ | `null` | Admin note on rejection |
| `reviewedAt` | Date | ❌ | `null` | |
| `resultHackathon` | ObjectId (ref: hackathons) | ❌ | `null` | Created hackathon on approval |
| `createdAt` | Date | auto | now | |
| `updatedAt` | Date | auto | now | |

**Indexes:**
- `{ submittedBy: 1 }` — user's submissions
- `{ status: 1 }` — admin review queue

---

### 3.8 `notifications`

**Purpose:** In-app notification records delivered to users.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `user` | ObjectId (ref: users) | ✅ | — | Recipient |
| `type` | String (enum) | ✅ | — | `NotificationType` enum |
| `message` | String | ✅ | — | Human-readable message |
| `isRead` | Boolean | ✅ | `false` | |
| `relatedHackathon` | ObjectId (ref: hackathons) | ❌ | `null` | Linked event |
| `relatedSubmission` | ObjectId (ref: submissions) | ❌ | `null` | Linked submission |
| `createdAt` | Date | auto | now | |

**Indexes:**
- `{ user: 1, isRead: 1 }` — unread notifications
- `{ user: 1, createdAt: -1 }` — notification list (newest first)

---

### 3.9 `sourceConfigs`

**Purpose:** Configuration for each external source used by the scraping/import pipeline.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | Human-readable source label |
| `url` | String | ✅ | — | Target URL |
| `sourceType` | String (enum) | ✅ | — | `SourceType` enum |
| `isActive` | Boolean | ✅ | `true` | Whether scraping is enabled |
| `cronSchedule` | String | ❌ | `null` | Cron expression for auto-runs |
| `adapterConfig` | Object | ❌ | `{}` | Adapter-specific settings (CSS selectors, etc.) |
| `lastRunAt` | Date | ❌ | `null` | Timestamp of last job execution |
| `createdAt` | Date | auto | now | |
| `updatedAt` | Date | auto | now | |

---

### 3.10 `jobLogs`

**Purpose:** Records the outcome of each scraping/import job execution.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `source` | ObjectId (ref: sourceConfigs) | ✅ | — | |
| `status` | String (enum) | ✅ | — | `JobStatus` enum |
| `startedAt` | Date | ✅ | — | |
| `completedAt` | Date | ❌ | `null` | |
| `itemsFound` | Number | ❌ | `0` | Raw items extracted |
| `itemsCreated` | Number | ❌ | `0` | New records created |
| `itemsSkipped` | Number | ❌ | `0` | Duplicates skipped |
| `errors` | [String] | ❌ | `[]` | Array of error messages |
| `triggeredBy` | String | ✅ | — | `cron` or `manual` |
| `triggeredByUser` | ObjectId (ref: users) | ❌ | `null` | Admin who triggered manually |
| `createdAt` | Date | auto | now | |

---

## 4. Indexing Strategy Summary

| Collection | Key Indexes |
|------------|-------------|
| `users` | email (unique), role |
| `hackathons` | slug (unique), status+deadline, organizer, categories, mode+city, text |
| `organizers` | slug (unique), name (text) |
| `categories` | slug (unique) |
| `bookmarks` | user+hackathon (unique), user |
| `reminders` | user, user+hackathon+trigger (unique) |
| `submissions` | submittedBy, status |
| `notifications` | user+isRead, user+createdAt |
| `sourceConfigs` | isActive |
| `jobLogs` | source, startedAt |

---

## 5. Data Consistency Rules

- **Deletion protection**: Deleting an `organizer` is blocked if any `hackathon` references it. Same for `categories`.
- **Cascade on user deletion**: Bookmarks, reminders, notifications, and submissions for the user must be deleted when a user account is removed.
- **Unique submissions**: A user may have multiple submissions, but not two `pending` submissions for the same event URL.
- **Slug uniqueness**: Slugs for `hackathons`, `organizers`, and `categories` are unique and enforced at the schema level with a unique index.
- **Reminder uniqueness**: A user can only have one active reminder per `(hackathon, trigger)` combination.
- **Status transitions**: A hackathon may transition `draft → published → archived`. An imported event starts as `pending_review`.
