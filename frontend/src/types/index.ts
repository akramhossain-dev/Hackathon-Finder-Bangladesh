/**
 * Global TypeScript type definitions — Phase 0 scaffolding.
 *
 * Full Mongoose-backed types will be moved here in Phase 1
 * after DATABASE.md schemas are implemented.
 */

// ── Shared API envelope ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── User roles ─────────────────────────────────────────────────────────────
export type UserRole = "user" | "admin";

// ── Hackathon status ───────────────────────────────────────────────────────
export type HackathonStatus = "draft" | "published" | "archived" | "pending_review";

// ── Phase 1: add Hackathon, Organizer, Category, Bookmark, Reminder types ──
