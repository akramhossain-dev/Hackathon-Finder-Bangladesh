# Hackathon Finder Bangladesh 🇧🇩

> A platform for discovering, tracking, and submitting hackathons in Bangladesh.

---

## Project Status

**Phase 0 — Bootstrap complete.**  
Feature development starts in Phase 1.

---

## Monorepo Structure

```
hackathon-finder-bangladesh/
├── frontend/          # Next.js App Router (TypeScript, Tailwind, shadcn/ui)
├── backend/           # Express.js REST API (TypeScript)
├── shared/            # Shared TypeScript types & utilities
└── docs/              # Architecture, API, and feature documentation
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- MongoDB Atlas account (Phase 1)
- Redis / Upstash account (Phase 1+)

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev          # http://localhost:5000
```

---

## Documentation

All architecture, API design, and feature specs live in `/docs`:

| File | Contents |
|------|----------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, tiers, module structure |
| [API.md](./docs/API.md) | REST endpoint contracts |
| [AUTH.md](./docs/AUTH.md) | Token strategy, refresh flow |
| [DATABASE.md](./docs/DATABASE.md) | Mongoose schemas, indexes |
| [FEATURES.md](./docs/FEATURES.md) | Feature breakdown by phase |
| [SCRAPING_AND_IMPORT.md](./docs/SCRAPING_AND_IMPORT.md) | Import pipeline |
| [SECURITY.md](./docs/SECURITY.md) | Security posture |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Hosting & CI/CD |
| [ADMIN_PANEL.md](./docs/ADMIN_PANEL.md) | Admin capabilities |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript, Zod |
| Database | MongoDB Atlas (Mongoose) |
| Cache/Queue | Redis (Upstash) + BullMQ |
| Auth | JWT (access token in-memory, refresh in HttpOnly cookie) |

---

*This project follows clean architecture principles. See `/docs` for the complete source of truth.*
