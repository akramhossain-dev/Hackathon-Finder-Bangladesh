# Security — Hackathon Finder Bangladesh

## 1. Security Goals

| Goal | Description |
|------|-------------|
| **Confidentiality** | User credentials, tokens, and personal data must never be exposed |
| **Integrity** | API data must be validated and type-safe; no unvalidated input reaches the database |
| **Authorization** | Role-based access control enforced on every protected endpoint |
| **Resilience** | Rate limiting, input sanitization, and error handling protect against common attacks |
| **Auditability** | Sensitive operations are logged without exposing sensitive data |

---

## 2. Password Handling

- Passwords are hashed using **bcrypt with cost factor 12** before storage.
- The raw password is **never logged**, stored in plaintext, or returned in any response.
- The `passwordHash` field is excluded from all Mongoose query responses using a schema-level `toJSON` override and explicit projection exclusions.
- Password change requires the user to provide the **current password** for verification.
- Minimum password length is **8 characters**. Enforced by Zod validation on both client and server.
- No maximum length restriction, but server truncates input to 72 characters (bcrypt limit) to prevent timing attacks with extremely long strings.

---

## 3. JWT Handling

- **Access tokens** are signed with `ACCESS_TOKEN_SECRET` using HS256. The secret must be at least 64 characters and stored only in environment variables.
- **Refresh tokens** are signed with a separate `REFRESH_TOKEN_SECRET`. Using separate secrets limits the blast radius if one secret is compromised.
- Access tokens expire in **15 minutes**. Refresh tokens expire in **7 days**.
- Tokens are **never stored** in `localStorage`, `sessionStorage`, or cookies (access token).
- The access token is passed only in the `Authorization: Bearer` header.
- Expired or malformed JWTs return a generic `401 UNAUTHORIZED`. The error message does not reveal whether the token was expired or simply invalid.
- Token secrets are **rotated** by deploying new secrets; old tokens with the previous secret become immediately invalid.

---

## 4. Refresh Token Storage

- The refresh token is stored in an **`HttpOnly; Secure; SameSite=Strict` cookie**.
- The cookie path is restricted to `/api/v1/auth` to minimize transmission.
- The server stores only a **bcrypt hash** of the refresh token, not the plaintext value.
- On logout, the hash is set to `null`, immediately invalidating the token.
- On password change, the hash is cleared, forcing re-authentication.
- Suspected theft (mismatched hashes after rotation) triggers full session revocation.

---

## 5. Input Validation

- All request bodies are validated using **Zod schemas** in the `validate` middleware before reaching any controller.
- Validation rejects unknown fields (`z.object().strict()`), preventing mass-assignment attacks.
- Query parameters are also validated and sanitized using Zod.
- MongoDB ObjectId parameters are validated with `z.string().regex(/^[a-f\d]{24}$/i)` before any database query.
- All string inputs are trimmed. HTML tags in free-text fields (description, notes) are stripped or escaped before storage.
- Numbers are validated for range. Dates are validated as valid ISO 8601 strings.

---

## 6. Authorization Rules

- Every protected route applies `authenticate` middleware first, then `authorize([roles])`.
- The `req.user` object is set **only** by the `authenticate` middleware after verifying the JWT.
- Users can only access or modify their own resources (bookmarks, reminders, submissions). Controllers verify `resource.user.toString() === req.user._id.toString()`.
- Admin role is never self-assignable via API. The `role` field is excluded from all `PATCH /users/me` update schemas.
- The admin role can only be assigned by an existing admin via a protected internal route or a seeding script.

---

## 7. Rate Limiting

Rate limiting is implemented using **`express-rate-limit`** with a Redis store for distributed environments.

| Route Group | Limit | Window |
|-------------|-------|--------|
| `POST /auth/login` | 10 requests | 15 minutes |
| `POST /auth/register` | 5 requests | 1 hour |
| `POST /auth/refresh` | 30 requests | 15 minutes |
| `POST /submissions` | 5 requests | 1 hour |
| All other routes | 200 requests | 15 minutes |

- Rate limits are applied **per IP address**.
- When the limit is exceeded, the server returns `429 Too Many Requests` with a `Retry-After` header.
- Auth routes have the strictest limits to prevent brute force and credential stuffing attacks.

---

## 8. CORS Policy

- CORS is configured using the `cors` npm package.
- `origin` is set to the **exact frontend domain** (e.g., `https://hackathonfinder.com`). Wildcard `*` is not used in production.
- Allowed methods: `GET, POST, PATCH, DELETE, OPTIONS`.
- Allowed headers: `Content-Type, Authorization`.
- `credentials: true` is set to allow cookies to be sent cross-origin.
- Preflight requests (`OPTIONS`) are handled automatically.

```js
// Example CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

---

## 9. Security Headers (Helmet)

The `helmet` middleware is applied globally to set the following HTTP response headers:

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Restricts sources for scripts, styles, images |
| `X-Content-Type-Options: nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options: DENY` | Prevents clickjacking |
| `Strict-Transport-Security` | Enforces HTTPS |
| `X-XSS-Protection: 0` | Disables outdated browser XSS filter |
| `Referrer-Policy: no-referrer` | Limits referrer information |

---

## 10. Secret Management

- All secrets are stored exclusively in **environment variables**. No secrets in source code.
- Required secrets are validated at startup using a Zod schema in `config/env.ts`. The server refuses to start if a required secret is missing.
- Secrets in CI/CD pipelines use platform-provided secret stores (e.g., GitHub Actions secrets, Railway env vars).
- `.env` files are never committed. `.env.example` contains only keys with placeholder values.

**Required secrets:**
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `MONGODB_URI`
- `REDIS_URL`
- `EMAIL_API_KEY`
- `FRONTEND_URL`

---

## 11. Logging and Sensitive Data

- **Request logging** uses Morgan (or equivalent) in structured JSON format.
- Logged fields: method, path, status code, response time, IP address.
- Passwords, tokens, and `passwordHash` / `refreshTokenHash` fields are **never logged**.
- Error logs include stack traces in development only. In production, only error code and message are logged externally.
- A centralized `ApiError` class distinguishes between operational errors (sent to client) and programming errors (logged internally, not exposed).
- Logs are shipped to a log aggregator (e.g., Logtail, Datadog) in production. No sensitive data is included.

---

## 12. Common Attack Risks and Mitigations

| Attack | Mitigation |
|--------|-----------|
| **Brute force login** | Rate limiting on `/auth/login` (10 req/15min per IP) |
| **Credential stuffing** | Same rate limit; generic error messages (no user enumeration) |
| **XSS** | Access token in memory only; CSP headers; input sanitization |
| **CSRF** | `SameSite=Strict` cookie; CORS origin whitelist |
| **SQL/NoSQL injection** | Mongoose parameterized queries; no raw query string concatenation |
| **Mass assignment** | Zod strict schema; explicit field allowlists in update schemas |
| **JWT tampering** | Token verified on every request; HS256 + strong secret |
| **Refresh token theft** | HttpOnly cookie; hash comparison; rotation + revocation |
| **User enumeration** | Generic error messages on login and register failures |
| **Clickjacking** | `X-Frame-Options: DENY` via Helmet |
| **Insecure direct object reference** | Ownership check on every user-owned resource |
| **Denial of Service** | Rate limiting; body size limit (`express.json({ limit: '1mb' })`) |

---

## 13. Admin Security Considerations

- Admin accounts must be created via a protected seeding script or by an existing admin using an internal route.
- Admin actions (create, update, delete hackathons; approve/reject submissions) are logged with the admin's `userId` and a timestamp.
- The admin panel route group (`/api/v1/admin/*`) applies `authenticate` + `authorize(['admin'])` at the router level, not per-route, so it cannot be accidentally omitted.
- Admin panel is not accessible to `guest` or `user` roles. The frontend hides admin routes, but security is enforced by the API, not by UI exclusion.

---

## 14. Scraping and Import Safety

- Scrapers respect the target site's `robots.txt` before fetching any page.
- Request headers include a descriptive `User-Agent` string identifying the platform.
- Scrapers use configurable delays between requests to avoid overwhelming source servers.
- All scraped data is treated as **untrusted user input**: it goes through the same Zod normalization schema and is stored as `status: 'pending_review'` until an admin approves it.
- Source URLs are restricted to `https` only. Arbitrary URL injection into source configs is prevented by Zod URL validation.
- Import workers run in isolated BullMQ worker processes; a crash in one job does not affect the API server.
