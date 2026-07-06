/**
 * (admin)/layout.tsx — Layout wrapper for admin-only routes.
 *
 * Admin routes: /admin/hackathons, /organizers, /categories, /submissions, /jobs
 * Rendering strategy: CSR (auth-gated, role-gated, no SEO requirement)
 *
 * Phase 7:
 *  - Add route guard: redirect if not admin role
 *  - Add admin sidebar with all management links
 *  - Add admin-specific styling (e.g., dark header bar)
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/*
       * Phase 7: Add <AdminSidebar> and role guard here.
       * See docs/ADMIN_PANEL.md for full capabilities.
       */}
      {children}
    </div>
  );
}
