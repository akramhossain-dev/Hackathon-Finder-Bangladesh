/**
 * config/env.ts — Frontend environment configuration (Phase 1).
 *
 * Centralises all environment variable access.
 * Only NEXT_PUBLIC_* variables are accessible on the client side.
 *
 * Usage: import { clientEnv } from "@/config/env"
 *
 * NOTE: Unlike the backend, we cannot use Zod here at runtime for private vars
 * because Next.js does not expose non-public env vars to the browser bundle.
 * We validate what we can and document the rest.
 */

function requirePublicEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    if (typeof window !== "undefined") {
      // Client-side: log a warning but don't crash
      console.warn(`[env] Missing public env var: ${key}`);
    }
    return fallback ?? "";
  }
  return value;
}

/** Client-safe environment variables (all NEXT_PUBLIC_*) */
export const clientEnv = {
  /** Base URL for the backend REST API */
  apiUrl: requirePublicEnv(
    "NEXT_PUBLIC_API_URL",
    "http://localhost:5000/api/v1"
  ),

  /** Human-readable application name */
  appName: requirePublicEnv("NEXT_PUBLIC_APP_NAME", "Hackathon Finder Bangladesh"),

  /** Public site URL (used in OG metadata) */
  siteUrl: requirePublicEnv(
    "NEXT_PUBLIC_SITE_URL",
    "http://localhost:3000"
  ),
} as const;

export type ClientEnv = typeof clientEnv;
