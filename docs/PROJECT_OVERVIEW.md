# Project Overview — Hackathon Finder Bangladesh

## 1. Project Summary

**Hackathon Finder Bangladesh** is a centralized web platform for discovering, tracking, and managing hackathons, coding contests, ideathons, and innovation challenges taking place in Bangladesh. The platform serves as the go-to directory for students, developers, designers, and innovators who want to find events relevant to their interests, skill levels, and locations.

The platform supports both **online** and **offline** (and hybrid) events, offers powerful search and filtering, and provides registered users with bookmarking and reminder capabilities. Administrators can manage the entire event catalog, organizer profiles, and content moderation pipeline. A future scraping and import pipeline will automate the collection of event data from external sources.

---

## 2. Problem Statement

Bangladesh has a growing ecosystem of hackathons and tech competitions hosted by universities, corporations, government bodies, and NGOs. However, there is no single reliable source where participants can discover all these events. Information is scattered across:

- Facebook groups and pages
- University notice boards
- DevPost listings
- Organizer websites
- Discord servers

This fragmentation causes participants to miss deadlines, lack awareness of events, and spend significant time manually aggregating information. Organizers also struggle to reach a wide audience efficiently.

**Hackathon Finder Bangladesh** solves this by providing a structured, searchable, and regularly updated directory of all relevant events in one place.

---

## 3. Project Goals

| # | Goal |
|---|------|
| 1 | Provide a single platform where users can discover hackathons and competitions in Bangladesh |
| 2 | Enable filtering by city, mode, type, category, organizer, and deadline |
| 3 | Allow registered users to bookmark events and receive timely reminders |
| 4 | Enable administrators to manage the complete event catalog efficiently |
| 5 | Support a moderated submission flow where community members can suggest new events |
| 6 | Lay the foundation for a semi-automated scraping/import pipeline to reduce manual data entry |
| 7 | Build a scalable and maintainable codebase that can grow with the ecosystem |

---

## 4. Target Users

| User Type | Description |
|-----------|-------------|
| **Students** | University and college students looking for competitions to participate in |
| **Developers** | Professional and freelance developers seeking hackathons relevant to their stack |
| **Designers** | UI/UX and graphic designers looking for design-focused challenges |
| **Entrepreneurs** | Founders and early-stage teams seeking ideathons and innovation challenges |
| **Organizers** | Universities, companies, and NGOs that run events and want visibility |
| **Administrators** | Platform team members who maintain the event catalog and content quality |

---

## 5. User Roles

The platform defines three roles. These roles are enforced at the API and UI level.

| Role | Description |
|------|-------------|
| `guest` | Unauthenticated visitor. Can browse, search, and view hackathon details. Cannot bookmark or submit. |
| `user` | Authenticated registered user. Can bookmark hackathons, set reminders, manage a profile, and submit hackathon suggestions. |
| `admin` | Privileged platform operator. Can create, edit, delete, and manage all hackathons, organizers, categories, and user submissions. Can monitor background jobs. |

---

## 6. Core Use Cases

### Guest Use Cases
- Browse the full list of hackathons sorted by recency or deadline
- Search by keyword (event name, organizer, tags)
- Filter events by city, mode (online/offline/hybrid), category, event type, and deadline range
- View detailed event pages including schedule, prizes, and organizer info
- View organizer profile pages

### User Use Cases
- Register with email and password
- Log in and manage account profile
- Bookmark hackathons for quick reference
- Set reminders for registration deadlines or event start dates
- Submit a new hackathon for admin review
- Receive notifications (in-app or email) for reminders

### Admin Use Cases
- Create, update, archive, feature, and delete hackathons
- Manage organizer profiles
- Manage event categories
- Review and approve or reject community-submitted hackathons
- Monitor scraping/import job execution and logs
- View basic analytics (events by status, category, city)

---

## 7. Project Scope

### In Scope (MVP)

- Public hackathon listing with search and multi-filter
- Detailed hackathon event pages
- Organizer profile pages
- User registration and authentication (JWT-based)
- User bookmarks and reminders (via BullMQ scheduled jobs)
- Admin CRUD for hackathons, organizers, and categories
- Admin review queue for user-submitted hackathons
- RESTful API (Express.js + MongoDB)
- Frontend (Next.js + Tailwind CSS + shadcn/ui)

### In Scope (Post-MVP / Phase 2)

- Semi-automated scraping and import pipeline (Playwright/Puppeteer/Cheerio)
- Email notification delivery for reminders
- Advanced analytics dashboard for admins
- Organizer self-service portal
- Team formation features

---

## 8. Non-Goals

The following are explicitly out of scope for this project:

- **Payment processing**: The platform does not handle registration fees or ticket purchases.
- **Real-time chat or messaging**: No in-app communication between users.
- **Judging or submission portals**: The platform links to external submission systems.
- **User-generated reviews or ratings**: No rating system for events in the MVP.
- **Mobile native apps**: Web only; responsive design is the mobile strategy.
- **Global coverage by default**: While the architecture is not Bangladesh-specific, the initial content and data pipeline targets events in Bangladesh.

---

## 9. MVP vs. Future Scope

| Feature | MVP | Future |
|---------|-----|--------|
| Browse & search hackathons | ✅ | — |
| Filter events | ✅ | Extended filters |
| Event detail pages | ✅ | — |
| User auth (JWT) | ✅ | OAuth (Google) |
| Bookmarks | ✅ | — |
| Reminders (scheduled jobs) | ✅ | Push notifications |
| Admin panel (CRUD) | ✅ | Advanced analytics |
| Submission review | ✅ | — |
| Scraping/import pipeline | ⬜ Phase 8 | Automated scheduling |
| Organizer self-service | ⬜ Future | — |
| Email notifications | ⬜ Phase 6 | SMS |
| Team formation | ⬜ Future | — |
| Public API / embeds | ⬜ Future | — |

---

## 10. Assumptions and Constraints

| Category | Assumption |
|----------|------------|
| **Language** | All UI content is in English. Bangla language support may be added later. |
| **Geography** | Primary focus is Bangladesh, but no hard country restriction exists in the data model. |
| **Event data** | Initial data is manually entered by admins. Community submissions require moderation. |
| **Authentication** | No third-party OAuth in MVP. JWT-only with access + refresh token flow. |
| **Database** | MongoDB Atlas (managed cloud). No self-hosted database in production. |
| **Hosting** | Frontend on Vercel, backend on a VPS or Railway. Redis managed (Upstash). |
| **Email** | Transactional email sent via a provider (e.g., Resend or SendGrid). |
| **Rate limiting** | Applied at the API level. No CDN-level WAF in MVP. |
| **Browser support** | Modern evergreen browsers only. No IE11 support. |
| **Scraping legality** | All scraping must comply with `robots.txt` and target only publicly available data. |
