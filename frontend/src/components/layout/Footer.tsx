import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";

/**
 * Footer — Phase 1 static placeholder.
 *
 * Phase 2+: add newsletter signup, social links, dynamic sitemap links.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-(--color-border) bg-(--color-muted)">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* ── Brand ──────────────────────────────────────────── */}
          <div>
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <span className="text-xl">🇧🇩</span>
              <span className="font-bold text-(--color-foreground)">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-2 text-sm text-(--color-muted-foreground)">
              The go-to platform for discovering hackathons in Bangladesh.
            </p>
          </div>

          {/* ── Explore ────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-(--color-muted-foreground)">
              Explore
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "All Hackathons", href: ROUTES.hackathons },
                { label: "Submit an Event", href: ROUTES.submissions },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground)"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Account ────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-(--color-muted-foreground)">
              Account
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Login", href: ROUTES.login },
                { label: "Create Account", href: ROUTES.register },
                { label: "Dashboard", href: ROUTES.dashboard },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground)"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div className="mt-8 border-t border-(--color-border) pt-6 text-center text-xs text-(--color-muted-foreground)">
          © {currentYear} {APP_NAME}. Built for the Bangladeshi tech community.
        </div>
      </div>
    </footer>
  );
}
