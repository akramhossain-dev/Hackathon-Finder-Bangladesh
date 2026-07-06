"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthed } from "@/hooks/useRequireAuth";
import { ROUTES } from "@/lib/constants";
import { ApiErrorPayload } from "@/lib/api";

export default function RegisterPage() {
  useRedirectIfAuthed();

  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
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
      await register(name, email, password);
      router.push(`${ROUTES.login}?registered=1`);
    } catch (err) {
      const payload = err as ApiErrorPayload;
      if (payload?.errors?.length) {
        const map: Record<string, string> = {};
        payload.errors.forEach(({ field, message }) => {
          map[field] = message;
        });
        setFieldErrors(map);
      } else {
        setError(payload?.message ?? "Registration failed. Please try again.");
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join Hackathon Finder Bangladesh today</p>
        </div>

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
          {/* Name */}
          <div className="form-group">
            <label htmlFor="register-name" className="form-label">Full name</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahim Uddin"
              className={`form-input ${fieldErrors["name"] ? "form-input-error" : ""}`}
              disabled={isLoading}
            />
            {fieldErrors["name"] && (
              <p className="form-field-error">{fieldErrors["name"]}</p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="register-email" className="form-label">Email address</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="form-label">
              Password
              <span className="form-label-hint">min. 8 characters</span>
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
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
            id="register-submit"
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link href={ROUTES.login} className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
