import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover, track, and participate in hackathons across Bangladesh — all in one place.",
};

/**
 * Home page — Phase 1 placeholder.
 *
 * Phase 3 will replace this with:
 *  - <HackathonList> with SSR + ISR data from GET /api/v1/hackathons
 *  - <HackathonFilter> sidebar with category, date, status filters
 *  - Pagination / infinite scroll
 *
 * Rendering strategy: SSR + ISR (revalidate: 60s)
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-(--color-brand-200) bg-(--color-accent) px-4 py-1.5 text-sm font-medium text-(--color-accent-foreground)">
          🇧🇩 Phase 1 — Infrastructure Ready
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-(--color-foreground) sm:text-6xl lg:text-7xl">
          Hackathon Finder{" "}
          <span className="text-(--color-brand-500)">Bangladesh</span>
        </h1>

        <p className="max-w-2xl text-lg text-(--color-muted-foreground) sm:text-xl">
          Discover, track, and participate in hackathons across Bangladesh.
          One platform — all events.
        </p>

        {/* ── CTA buttons ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ROUTES.hackathons}
            className="rounded-xl bg-(--color-brand-500) px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-(--color-brand-600)"
          >
            Browse Hackathons
          </Link>
          <Link
            href={ROUTES.register}
            className="rounded-xl border border-(--color-border) px-6 py-3 text-base font-semibold text-(--color-foreground) transition-colors hover:bg-(--color-muted)"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* ── Infrastructure status grid ───────────────────────────────────── */}
      <div className="mt-20">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-(--color-muted-foreground)">
          Build Status
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Frontend",     detail: "Next.js + Tailwind v4",     phase: "Phase 1 ✓", done: true },
            { label: "Backend",      detail: "Express + TypeScript + Zod", phase: "Phase 1 ✓", done: true },
            { label: "Database",     detail: "MongoDB + Mongoose",         phase: "Connect Atlas", done: false },
            { label: "Auth System",  detail: "JWT + HttpOnly cookie",      phase: "Phase 2",   done: false },
          ].map(({ label, detail, phase, done }) => (
            <div
              key={label}
              className="rounded-xl border border-(--color-border) bg-(--color-card) p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-(--color-card-foreground)">{label}</p>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    done ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
              </div>
              <p className="text-xs text-(--color-muted-foreground)">{detail}</p>
              <p className={`mt-2 text-xs font-medium ${done ? "text-emerald-600" : "text-amber-500"}`}>
                {phase}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick links ───────────────────────────────────────────────────── */}
      <div className="mt-12 text-center text-sm text-(--color-muted-foreground)">
        Backend health check:{" "}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"}/health`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-(--color-brand-500) hover:underline"
        >
          /api/v1/health
        </a>
      </div>
    </div>
  );
}
