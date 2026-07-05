# Admin Panel — Hackathon Finder Bangladesh

## 1. Overview

The Admin Panel is the internal management interface for platform operators. It is accessible only to users with `role === 'admin'`. The panel is built as a protected section of the Next.js frontend (`/admin/*`) and communicates with the backend via the `/api/v1/admin/*` route group.

All admin routes on both the frontend and backend enforce authentication and role authorization. Frontend route guards redirect non-admin users to the home page. Backend middleware (`authenticate` + `authorize(['admin'])`) enforces the same at the API level — UI exclusion alone is not a security control.

---

## 2. Admin Dashboard Goals

| Goal | Description |
|------|-------------|
| **Single interface** | Provide one place to manage all platform content |
| **Clear workflow** | Guide admins through creation, review, and publishing steps |
| **Auditable actions** | All destructive or significant actions are reflected in logs or document fields |
| **Efficiency** | Common operations (publish, archive, feature) require minimal clicks |
| **Data integrity** | Deletion is blocked where referential integrity would be violated |

---

## 3. Admin Dashboard Modules

The admin panel is divided into the following modules, each accessible from the sidebar:

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard (Overview) | `/admin` | Summary stats and quick links |
| Hackathon Management | `/admin/hackathons` | CRUD for all hackathon events |
| Organizer Management | `/admin/organizers` | CRUD for organizer profiles |
| Category Management | `/admin/categories` | CRUD for event categories |
| Submission Review | `/admin/submissions` | Review user-submitted hackathons |
| Job Monitoring | `/admin/jobs` | Scraping/import job logs and source configs |

---

## 4. Dashboard Overview Page

The overview page (`/admin`) displays a summary of key platform metrics:

| Metric | Source |
|--------|--------|
| Total published hackathons | Count of `hackathons` with `status: published` |
| Total draft hackathons | Count of `hackathons` with `status: draft` |
| Total archived hackathons | Count of `hackathons` with `status: archived` |
| Pending submissions | Count of `submissions` with `status: pending` |
| Total organizers | Count of `organizers` collection |
| Total categories | Count of `categories` collection |
| Recent hackathons | Last 5 created hackathons |
| Recent submissions | Last 5 pending submissions |

These metrics are fetched from aggregation-backed admin-only endpoints and are not cached on the client (always fresh on navigation).

---

## 5. Hackathon Management

### 5.1 Hackathon List View (`/admin/hackathons`)

- Displays all hackathons in a sortable table regardless of status (draft, published, archived, pending_review).
- Columns: Name, Event Type, Mode, Status, Featured, Organizer, Deadline, Actions.
- Filters: status, event type, mode, organizer.
- Search: keyword search by name.
- Pagination: server-side, 20 items per page.

### 5.2 Create Hackathon (`/admin/hackathons/new`)

The creation form collects all fields defined in the `hackathons` schema (see DATABASE.md). Field groups:

| Group | Fields |
|-------|--------|
| **Basic Info** | Name, Slug (auto-generated, editable), Short Description, Description (rich text) |
| **Classification** | Event Type, Mode, Categories (multi-select), Tags |
| **Location** | City, Venue (shown only if mode is `offline` or `hybrid`) |
| **Dates** | Registration Deadline, Event Start Date, Event End Date |
| **Team** | Min Team Size, Max Team Size |
| **Prize** | Has Prize (toggle), Prize Details |
| **Links** | Website URL, Registration URL, Banner Image URL |
| **Organizer** | Organizer (searchable dropdown populated from `organizers` collection) |
| **Status** | Status (draft/published), Is Featured |

**Slug generation**: Auto-generated from the name field using `kebab-case`. Admin can override.

**Validation**: All fields validated with Zod before submission. Required fields are marked.

**On submit**: `POST /api/v1/admin/hackathons`. Redirects to the edit page on success.

### 5.3 Edit Hackathon (`/admin/hackathons/:hackathonId/edit`)

Same form as creation, pre-populated with existing values. Uses `PATCH /api/v1/admin/hackathons/:hackathonId`.

### 5.4 Status Actions

Available as quick-action buttons in the list view and on the edit page:

| Action | Allowed From Status | API Call |
|--------|--------------------|----|
| **Publish** | `draft` | `PATCH /admin/hackathons/:id/status` `{ status: 'published' }` |
| **Archive** | `published` | `PATCH /admin/hackathons/:id/status` `{ status: 'archived' }` |
| **Revert to Draft** | `published`, `archived` | `PATCH /admin/hackathons/:id/status` `{ status: 'draft' }` |
| **Feature / Unfeature** | Any | `PATCH /admin/hackathons/:id/feature` `{ isFeatured: true/false }` |

### 5.5 Delete Hackathon

- Available from the edit page and list view (with confirmation dialog).
- Permanently deletes the document.
- Also cascades to remove associated `bookmarks` and `reminders` referencing the hackathon.
- Cascade is handled in the backend service layer, not database-level cascade.

---

## 6. Organizer Management

### 6.1 Organizer List View (`/admin/organizers`)

- Table with columns: Name, Website, Event Count, Actions.
- Search by name.

### 6.2 Create / Edit Organizer

Form fields:

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | Required |
| Slug | Text | Auto-generated, editable |
| Description | Textarea | Optional |
| Logo URL | URL | Optional |
| Website URL | URL | Optional |
| Contact Email | Email | Optional |
| Facebook URL | URL | Optional |
| LinkedIn URL | URL | Optional |

### 6.3 Delete Organizer

- If any `hackathon` documents reference this organizer, deletion is **blocked**.
- The API returns `409 CONFLICT` with a message like: `"This organizer has 3 associated events. Remove or reassign them first."`
- Frontend shows a warning dialog listing the blocking events.

---

## 7. Category Management

### 7.1 Category List View (`/admin/categories`)

- Simple table: Name, Slug, Description, Event Count, Actions.

### 7.2 Create / Edit Category

Form fields: Name (required), Description (optional). Slug is auto-generated.

### 7.3 Delete Category

- Blocked if any `hackathon` documents include this category in their `categories` array.
- Returns `409 CONFLICT` if blocked.

---

## 8. Submission Review

### 8.1 Submission Queue (`/admin/submissions`)

- Tabbed view: **Pending** | **Approved** | **Rejected**.
- Default tab is **Pending**.
- Each row shows: Submitter name, Event name, Event type, Submitted date, Actions.
- Pending items sorted by `createdAt` ascending (oldest first).

### 8.2 Review a Submission (`/admin/submissions/:submissionId`)

Full read-only view of all fields the user provided:

- Event name, description, type, mode, organizer (free text), city, website URL, registration URL, deadline, start date.
- Submitter name and email.
- Link to submitter's profile.

### 8.3 Approve Workflow

1. Admin clicks **Approve**.
2. An edit form pre-fills all submission fields into the hackathon creation form.
3. Admin can modify any field (e.g., link to an existing organizer, assign categories, correct dates).
4. Admin clicks **Confirm & Publish**.
5. Backend: `POST /api/v1/admin/submissions/:id/approve` with override fields.
6. Backend creates a `hackathon` document with `status: 'published'` and sets `submission.status = 'approved'` and `submission.resultHackathon = hackathon._id`.
7. A `notification` is created for the submitter: `type: 'submission_approved'`.

### 8.4 Reject Workflow

1. Admin clicks **Reject**.
2. A dialog prompts for an optional rejection reason.
3. Backend: `POST /api/v1/admin/submissions/:id/reject` with `{ reviewNote }`.
4. Submission status is set to `rejected`.
5. A `notification` is created for the submitter: `type: 'submission_rejected'`, message includes `reviewNote` if provided.

---

## 9. Job Monitoring (Phase 8)

### 9.1 Source Configurations (`/admin/jobs/sources`)

- Table of all `sourceConfigs`: Name, URL, Source Type, Active/Inactive, Last Run, Actions.
- Toggle active/inactive directly from the table.

### 9.2 Create / Edit Source Config

Form fields:

| Field | Notes |
|-------|-------|
| Name | Human-readable label |
| URL | Target URL (must be HTTPS) |
| Source Type | `html_scrape`, `rss_feed`, `api_endpoint` |
| Cron Schedule | Optional cron expression (e.g., `0 8 * * *` for daily at 8am) |
| Adapter Config | Key-value JSON editor for CSS selectors or field mappings |
| Is Active | Toggle |

### 9.3 Job Logs (`/admin/jobs/logs`)

- Filterable by source, status, and date range.
- Columns: Source Name, Status, Started At, Duration, Items Found, Items Created, Skipped, Errors.
- Click on a row to expand and see the full error list.

### 9.4 Manual Trigger

- A **Run Now** button on the source config detail page.
- Calls `POST /api/v1/admin/sources/:sourceId/run`.
- Returns a job ID; the UI polls or uses a WebSocket to show live status.

---

## 10. Admin Analytics

The overview dashboard provides basic analytics. Additional analytics available on the dashboard:

| Metric | Visualization |
|--------|--------------|
| Events by status | Donut chart |
| Events by category | Bar chart |
| Events by mode (online/offline/hybrid) | Donut chart |
| Events by city | Horizontal bar chart |
| Submissions over time | Line chart (last 30 days) |
| Jobs run per day | Bar chart (last 14 days) |

Analytics data is fetched via MongoDB aggregation pipelines in admin-only endpoints.

---

## 11. Admin Permissions and Safeguards

| Safeguard | Description |
|-----------|-------------|
| **Role enforcement at API** | All `/api/v1/admin/*` routes require `role: admin`. Frontend route protection is supplementary. |
| **Deletion confirmations** | All delete actions require a confirmation dialog with the resource name typed or a confirm button. |
| **Referential integrity checks** | Organizer and category deletion blocked if referenced by hackathons. |
| **Cascade deletion** | Hackathon deletion cascades to bookmarks and reminders in the service layer. |
| **Audit fields** | Submission reviews store `reviewedBy` (admin ObjectId) and `reviewedAt` timestamp. |
| **No self-role-escalation** | The `role` field is not writable via any user-facing update endpoint. |
| **Admin creation gate** | New admin accounts can only be created by an existing admin or via a seeder script with `NODE_ENV=seed`. |
