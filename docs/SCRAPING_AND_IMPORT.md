# Scraping and Import — Hackathon Finder Bangladesh

## 1. Why the Import Pipeline Exists

Manual data entry by admins is the primary content ingestion method for the MVP. However, as the platform grows, continuously monitoring dozens of external sources (university websites, Facebook pages, DevPost, event platforms) by hand becomes unsustainable.

The scraping and import pipeline exists to:

- Semi-automate the discovery of new hackathons from known external sources.
- Reduce admin workload for routine data ingestion.
- Ensure timely discovery of events with short announcement windows.

All imported records require admin review before publication. The pipeline is a **draft-generation tool**, not an autonomous publisher.

---

## 2. Supported Source Types

| Source Type | `sourceType` Value | Description |
|-------------|-------------------|-------------|
| HTML page scraping | `html_scrape` | Fetch and parse an HTML page using CSS selectors |
| RSS / Atom feed | `rss_feed` | Parse a structured XML feed |
| JSON API endpoint | `api_endpoint` | Fetch and normalize a JSON response from a public API |

Each source type uses a dedicated adapter in `src/scrapers/adapters/`.

---

## 3. Source Configuration Model

Each external source is represented by a `sourceConfig` document (see DATABASE.md). Key fields:

| Field | Purpose |
|-------|---------|
| `name` | Human-readable label for the source (e.g., "DIU Event Page") |
| `url` | The URL to fetch or poll |
| `sourceType` | Determines which adapter to use |
| `isActive` | Whether this source is included in scheduled runs |
| `cronSchedule` | Optional cron expression controlling auto-run frequency |
| `adapterConfig` | Source-specific configuration object |
| `lastRunAt` | Timestamp of most recent job execution |

### `adapterConfig` Structure by Source Type

**`html_scrape`:**
```json
{
  "listSelector": ".event-list .event-item",
  "fields": {
    "name": ".event-title",
    "websiteUrl": "a[href]@href",
    "registrationDeadline": ".deadline",
    "description": ".event-desc"
  },
  "pagination": {
    "nextSelector": ".pagination .next",
    "maxPages": 5
  }
}
```

**`rss_feed`:**
```json
{
  "fieldMapping": {
    "name": "title",
    "description": "description",
    "websiteUrl": "link",
    "eventStartDate": "pubDate"
  }
}
```

**`api_endpoint`:**
```json
{
  "method": "GET",
  "headers": { "Accept": "application/json" },
  "responseArrayPath": "data.events",
  "fieldMapping": {
    "name": "eventName",
    "description": "details",
    "registrationDeadline": "deadline",
    "websiteUrl": "url"
  }
}
```

---

## 4. Scrape / Import Workflow

```
Trigger (manual or cron)
        │
        ▼
[BullMQ: import queue]
  Job payload: { sourceConfigId }
        │
        ▼
[Import Worker]
  1. Load sourceConfig from MongoDB
  2. Check isActive === true → skip if false
  3. Select adapter by sourceType
  4. Fetch raw data (Playwright / Cheerio / axios)
  5. Extract fields using adapterConfig
  6. Normalize each record (see section 5)
  7. For each normalized record:
      a. Run duplicate check (see section 6)
      b. If duplicate → skip, increment itemsSkipped
      c. If new → create hackathon with status: 'pending_review'
                  increment itemsCreated
  8. Update sourceConfig.lastRunAt
  9. Write jobLog document
```

---

## 5. Extraction and Normalization

Raw data from any source type is passed through a **normalization layer** before being stored.

### Normalization Steps

| Step | Description |
|------|-------------|
| **Field mapping** | Map source-specific field names to the hackathon schema fields |
| **String trimming** | Trim all string values |
| **HTML stripping** | Strip HTML tags from description fields |
| **URL normalization** | Resolve relative URLs against the source base URL; reject non-HTTPS |
| **Date parsing** | Parse date strings into ISO 8601 UTC timestamps using `date-fns` or `dayjs` |
| **Type coercion** | Convert string booleans, numbers, and enums to correct types |
| **Default assignment** | Apply defaults for missing optional fields |
| **Zod validation** | Run the normalized record through a Zod schema. Records that fail validation are skipped and logged as errors. |

### Normalized Record Shape

After normalization, each record must satisfy at minimum:

```ts
{
  name: string;           // required
  sourceUrl: string;      // required — original URL for dedup
  eventType: EventType;   // required — inferred or defaulted to 'hackathon'
  mode: EventMode;        // required — inferred or defaulted to 'online'
  status: 'pending_review';
  importedBy: ObjectId;   // sourceConfig._id
}
```

All other fields are optional and stored if present.

---

## 6. Duplicate Detection Strategy

Duplicate detection prevents the same event from being created multiple times across multiple job runs or multiple source configs.

### Detection Methods (in order of precedence)

| Method | Logic |
|--------|-------|
| **Source URL match** | If `hackathon.sourceUrl === record.sourceUrl`, it is a duplicate. |
| **Title + Date fingerprint** | If a hackathon with the same normalized name and same `eventStartDate` (within 1 day) exists, flag as likely duplicate. |
| **Manual admin override** | Admin can mark a `pending_review` record as a duplicate and link it to an existing hackathon. |

### Dedup Implementation

- The worker queries `hackathons` for `{ sourceUrl: record.sourceUrl }` before creation.
- If no exact URL match, compute a normalized title hash (`slug(name)`) and query for `{ slug: slug, eventStartDate: { $gte: start-1d, $lte: start+1d } }`.
- If either check finds a match, the record is skipped.
- Skipped records are counted in `jobLog.itemsSkipped` but not individually logged unless in verbose mode.

---

## 7. Moderation Behavior for Imported Records

- All records created by the import pipeline are saved with `status: 'pending_review'`.
- They appear in the admin panel's **Submission Review** queue under a separate **Imports** tab (distinct from user submissions).
- The admin reviews and can:
  - **Approve**: Change status to `published`. Link to correct organizer and categories.
  - **Edit then approve**: Correct fields before publishing.
  - **Reject**: Mark as rejected. Record is not deleted but is excluded from future duplicate checks (to prevent repeated re-import).
- Published hackathons retain the `importedBy` and `sourceUrl` fields for auditability.

---

## 8. Confidence / Quality Scoring

A simple **quality score** (0–100) is computed per imported record to help admins prioritize review:

| Signal | Points |
|--------|--------|
| `name` present and non-empty | +20 |
| `description` ≥ 100 characters | +20 |
| `registrationDeadline` is a valid future date | +15 |
| `eventStartDate` is present | +15 |
| `registrationUrl` is a valid HTTPS URL | +15 |
| `organizer` (free-text) is present | +10 |
| `city` is present (for offline/hybrid) | +5 |

Records with a score below 40 are flagged with a `lowConfidence: true` field and displayed with a warning badge in the admin review queue.

---

## 9. Job Logging

Every job execution writes a `jobLog` document with the following outcome data:

| Field | Description |
|-------|-------------|
| `source` | Reference to the sourceConfig |
| `status` | `queued`, `running`, `completed`, `failed` |
| `startedAt` | Job start timestamp |
| `completedAt` | Job completion timestamp |
| `itemsFound` | Number of raw records extracted |
| `itemsCreated` | Number of new `pending_review` hackathons created |
| `itemsSkipped` | Number of duplicates skipped |
| `errors` | Array of error message strings (per-record or job-level) |
| `triggeredBy` | `cron` or `manual` |
| `triggeredByUser` | Admin ObjectId if manually triggered |

Job logs are retained indefinitely but can be purged from the admin panel after 90 days.

---

## 10. Retries and Failure Handling

BullMQ handles retries automatically with the following configuration:

```ts
// import.queue.ts
const importQueue = new Queue('import', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,   // 5s → 25s → 125s
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
```

- **Per-record errors** (e.g., a single malformed record fails Zod validation) do not abort the job. The error is appended to `jobLog.errors` and the next record is processed.
- **Job-level failures** (e.g., the target site is unreachable, Playwright browser crash) trigger BullMQ's retry logic. After all attempts fail, the job is moved to the failed queue.
- The `jobLog` is updated to `status: 'failed'` and the errors array is populated.
- Admins are not automatically notified of job failures in the MVP. They must check the Job Monitoring page. (Alerting can be added in a later phase.)
- A job that fails all retries does not block subsequent scheduled runs of the same source.

---

## 11. Ethical and Operational Constraints

| Constraint | Rule |
|------------|------|
| **robots.txt compliance** | Before fetching any URL, the scraper checks `robots.txt` for the domain. If the path is disallowed, the URL is skipped and the error is logged. |
| **User-Agent transparency** | All requests use a descriptive `User-Agent`: `HackathonFinderBD/1.0 (+https://hackathonfinder.com/about)` |
| **Rate limiting** | A configurable delay (default: 2 seconds) is introduced between page requests to avoid overloading source servers. |
| **No login-gated content** | Scrapers only access publicly available pages. No credentials for third-party sites are stored or used. |
| **HTTPS only** | Source URLs must be `https://`. HTTP sources are rejected at the `sourceConfig` validation level. |
| **Content copyright** | Scraped data is used to create event listings with links back to the original source. Full content is not reproduced verbatim. |
| **Manual review gate** | All imported records require admin approval before public visibility. |
| **Opt-out mechanism** | If an organizer requests their events not be scraped, their domain is added to a blocklist in the source config and the scraper skips it. |
