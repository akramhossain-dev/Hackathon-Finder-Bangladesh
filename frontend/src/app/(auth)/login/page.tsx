"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthed } from "@/hooks/useRequireAuth";
import { ROUTES } from "@/lib/constants";
import { ApiErrorPayload } from "@/lib/api";

export default function LoginPage() {
  useRedirectIfAuthed();

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      router.push(ROUTES.dashboard);
    } catch (err) {
      const payload = err as ApiErrorPayload;
      if (payload?.errors?.length) {
        const map: Record<string, string> = {};
        payload.errors.forEach(({ field, message }) => {
          map[field] = message;
        });
        setFieldErrors(map);
      } else {
        setError(payload?.message ?? "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-logo-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your Hackathon Finder account</p>
        </div>

        {/* Registration success banner */}
        {justRegistered && (
          <div className="auth-success-banner" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Account created! Please sign in.</span>
          </div>
        )}

        {/* Global error */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`form-input ${fieldErrors["email"] ? "form-input-error" : ""}`}
              disabled={isLoading}
            />
            {fieldErrors["email"] && (
              <p className="form-field-error">{fieldErrors["email"]}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`form-input ${fieldErrors["password"] ? "form-input-error" : ""}`}
              disabled={isLoading}
            />
            {fieldErrors["password"] && (
              <p className="form-field-error">{fieldErrors["password"]}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer-text">
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.register} className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
