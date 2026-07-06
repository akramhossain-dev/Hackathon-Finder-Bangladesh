/**
 * (dashboard)/layout.tsx — Layout wrapper for authenticated user routes.
 *
 * Dashboard routes: /dashboard/bookmarks, /reminders, /submissions, /profile
 * Rendering strategy: CSR (auth-gated, no SEO requirement)
 *
 * Phase 2:
 *  - Add route guard: redirect to /login if not authenticated
 *  - Add dashboard sidebar navigation
 *  - Add user role check for admin-only sections
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/*
       * Phase 2: Add <DashboardSidebar> here.
       * Layout will become a two-column grid: sidebar + content.
       */}
      {children}
    </div>
  );
}
