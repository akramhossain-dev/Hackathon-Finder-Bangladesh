"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/lib/constants";

/**
 * useRequireAuth — Route protection hook (Phase 2).
 *
 * Redirects unauthenticated users to /login.
 * Use in page components that require authentication.
 *
 * Usage:
 *   export default function DashboardPage() {
 *     const { user } = useRequireAuth();
 *     if (!user) return null; // renders nothing during redirect
 *     return <Dashboard />;
 *   }
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isLoading, isAuthenticated, router]);

  return { user, isLoading };
}

/**
 * useRedirectIfAuthed — Redirect already-authenticated users away from auth pages.
 *
 * Usage:
 *   export default function LoginPage() {
 *     useRedirectIfAuthed(); // redirects to /dashboard if logged in
 *     return <LoginForm />;
 *   }
 */
export function useRedirectIfAuthed(destination = ROUTES.dashboard) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, router, destination]);

  return { isLoading };
}
