# Deployment — Hackathon Finder Bangladesh

## 1. Deployment Environments

| Environment | Purpose | Notes |
|-------------|---------|-------|
| **development** | Local developer machines | `.env.local`, hot reload, verbose logging |
| **staging** | Pre-production testing | Mirrors production config; separate DB and Redis instance |
| **production** | Live platform | Hardened config, no debug output, monitored |

All environments use the same codebase. Configuration differences are managed exclusively via environment variables.

---

## 2. Infrastructure Overview

```
Internet
    │
    ├── Vercel (Next.js Frontend)
    │       └── SSR/ISR pages served globally via Vercel Edge Network
    │
    ├── VPS / Railway (Express.js Backend API)
    │       ├── Node.js process (PM2 or Railway process management)
    │       ├── BullMQ Workers (reminder + import)
    │       └── HTTPS via Caddy / Nginx reverse proxy with Let's Encrypt
    │
    ├── MongoDB Atlas
    │       └── M10+ cluster (production); M0 free tier (development)
    │
    └── Redis (Upstash)
            └── Serverless Redis — used for BullMQ queues
```

---

## 3. Frontend Hosting (Vercel)

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Deployment trigger | Push to `main` branch via GitHub integration |
| Build command | `npm run build` |
| Output directory | `.next` |
| Environment variables | Set in Vercel project settings (not committed) |
| Preview deployments | Automatically created for every pull request |
| Domain | Custom domain configured in Vercel dashboard |

### Vercel Environment Variables (Frontend)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g., `https://api.hackathonfinder.com/api/v1`) |
| `NEXT_PUBLIC_SITE_URL` | Frontend canonical URL (for SEO and OG tags) |

`NEXT_PUBLIC_` prefix exposes variables to the browser bundle. All other variables are server-only.

---

## 4. Backend Hosting (VPS or Railway)

### Option A: VPS (Ubuntu)

- Node.js managed with **PM2** in cluster mode.
- **Nginx** or **Caddy** as a reverse proxy on port 80/443.
- TLS certificate from **Let's Encrypt** (auto-renewed by Caddy or Certbot).
- Deployment via GitHub Actions: SSH into server, pull latest code, run `npm install && npm run build` (if TS compile step), restart PM2.

### Option B: Railway

- Backend deployed as a Railway service from the GitHub repo.
- Railway auto-detects Node.js and runs `npm start`.
- Environment variables set via Railway's dashboard.
- Custom domain configured in Railway project settings.
- BullMQ workers run as a separate Railway service pointing to the same codebase with a different start command (e.g., `npm run worker`).

### Backend Process Model

| Process | Command | Purpose |
|---------|---------|---------|
| API Server | `node dist/server.js` | Handles all HTTP requests |
| Reminder Worker | `node dist/queues/reminder.worker.js` | Processes BullMQ reminder jobs |
| Import Worker | `node dist/queues/import.worker.js` | Processes BullMQ import jobs |

Workers can run as separate PM2 processes or separate Railway services. They share the same MongoDB and Redis connections.

---

## 5. MongoDB (Atlas)

| Setting | Value |
|---------|-------|
| Provider | MongoDB Atlas |
| Tier (dev) | M0 (free) |
| Tier (staging/prod) | M10 or higher |
| Region | Asia Pacific (Singapore or Mumbai for low latency from BD) |
| Connection | Via `MONGODB_URI` environment variable (SRV connection string) |
| IP Allowlist | Backend server IP(s) whitelisted in Atlas Network Access |
| Auth | Database user with `readWrite` role on the project database only |
| Backups | Continuous backups enabled on M10+ clusters |
| Monitoring | Atlas built-in performance advisor and alerts |

---

## 6. Redis (Upstash)

| Setting | Value |
|---------|-------|
| Provider | Upstash (serverless Redis) |
| Plan | Pay-per-request (or Pro for production) |
| Connection | Via `REDIS_URL` environment variable (TLS `rediss://` URL) |
| Purpose | BullMQ job queues (reminders, imports) |
| Persistence | Upstash handles persistence; no additional config required |

---

## 7. Email Provider

| Setting | Value |
|---------|-------|
| Provider | Resend (or SendGrid as an alternative) |
| Purpose | Transactional emails for reminder notifications |
| From address | `noreply@hackathonfinder.com` |
| Connection | Via `EMAIL_API_KEY` environment variable |
| Template storage | Code-level (React Email templates or plain HTML strings) |

---

## 8. Environment Variable Reference

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | `development`, `staging`, or `production` |
| `PORT` | ✅ | Port for the Express server (default: `5000`) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `REDIS_URL` | ✅ | Upstash Redis TLS URL |
| `ACCESS_TOKEN_SECRET` | ✅ | JWT signing secret for access tokens (min 64 chars) |
| `REFRESH_TOKEN_SECRET` | ✅ | JWT signing secret for refresh tokens (min 64 chars) |
| `ACCESS_TOKEN_EXPIRY` | ✅ | e.g., `15m` |
| `REFRESH_TOKEN_EXPIRY` | ✅ | e.g., `7d` |
| `FRONTEND_URL` | ✅ | Allowed CORS origin (e.g., `https://hackathonfinder.com`) |
| `EMAIL_API_KEY` | ✅ (Phase 6) | Resend/SendGrid API key |
| `EMAIL_FROM` | ✅ (Phase 6) | Sender email address |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical frontend URL |

### `.env.example` (Backend)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hackathonfinder
REDIS_URL=rediss://<token>@<host>:<port>
ACCESS_TOKEN_SECRET=change_me_at_least_64_characters_long
REFRESH_TOKEN_SECRET=change_me_at_least_64_characters_long
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
EMAIL_API_KEY=re_xxxxxxx
EMAIL_FROM=noreply@hackathonfinder.com
```

---

## 9. Secrets Management

- Secrets are **never committed** to version control. `.env` and `.env.local` files are in `.gitignore`.
- `.env.example` is committed with placeholder values only.
- In production, secrets are stored in the hosting platform's secret store:
  - **Vercel**: Project → Settings → Environment Variables
  - **Railway**: Project → Service → Variables
  - **VPS**: Managed via a secrets manager (e.g., Doppler) or injected by CI/CD pipeline
- Secrets are validated at startup using a Zod schema. Missing required secrets abort the process with a clear error.
- Token secrets must be generated with a cryptographically secure random generator (e.g., `openssl rand -base64 64`).

---

## 10. Release and Deployment Flow

### Frontend (Vercel)

```
Developer pushes to GitHub (feature branch)
        │
        ▼
Vercel creates preview deployment (auto)
        │
PR reviewed and merged to `main`
        │
        ▼
Vercel builds and deploys to production (auto)
        │
Custom domain updated instantly via Vercel Edge Network
```

### Backend (Railway or VPS)

```
Developer pushes to GitHub `main`
        │
        ▼
CI (GitHub Actions):
  1. Run tests (npm test)
  2. Run lint (npm run lint)
  3. Build TypeScript (npm run build)
  4. On success: trigger deployment
        │
[Railway]                         [VPS via SSH]
Auto-deploys from `main`    OR    SSH → git pull → npm ci
                                  → npm run build → pm2 reload all
```

- Zero-downtime deploys: PM2 performs graceful reload. Railway handles rolling deploys natively.
- Database migrations (index creation, schema changes) are run via a separate migration script before the new API process starts.

---

## 11. Logging and Monitoring

| Tool | Purpose |
|------|---------|
| **Morgan** | HTTP request logging (structured JSON in production) |
| **Logtail / Datadog / Railway Logs** | Log aggregation and search |
| **MongoDB Atlas Alerts** | Alerts on high connection count, slow queries |
| **Upstash Console** | BullMQ queue depth and job failure monitoring |
| **UptimeRobot / BetterUptime** | External uptime monitoring with SMS/email alerts |

### Log Levels

| Level | When Used |
|-------|----------|
| `info` | Successful requests, job completions |
| `warn` | Recoverable errors, skipped items |
| `error` | Unhandled exceptions, failed jobs, auth failures |

Sensitive fields (`passwordHash`, `refreshTokenHash`, tokens) are never written to logs.

---

## 12. Backup and Recovery

| Asset | Backup Strategy |
|-------|----------------|
| **MongoDB** | Atlas continuous backups (point-in-time restore on M10+) |
| **Redis** | Upstash handles durability; BullMQ job data is ephemeral by design |
| **Application code** | Git repository is the source of truth; no backup needed |
| **Environment variables** | Documented in team password manager / secrets tool |

### Recovery Procedures

- **Database restore**: Use Atlas point-in-time restore to recover to any point within the backup window (typically 7 days on M10).
- **Service restart**: PM2 auto-restarts crashed processes. Railway auto-restarts crashed deployments.
- **Corrupt job queue**: BullMQ failed jobs are retained in the `failed` queue for inspection. The queue can be drained and replayed selectively via admin tooling.
- **Total infra loss**: Re-provision backend on Railway or a new VPS, restore MongoDB from Atlas backup, redeploy frontend to Vercel. Estimated RTO: < 2 hours.
