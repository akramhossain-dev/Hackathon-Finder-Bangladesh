/**
 * slug.ts — URL-safe slug generation utility.
 *
 * Phase 1: used by HackathonService and OrganizerService
 * to generate unique slugs from titles/names.
 */

/**
 * Convert a string to a URL-safe slug.
 * @example toSlug("My Hackathon 2025!") → "my-hackathon-2025"
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
