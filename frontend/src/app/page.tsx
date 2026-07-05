import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Browse hackathons happening across Bangladesh — all in one place.",
};

/**
 * Home page — Phase 0 placeholder.
 *
 * Phase 1 will replace this with:
 *  - <HackathonList> with SSR + ISR
 *  - <HackathonFilter> sidebar/drawer
 *  - Pagination / infinite scroll
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-20">
      {/* ── Logo / Badge ─────────────────────────────────────────── */}
      <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">
        🇧🇩 Phase 0 — Bootstrap Complete
      </span>

      {/* ── Heading ──────────────────────────────────────────────── */}
      <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
        Hackathon Finder{" "}
        <span className="text-sky-500">Bangladesh</span>
      </h1>

      <p className="max-w-xl text-center text-lg text-slate-500 dark:text-slate-400">
        Discover, track, and participate in hackathons across Bangladesh.
        Feature development begins in Phase 1.
      </p>

      {/* ── Status grid ──────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Frontend", status: "Ready", color: "green" },
          { label: "Backend", status: "Ready", color: "green" },
          { label: "Database", status: "Phase 1", color: "yellow" },
        ].map(({ label, status, color }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p
              className={`mt-1 text-base font-semibold ${
                color === "green"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-500 dark:text-amber-400"
              }`}
            >
              {status}
            </p>
          </div>
        ))}
      </div>

      {/* ── API health link ───────────────────────────────────────── */}
      <p className="mt-4 text-sm text-slate-400">
        Backend health check:{" "}
        <a
          href="http://localhost:5000/api/health"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-500 hover:underline"
        >
          http://localhost:5000/api/health
        </a>
      </p>
    </main>
  );
}
