/**
 * types/index.ts — Frontend TypeScript type registry (Phase 1).
 *
 * Keep domain-specific types in types/<domain>.ts files and re-export here.
 * Example:
 *   export type * from "./hackathon";
 *   export type * from "./user";
 */

// ── API envelope ──────────────────────────────────────────────────────────────
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
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

// ── Domain enums ──────────────────────────────────────────────────────────────
export type UserRole = "user" | "admin";

export type HackathonStatus =
  | "draft"
  | "published"
  | "archived"
  | "pending_review";

export type SubmissionStatus = "pending" | "approved" | "rejected";

// ── Shared UI types ───────────────────────────────────────────────────────────
export interface SelectOption {
  label: string;
  value: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ── Phase 2+: add User, Hackathon, Organizer, Category interfaces ─────────────
