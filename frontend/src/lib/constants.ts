import { clientEnv } from "@/config/env";

/**
 * constants.ts — Global application constants (Phase 1).
 *
 * Add feature-specific constants in the relevant feature module.
 * Only truly global, cross-cutting constants belong here.
 */

// ── App identity ──────────────────────────────────────────────────────────────
export const APP_NAME = clientEnv.appName;
export const APP_DESCRIPTION =
  "Discover, track, and participate in hackathons across Bangladesh.";
export const APP_URL = clientEnv.siteUrl;

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE_URL = clientEnv.apiUrl;

// ── Pagination defaults ───────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// ── Date & time ───────────────────────────────────────────────────────────────
export const DATE_FORMAT = "dd MMM yyyy";
export const DATETIME_FORMAT = "dd MMM yyyy, HH:mm";

// ── Route paths ───────────────────────────────────────────────────────────────
/** Centralised route map — use these instead of hardcoded strings in <Link> */
export const ROUTES = {
  home: "/",
  // Public
  hackathons: "/hackathons",
  hackathon: (slug: string) => `/hackathons/${slug}`,
  organizer: (slug: string) => `/organizers/${slug}`,
  // Auth
  login: "/login",
  register: "/register",
  // Dashboard
  dashboard: "/dashboard",
  bookmarks: "/dashboard/bookmarks",
  reminders: "/dashboard/reminders",
  submissions: "/dashboard/submissions",
  profile: "/dashboard/profile",
  // Admin
  admin: "/admin",
  adminHackathons: "/admin/hackathons",
  adminOrganizers: "/admin/organizers",
  adminCategories: "/admin/categories",
  adminSubmissions: "/admin/submissions",
  adminJobs: "/admin/jobs",
} as const;

// ── Hackathon status labels ───────────────────────────────────────────────────
export const HACKATHON_STATUS_LABELS = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  pending_review: "Pending Review",
} as const;

// ── Phase 2+: add auth token key, local storage keys, etc. ───────────────────
