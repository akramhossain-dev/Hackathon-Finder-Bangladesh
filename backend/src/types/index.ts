/**
 * types/index.ts — Shared backend TypeScript types (Phase 1).
 *
 * Keep this file as the single source of truth for domain-level types
 * that are shared across modules (routes, controllers, services, models).
 *
 * Module-specific types should live in their own <module>.types.ts file.
 */

// ── User ─────────────────────────────────────────────────────────────────────
export type UserRole = "user" | "admin";

// ── Hackathon ─────────────────────────────────────────────────────────────────
export type HackathonStatus =
  | "draft"
  | "published"
  | "archived"
  | "pending_review";

// ── Submission ────────────────────────────────────────────────────────────────
export type SubmissionStatus = "pending" | "approved" | "rejected";

// ── Scraper source types ──────────────────────────────────────────────────────
export type SourceType = "html_scrape" | "rss_feed" | "api_endpoint";

// ── API envelope types ────────────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Request augmentation ─────────────────────────────────────────────────────
// Extended in middlewares/authenticate.ts
// Available on req.user after authenticate() middleware runs
