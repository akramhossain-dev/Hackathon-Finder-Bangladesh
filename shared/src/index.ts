/**
 * shared/src/index.ts — Shared types between frontend and backend.
 *
 * Phase 1: Move common types here to avoid duplication.
 * Both frontend and backend can import from this package.
 *
 * To use (after Phase 1 npm workspace setup):
 *   import type { ApiResponse } from "@hackathon-finder/shared";
 */

// ── Shared API envelope ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ── Domain enums ───────────────────────────────────────────────────────────
export type UserRole = "user" | "admin";
export type HackathonStatus =
  | "draft"
  | "published"
  | "archived"
  | "pending_review";
