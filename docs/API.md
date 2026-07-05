# API Reference — Hackathon Finder Bangladesh

## 1. Conventions

- **Base URL**: `/api/v1`
- **Auth**: Protected routes require `Authorization: Bearer <accessToken>` header.
- **Content-Type**: `application/json` for all requests and responses.
- **Pagination**: Query params `page` (default: 1) and `limit` (default: 20, max: 100).
- **Success envelope**:
  ```json
  { "success": true, "data": { ... } }
  ```
- **Error envelope**:
  ```json
  { "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
  ```
- **Common error codes**: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `INTERNAL_ERROR`.

---

## 2. Auth Routes

### `POST /api/v1/auth/register`
**Purpose**: Register a new user account.
**Auth**: None

**Request Body:**
```json
{
  "name": "string (2–80 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```
**Success Response** `201`:
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "user" },
    "accessToken": "..."
  }
}
```
Refresh token is set as an `HttpOnly` cookie.

**Errors**: `409 CONFLICT` (email already registered), `400 VALIDATION_ERROR`.

---

### `POST /api/v1/auth/login`
**Purpose**: Authenticate a user and issue tokens.
**Auth**: None

**Request Body:**
```json
{ "email": "string", "password": "string" }
```
**Success Response** `200`:
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "..." },
    "accessToken": "..."
  }
}
```
Refresh token set as `HttpOnly` cookie.

**Errors**: `401 UNAUTHORIZED` (invalid credentials), `400 VALIDATION_ERROR`.

---

### `POST /api/v1/auth/refresh`
**Purpose**: Issue a new access token using the refresh token cookie.
**Auth**: None (reads `HttpOnly` cookie)

**Success Response** `200`:
```json
{ "success": true, "data": { "accessToken": "..." } }
```
**Errors**: `401 UNAUTHORIZED` (missing, invalid, or expired refresh token).

---

### `POST /api/v1/auth/logout`
**Purpose**: Revoke the refresh token and clear the cookie.
**Auth**: User (access token)

**Success Response** `200`:
```json
{ "success": true, "data": { "message": "Logged out successfully." } }
```

---

## 3. User Routes

### `GET /api/v1/users/me`
**Purpose**: Get the authenticated user's profile.
**Auth**: User

**Success Response** `200`:
```json
{
  "success": true,
  "data": { "_id": "...", "name": "...", "email": "...", "role": "...", "avatar": "..." }
}
```

---

### `PATCH /api/v1/users/me`
**Purpose**: Update the authenticated user's profile.
**Auth**: User

**Request Body (all optional):**
```json
{ "name": "string", "avatar": "string (URL)" }
```
**Success Response** `200`: Updated user object.

---

### `PATCH /api/v1/users/me/password`
**Purpose**: Change the authenticated user's password.
**Auth**: User

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 8 chars)"
}
```
**Success Response** `200`:
```json
{ "success": true, "data": { "message": "Password updated." } }
```
**Errors**: `401 UNAUTHORIZED` (current password incorrect).

---

## 4. Hackathon Routes (Public)

### `GET /api/v1/hackathons`
**Purpose**: List all published hackathons with filtering and pagination.
**Auth**: None

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 20) |
| `search` | String | Full-text keyword search |
| `eventType` | String | Comma-separated `EventType` values |
| `mode` | String | Comma-separated `EventMode` values |
| `city` | String | City name |
| `category` | String | Category slug |
| `organizer` | String | Organizer slug |
| `hasPrize` | Boolean | `true` to filter only prized events |
| `deadlineFrom` | ISO Date | Registration deadline start range |
| `deadlineTo` | ISO Date | Registration deadline end range |
| `sort` | String | `deadline_asc`, `deadline_desc`, `createdAt_desc` |

**Success Response** `200`:
```json
{
  "success": true,
  "data": {
    "results": [ { ...hackathon } ],
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

---

### `GET /api/v1/hackathons/:slug`
**Purpose**: Get a single hackathon's full details by slug.
**Auth**: None

**Success Response** `200`:
```json
{
  "success": true,
  "data": { ...hackathon, "organizer": { ...organizer }, "categories": [ ...categories ] }
}
```
**Errors**: `404 NOT_FOUND`.

---

## 5. Organizer Routes (Public)

### `GET /api/v1/organizers`
**Purpose**: List all organizers.
**Auth**: None

**Query Params**: `page`, `limit`, `search`

**Success Response** `200`: Paginated list of organizers.

---

### `GET /api/v1/organizers/:slug`
**Purpose**: Get organizer profile with their published events.
**Auth**: None

**Success Response** `200`:
```json
{
  "success": true,
  "data": {
    "organizer": { ...organizer },
    "hackathons": [ { ...hackathon } ]
  }
}
```

---

## 6. Category Routes (Public)

### `GET /api/v1/categories`
**Purpose**: List all categories.
**Auth**: None

**Success Response** `200`: Array of category objects.

---

## 7. Bookmark Routes

### `GET /api/v1/bookmarks`
**Purpose**: List all hackathons bookmarked by the authenticated user.
**Auth**: User

**Query Params**: `page`, `limit`

**Success Response** `200`: Paginated list of bookmarked hackathon objects.

---

### `POST /api/v1/bookmarks`
**Purpose**: Bookmark a hackathon.
**Auth**: User

**Request Body:**
```json
{ "hackathonId": "string (ObjectId)" }
```
**Success Response** `201`: Created bookmark document.
**Errors**: `409 CONFLICT` (already bookmarked), `404 NOT_FOUND` (hackathon not found).

---

### `DELETE /api/v1/bookmarks/:hackathonId`
**Purpose**: Remove a bookmark.
**Auth**: User

**Success Response** `200`:
```json
{ "success": true, "data": { "message": "Bookmark removed." } }
```
**Errors**: `404 NOT_FOUND`.

---

### `GET /api/v1/bookmarks/check/:hackathonId`
**Purpose**: Check if the authenticated user has bookmarked a specific hackathon.
**Auth**: User

**Success Response** `200`:
```json
{ "success": true, "data": { "isBookmarked": true } }
```

---

## 8. Reminder Routes

### `GET /api/v1/reminders`
**Purpose**: List all reminders for the authenticated user.
**Auth**: User

**Success Response** `200`: Paginated list of reminder documents with populated hackathon.

---

### `POST /api/v1/reminders`
**Purpose**: Create a new reminder for an event.
**Auth**: User

**Request Body:**
```json
{
  "hackathonId": "string (ObjectId)",
  "trigger": "registration_deadline | event_start",
  "offsetHours": 24
}
```
**Validation**:
- `trigger` must be a valid `ReminderTrigger`.
- `offsetHours` must be a positive integer.
- The computed `scheduledAt` must be in the future.

**Success Response** `201`: Created reminder document.
**Errors**: `409 CONFLICT` (duplicate trigger for same hackathon), `400 VALIDATION_ERROR`.

---

### `DELETE /api/v1/reminders/:reminderId`
**Purpose**: Cancel a reminder.
**Auth**: User (must own the reminder)

**Success Response** `200`:
```json
{ "success": true, "data": { "message": "Reminder cancelled." } }
```

---

## 9. Submission Routes

### `GET /api/v1/submissions/mine`
**Purpose**: List the authenticated user's own submissions.
**Auth**: User

**Success Response** `200`: Paginated list of submission documents.

---

### `POST /api/v1/submissions`
**Purpose**: Submit a new hackathon suggestion for admin review.
**Auth**: User

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "eventType": "hackathon | coding contest | ideathon | innovation challenge",
  "mode": "online | offline | hybrid",
  "organizer": "string",
  "city": "string (optional)",
  "websiteUrl": "string (optional)",
  "registrationUrl": "string (optional)",
  "registrationDeadline": "ISO Date (optional)",
  "eventStartDate": "ISO Date (optional)"
}
```
**Success Response** `201`: Created submission document.

---

### `PATCH /api/v1/submissions/:submissionId`
**Purpose**: Edit a pending submission (own submissions only).
**Auth**: User

**Request Body**: Same as POST (all fields optional).
**Errors**: `403 FORBIDDEN` (not owner or not in `pending` status).

---

### `DELETE /api/v1/submissions/:submissionId`
**Purpose**: Withdraw a pending submission.
**Auth**: User (must own, must be `pending`)

**Success Response** `200`:
```json
{ "success": true, "data": { "message": "Submission withdrawn." } }
```

---

## 10. Notification Routes

### `GET /api/v1/notifications`
**Purpose**: List all notifications for the authenticated user.
**Auth**: User

**Query Params**: `page`, `limit`, `isRead` (Boolean filter)

**Success Response** `200`: Paginated list of notification documents.

---

### `PATCH /api/v1/notifications/:notificationId/read`
**Purpose**: Mark a single notification as read.
**Auth**: User (must own)

**Success Response** `200`: Updated notification document.

---

### `PATCH /api/v1/notifications/read-all`
**Purpose**: Mark all notifications for the user as read.
**Auth**: User

**Success Response** `200`:
```json
{ "success": true, "data": { "modifiedCount": 5 } }
```

---

## 11. Admin — Hackathon Management

All admin routes require `role === 'admin'`.

### `POST /api/v1/admin/hackathons`
**Purpose**: Create a new hackathon.
**Auth**: Admin

**Request Body**: Full hackathon fields (see DATABASE.md). `status` defaults to `draft`.

**Success Response** `201`: Created hackathon document.

---

### `PATCH /api/v1/admin/hackathons/:hackathonId`
**Purpose**: Update any field of an existing hackathon.
**Auth**: Admin

**Request Body**: Partial hackathon fields.

**Success Response** `200`: Updated hackathon document.

---

### `PATCH /api/v1/admin/hackathons/:hackathonId/status`
**Purpose**: Change hackathon status (publish, archive, draft).
**Auth**: Admin

**Request Body:**
```json
{ "status": "draft | published | archived" }
```
**Success Response** `200`: Updated hackathon document.

---

### `PATCH /api/v1/admin/hackathons/:hackathonId/feature`
**Purpose**: Toggle the `isFeatured` flag.
**Auth**: Admin

**Request Body:**
```json
{ "isFeatured": true }
```
**Success Response** `200`: Updated hackathon document.

---

### `DELETE /api/v1/admin/hackathons/:hackathonId`
**Purpose**: Permanently delete a hackathon.
**Auth**: Admin

**Success Response** `200`:
```json
{ "success": true, "data": { "message": "Hackathon deleted." } }
```

---

## 12. Admin — Organizer Management

### `POST /api/v1/admin/organizers`
**Purpose**: Create a new organizer.
**Auth**: Admin

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "logoUrl": "string (optional)",
  "websiteUrl": "string (optional)",
  "email": "string (optional)",
  "socialLinks": { "facebook": "string", "linkedin": "string" }
}
```
**Success Response** `201`: Created organizer document.

---

### `PATCH /api/v1/admin/organizers/:organizerId`
**Purpose**: Update an organizer.
**Auth**: Admin

**Success Response** `200`: Updated organizer document.

---

### `DELETE /api/v1/admin/organizers/:organizerId`
**Purpose**: Delete an organizer. Blocked if active hackathons reference it.
**Auth**: Admin

**Errors**: `409 CONFLICT` (organizer has associated events).

---

## 13. Admin — Category Management

### `POST /api/v1/admin/categories`
**Purpose**: Create a new category.
**Auth**: Admin

**Request Body:**
```json
{ "name": "string", "description": "string (optional)" }
```
`slug` is auto-generated from `name`.

---

### `PATCH /api/v1/admin/categories/:categoryId`
**Purpose**: Update category name and description.
**Auth**: Admin

---

### `DELETE /api/v1/admin/categories/:categoryId`
**Purpose**: Delete a category. Blocked if hackathons reference it.
**Auth**: Admin

---

## 14. Admin — Submission Review

### `GET /api/v1/admin/submissions`
**Purpose**: List all submissions (filterable by status).
**Auth**: Admin

**Query Params**: `status` (`pending`, `approved`, `rejected`), `page`, `limit`

---

### `GET /api/v1/admin/submissions/:submissionId`
**Purpose**: Get full details of a single submission.
**Auth**: Admin

---

### `POST /api/v1/admin/submissions/:submissionId/approve`
**Purpose**: Approve a submission and create a published hackathon from it.
**Auth**: Admin

**Request Body**: Optional overrides for any hackathon fields before publishing.

**Success Response** `201`:
```json
{
  "success": true,
  "data": { "submission": { ...updatedSubmission }, "hackathon": { ...createdHackathon } }
}
```

---

### `POST /api/v1/admin/submissions/:submissionId/reject`
**Purpose**: Reject a submission with an optional note.
**Auth**: Admin

**Request Body:**
```json
{ "reviewNote": "string (optional)" }
```

---

## 15. Admin — Job Monitoring (Phase 8)

### `GET /api/v1/admin/sources`
**Purpose**: List all source configurations.
**Auth**: Admin

---

### `POST /api/v1/admin/sources`
**Purpose**: Create a new source configuration.
**Auth**: Admin

---

### `PATCH /api/v1/admin/sources/:sourceId`
**Purpose**: Update a source configuration.
**Auth**: Admin

---

### `POST /api/v1/admin/sources/:sourceId/run`
**Purpose**: Manually trigger a scraping job for the source.
**Auth**: Admin

**Success Response** `202`:
```json
{ "success": true, "data": { "message": "Import job queued.", "jobId": "..." } }
```

---

### `GET /api/v1/admin/sources/:sourceId/logs`
**Purpose**: List job logs for a specific source.
**Auth**: Admin

**Query Params**: `page`, `limit`, `status`
