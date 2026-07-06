import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";

/**
 * Navbar — Phase 1 static placeholder.
 *
 * Phase 2 upgrade:
 *  - Add mobile hamburger menu
 *  - Connect to auth state: show Login/Register or User menu
 *  - Highlight active route with usePathname()
 *  - Add search input
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-background)/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ── Brand ──────────────────────────────────────────────── */}
        <Link
          href={ROUTES.home}
          className="flex items-center gap-2 text-lg font-bold text-(--color-foreground) transition-opacity hover:opacity-80"
        >
          <span className="text-2xl">🇧🇩</span>
          <span>
            <span className="text-(--color-brand-500)">Hackathon</span>
            {" "}Finder
          </span>
        </Link>

        {/* ── Nav links ──────────────────────────────────────────── */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href={ROUTES.hackathons}
            className="text-sm font-medium text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground)"
          >
            Hackathons
          </Link>
          {/* Phase 2: show conditional auth links */}
          <Link
            href={ROUTES.login}
            className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-foreground) transition-colors hover:bg-(--color-muted)"
          >
            Login
          </Link>
          <Link
            href={ROUTES.register}
            className="rounded-lg bg-(--color-brand-500) px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-(--color-brand-600)"
          >
            Sign Up
          </Link>
        </nav>

        {/* ── Mobile menu placeholder ─────────────────────────────── */}
        <button
          type="button"
          aria-label="Open menu"
          className="rounded-md p-2 text-(--color-muted-foreground) transition-colors hover:bg-(--color-muted) sm:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export { APP_NAME };
