/**
 * Shared TypeScript types for the backend — Phase 0 scaffold.
 *
 * Phase 1: Add Mongoose document interfaces, request augmentation.
 */

// ── User ─────────────────────────────────────────────────────────────────
export type UserRole = "user" | "admin";

// ── Hackathon ─────────────────────────────────────────────────────────────
export type HackathonStatus =
  | "draft"
  | "published"
  | "archived"
  | "pending_review";

// ── API Envelope ──────────────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
}

// ── Express request augmentation (Phase 1) ────────────────────────────────
// declare global {
//   namespace Express {
//     interface Request {
//       user?: { _id: string; role: UserRole };
//     }
//   }
// }
export {};
