# Features — Hackathon Finder Bangladesh

This document enumerates all features of the platform, grouped by user role and functional module. Each feature includes a short description and its implementation priority relative to the roadmap.

---

## 1. Guest (Public) Features

### 1.1 Hackathon Browsing

| Feature | Description | Priority |
|---------|-------------|----------|
| View hackathon listing | Paginated list of all published hackathons, sorted by deadline (ascending) by default | MVP |
| Sort events | Sort by deadline, start date, or creation date | MVP |
| Featured events | Highlighted/pinned events displayed at the top of the listing | MVP |
| View event detail page | Full event page with description, schedule, prizes, eligibility, mode, and organizer info | MVP |
| View organizer profile | Dedicated page per organizer showing their events and details | MVP |

### 1.2 Search and Filtering

| Feature | Description | Priority |
|---------|-------------|----------|
| Keyword search | Full-text search across event name, description, tags, and organizer name | MVP |
| Filter by event type | Filter by `hackathon`, `coding contest`, `ideathon`, `innovation challenge` | MVP |
| Filter by mode | Filter by `online`, `offline`, `hybrid` | MVP |
| Filter by city | Filter events by city (e.g., Dhaka, Chittagong, Rajshahi) | MVP |
| Filter by category | Filter by category (e.g., AI/ML, Web Dev, FinTech) | MVP |
| Filter by organizer | Filter by a specific organizer | MVP |
| Filter by deadline | Filter events with registration deadline in a date range | MVP |
| Filter by prize availability | Filter only events with prizes | Post-MVP |
| Filter by team size | Filter events by min/max team size | Post-MVP |
| Combined filters | Multiple filters can be applied simultaneously | MVP |
| Persist filters in URL | Filter state reflected in query params for shareability | MVP |

### 1.3 General

| Feature | Description | Priority |
|---------|-------------|----------|
| Responsive design | All pages work on mobile, tablet, and desktop | MVP |
| SEO-friendly pages | Server-rendered event pages with proper meta tags | MVP |
| Open Graph tags | OG tags for social media sharing | MVP |

---

## 2. Authenticated User Features

### 2.1 Authentication

| Feature | Description | Priority |
|---------|-------------|----------|
| Register | Create account with name, email, and password | MVP |
| Login | Log in with email and password, receive access + refresh tokens | MVP |
| Logout | Revoke refresh token and clear client-side tokens | MVP |
| Refresh token | Silently refresh access token using refresh token | MVP |
| Persistent session | Remain logged in across browser sessions via refresh token | MVP |

### 2.2 Profile Management

| Feature | Description | Priority |
|---------|-------------|----------|
| View profile | See name, email, avatar, and account details | MVP |
| Edit profile | Update name and avatar | MVP |
| Change password | Update password after verifying current password | MVP |
| Delete account | Self-delete account and associated data | Post-MVP |

### 2.3 Bookmarks

| Feature | Description | Priority |
|---------|-------------|----------|
| Bookmark a hackathon | Save any published hackathon to a personal list | MVP |
| Remove bookmark | Remove a hackathon from bookmarks | MVP |
| View all bookmarks | Dedicated page listing all bookmarked events | MVP |
| Bookmark status on listing | Show filled/unfilled bookmark icon on event cards | MVP |

### 2.4 Reminders

| Feature | Description | Priority |
|---------|-------------|----------|
| Set a reminder | Set a reminder for an event's registration deadline or start date | MVP |
| Choose reminder timing | Remind N hours/days before the deadline or start date | MVP |
| View all reminders | Dashboard page showing all active reminders | MVP |
| Delete a reminder | Cancel a pending reminder | MVP |
| Receive reminder notification | In-app notification triggered by BullMQ job | MVP |
| Email reminder | Email sent when a reminder fires | Phase 6 |

### 2.5 Submissions

| Feature | Description | Priority |
|---------|-------------|----------|
| Submit a new hackathon | Fill a form to suggest an event for admin review | MVP |
| View submission status | See whether the submission is pending, approved, or rejected | MVP |
| Edit a pending submission | Edit a submission before admin review | MVP |
| Delete a submission | Withdraw a pending submission | MVP |

### 2.6 Notifications

| Feature | Description | Priority |
|---------|-------------|----------|
| In-app notification list | View all notifications in a dropdown/panel | MVP |
| Mark notification as read | Mark individual or all notifications as read | MVP |
| Notification for reminder fire | Notification when a reminder fires | MVP |
| Notification for submission decision | Notification when admin approves or rejects a submission | Phase 7 |

---

## 3. Admin Features

### 3.1 Hackathon Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Create hackathon | Admin creates a new event with all fields | MVP |
| Edit hackathon | Update any field of an existing event | MVP |
| Delete hackathon | Permanently remove an event | MVP |
| Archive hackathon | Soft-archive past events (hidden from public listing) | MVP |
| Publish hackathon | Set a draft event to `published` status | MVP |
| Feature hackathon | Pin an event to the top of the listing | MVP |
| Duplicate hackathon | Clone an existing event as a new draft | Post-MVP |
| Bulk status update | Change status of multiple events at once | Post-MVP |

### 3.2 Organizer Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Create organizer | Add a new organizer profile | MVP |
| Edit organizer | Update organizer name, logo, website, and description | MVP |
| Delete organizer | Remove organizer (protected if events exist) | MVP |
| View organizer events | See all events linked to an organizer | MVP |

### 3.3 Category Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Create category | Add a new event category (e.g., FinTech, HealthTech) | MVP |
| Edit category | Update category name, slug, and description | MVP |
| Delete category | Remove a category (protected if events reference it) | MVP |

### 3.4 Submission Review

| Feature | Description | Priority |
|---------|-------------|----------|
| View submission queue | List all pending user-submitted events | MVP |
| Review a submission | View full submission details | MVP |
| Approve submission | Promote a submission to a published hackathon | MVP |
| Reject submission | Reject with optional reason | MVP |
| Edit before approval | Admin can edit submission fields before approving | MVP |

### 3.5 Scraping/Import Job Monitoring

| Feature | Description | Priority |
|---------|-------------|----------|
| View source configs | List all configured scraping/import sources | Phase 8 |
| Create source config | Add a new source URL and extraction rules | Phase 8 |
| Toggle source active/inactive | Enable or disable a source | Phase 8 |
| View job logs | See execution history, status, and errors per source | Phase 8 |
| Trigger manual run | Manually initiate a scraping job for a source | Phase 8 |

### 3.6 Analytics

| Feature | Description | Priority |
|---------|-------------|----------|
| Total events by status | Count of draft, published, archived events | MVP |
| Events by category | Breakdown of events per category | MVP |
| Events by mode | Online vs offline vs hybrid breakdown | Post-MVP |
| Events by city | Geographic distribution of events | Post-MVP |
| Recent submissions | Count of pending submissions in the queue | MVP |

---

## 4. Search and Filtering — Detailed Behavior

- **Keyword search** performs a MongoDB text index search on `name`, `description`, `tags`, and `organizer.name`.
- **Filters** are combined with logical AND unless otherwise noted.
- **Pagination** defaults to 20 items per page. The `page` and `limit` query params control pagination.
- **Sorting** is applied after filtering.
- **Filter state** is serialized into the URL query string so that filter combinations can be bookmarked and shared.
- The API returns the total count alongside results to enable pagination UI.

---

## 5. Feature Dependencies

| Feature | Depends On |
|---------|------------|
| Bookmarks | User auth |
| Reminders | User auth, BullMQ configured |
| Reminder notifications | Reminders, Notifications collection |
| Email reminders | Reminders, Email provider config |
| Submissions | User auth |
| Submission approval | Admin role, Hackathon creation |
| Job monitoring | Source configs, BullMQ, jobLogs collection |
| Featured events | Admin panel |
| Organizer profile page | Organizers collection |

---

## 6. Optional / Future Features

| Feature | Description |
|---------|-------------|
| Google OAuth login | Allow sign-in via Google |
| Organizer self-service | Organizers manage their own events via a restricted portal |
| Team formation | Users post looking-for-team requests for specific events |
| Event calendar view | Calendar-based UI for browsing events |
| Public API | Rate-limited API for third-party integrations |
| Event embed widget | Embeddable widget for external websites |
| Bangla language support | UI and content in Bengali |
| Mobile app (PWA) | Progressive Web App version |
| SMS reminders | Reminder delivery via SMS |
| Social sharing | Pre-composed share text for WhatsApp, Twitter |
