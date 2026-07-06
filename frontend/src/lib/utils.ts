import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * utils.ts — General utility functions (Phase 1).
 *
 * Keep this file lean. Move domain-specific utils to the relevant module.
 */

// ── Tailwind class merging ─────────────────────────────────────────────────────
/** Merge Tailwind classes safely, resolving conflicts. Used by all shadcn/ui components. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── String utilities ──────────────────────────────────────────────────────────

/** Capitalise the first letter of a string */
export function capitalise(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Truncate a string to a max length, appending "…" */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

// ── Date utilities ────────────────────────────────────────────────────────────

/** Format a date to a readable string: "5 Jul 2026" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Returns true if a date is in the future */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() > Date.now();
}

// ── URL utilities ─────────────────────────────────────────────────────────────

/** Build a query string from an object, omitting null/undefined values */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// ── Phase 2+: add auth helpers, local storage wrappers, etc. ─────────────────
