/**
 * (auth)/layout.tsx — Layout wrapper for authentication routes.
 *
 * Auth routes: /login, /register, /forgot-password, /reset-password
 * Rendering strategy: CSR (no SEO requirement)
 *
 * Phase 2:
 *  - Add redirect logic: if user is already authenticated, redirect to /dashboard
 *  - Add centered card layout for auth forms
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}
