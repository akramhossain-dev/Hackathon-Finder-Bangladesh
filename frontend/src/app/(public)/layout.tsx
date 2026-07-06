/**
 * (public)/layout.tsx — Layout wrapper for public guest-accessible routes.
 *
 * Public routes: hackathon listing, hackathon detail, organizer profile.
 * Rendering strategy: SSR + ISR (see docs/ARCHITECTURE.md §2)
 *
 * Phase 3: Add structured data (JSON-LD) injection here for SEO.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
