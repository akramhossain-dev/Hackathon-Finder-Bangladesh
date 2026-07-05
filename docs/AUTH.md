# Authentication — Hackathon Finder Bangladesh

## 1. Authentication Model

The platform uses **stateless JWT-based authentication** with a two-token strategy:

| Token | Purpose | Lifetime | Storage |
|-------|---------|----------|---------|
| **Access Token** | Authorizes API requests | 15 minutes | In-memory (React state / Zustand) |
| **Refresh Token** | Issues new access tokens without re-login | 7 days | `HttpOnly` cookie (server-set) |

The access token is short-lived to limit exposure. The refresh token is long-lived but stored in an `HttpOnly` cookie, making it inaccessible to JavaScript and immune to XSS.

---

## 2. Registration Flow

```
1. Client sends: POST /api/v1/auth/register
   Body: { name, email, password }

2. Server validates input with Zod:
   - name: 2–80 characters
   - email: valid format, lowercase-normalized
   - password: minimum 8 characters

3. Server checks: email must not already exist in users collection
   → If exists: 409 CONFLICT

4. Server hashes password:
   bcrypt.hash(password, 12)

5. Server creates user document in MongoDB:
   { name, email, passwordHash, role: 'user', isActive: true }

6. Server generates tokens:
   - Access token: JWT signed with ACCESS_TOKEN_SECRET, expires in 15m
   - Refresh token: Random UUID or JWT signed with REFRESH_TOKEN_SECRET, expires in 7d

7. Server stores hashed refresh token in user document:
   user.refreshTokenHash = bcrypt.hash(refreshToken, 10)

8. Server sets refresh token as HttpOnly cookie:
   Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800

9. Server responds 201:
   { user: { _id, name, email, role }, accessToken }

10. Client stores access token in memory.
```

---

## 3. Login Flow

```
1. Client sends: POST /api/v1/auth/login
   Body: { email, password }

2. Server validates input with Zod.

3. Server queries users collection for email.
   → If not found: 401 UNAUTHORIZED (generic message: "Invalid credentials")

4. Server compares password:
   bcrypt.compare(password, user.passwordHash)
   → If mismatch: 401 UNAUTHORIZED

5. Server checks user.isActive === true
   → If false: 401 UNAUTHORIZED ("Account is disabled")

6. Server generates new token pair (same as registration step 6–8).

7. Server responds 200:
   { user: { _id, name, email, role }, accessToken }
```

---

## 4. Logout Flow

```
1. Client sends: POST /api/v1/auth/logout
   Header: Authorization: Bearer <accessToken>

2. Server verifies access token.

3. Server clears refreshTokenHash on user document:
   user.refreshTokenHash = null

4. Server clears the HttpOnly cookie:
   Set-Cookie: refreshToken=; HttpOnly; Secure; Max-Age=0

5. Server responds 200: { message: "Logged out successfully." }

6. Client clears in-memory access token.
```

---

## 5. Access Token Strategy

- Signed using **HS256** algorithm with a dedicated `ACCESS_TOKEN_SECRET` environment variable.
- Payload:
  ```json
  {
    "sub": "<userId>",
    "role": "user | admin",
    "iat": 1700000000,
    "exp": 1700000900
  }
  ```
- The access token is **never stored in `localStorage` or `sessionStorage`**.
- The access token is **never sent in URL query params**.
- Passed only as a header: `Authorization: Bearer <token>`.
- Verified on every protected request using the `authenticate` middleware.

---

## 6. Refresh Token Strategy

- The refresh token is a **UUID v4** or a **signed JWT** (implementation choice; UUID is simpler to revoke).
- Stored as an `HttpOnly; Secure; SameSite=Strict` cookie with `Path=/api/v1/auth`.
- The server stores a **bcrypt hash** of the refresh token in the `users.refreshTokenHash` field — not the raw token.

### Refresh Flow

```
1. Client sends: POST /api/v1/auth/refresh
   (No body; refresh token is read from cookie automatically)

2. Server reads refresh token from cookie.
   → If missing: 401 UNAUTHORIZED

3. Server looks up user by decoding token (or extracting userId from cookie value).

4. Server compares cookie token against stored hash:
   bcrypt.compare(cookieToken, user.refreshTokenHash)
   → If mismatch or null: 401 UNAUTHORIZED (token revoked or invalid)

5. Server issues a new access token (15m).
   Server issues a new refresh token (7d) and stores its hash → token rotation.

6. Server sets new HttpOnly cookie with new refresh token.

7. Server responds 200: { accessToken }
```

---

## 7. Token Expiry Assumptions

| Token | Expiry | Behavior on expiry |
|-------|--------|-------------------|
| Access Token | 15 minutes | API returns `401 UNAUTHORIZED`; client silently calls refresh |
| Refresh Token | 7 days | User must log in again |

The client uses an **Axios response interceptor** to catch `401` responses, call `/auth/refresh`, and replay the original request with the new access token.

---

## 8. Refresh Token Rotation and Revocation

- **Rotation**: Every `/auth/refresh` call issues a completely new refresh token and invalidates the previous one. The old hash is replaced in the database.
- **Revocation on logout**: The `refreshTokenHash` field is set to `null` on logout. Any subsequent refresh attempt fails immediately.
- **Revocation on password change**: Changing a password also clears `refreshTokenHash`, forcing re-login.
- **Theft detection**: If a refresh token is used after it has already been rotated (i.e., the stored hash doesn't match), the server treats this as a potential token theft: set `refreshTokenHash = null` (revoke all sessions) and return `401`.

---

## 9. Password Hashing

- Uses **bcrypt** with a **cost factor of 12**.
- Passwords are **never stored in plaintext** anywhere, including logs.
- `passwordHash` is **never returned** in any API response. It must be explicitly excluded in all Mongoose query projections.

```js
// Example (schema level)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  return obj;
};
```

---

## 10. Route Protection Model

Routes are protected using two middleware functions:

### `authenticate` Middleware

- Reads the `Authorization: Bearer <token>` header.
- Verifies the JWT signature against `ACCESS_TOKEN_SECRET`.
- Checks token expiry.
- Attaches `req.user = { _id, role }` to the request.
- Returns `401 UNAUTHORIZED` if any check fails.

### `authorize(roles[])` Middleware

- Accepts an array of allowed roles (e.g., `authorize(['admin'])`).
- Checks `req.user.role` against the allowed list.
- Returns `403 FORBIDDEN` if the role is not permitted.
- Must be applied **after** `authenticate`.

### Route Protection Examples

| Route | authenticate | authorize |
|-------|-------------|-----------|
| `GET /hackathons` | ❌ | ❌ |
| `GET /users/me` | ✅ | Any authenticated |
| `POST /bookmarks` | ✅ | `user`, `admin` |
| `POST /admin/hackathons` | ✅ | `admin` only |

---

## 11. Role-Based Access Control Rules

| Action | `guest` | `user` | `admin` |
|--------|---------|--------|---------|
| Browse hackathons | ✅ | ✅ | ✅ |
| View event details | ✅ | ✅ | ✅ |
| Register / Login | ✅ | — | — |
| Bookmark hackathons | ❌ | ✅ | ✅ |
| Set reminders | ❌ | ✅ | ✅ |
| Submit hackathon | ❌ | ✅ | ✅ |
| Create/Edit hackathons | ❌ | ❌ | ✅ |
| Manage organizers | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |
| Review submissions | ❌ | ❌ | ✅ |
| Monitor import jobs | ❌ | ❌ | ✅ |

---

## 12. Session and Security Considerations

- **No server-side session**: The server is stateless. The only server-side state is the `refreshTokenHash` in MongoDB.
- **HTTPS required**: All cookies must use the `Secure` flag. The API must be served over HTTPS in production.
- **SameSite=Strict**: Prevents the refresh token cookie from being sent on cross-site requests, mitigating CSRF.
- **Cookie path restriction**: The refresh cookie is scoped to `Path=/api/v1/auth` so it is only sent on auth endpoints.
- **Admin account creation**: Admin accounts must be created by an existing admin or via a protected seeding script. There is no public admin registration route.
- **Account lock**: After 10 consecutive failed login attempts from a single IP, the rate limiter will block further attempts for 15 minutes (see SECURITY.md).
