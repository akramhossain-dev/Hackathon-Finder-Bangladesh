import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES, APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { Container, SectionHeading } from "@/components/shared";
import HomeFeaturedSection from "./_components/HomeFeaturedSection";

export const metadata: Metadata = {
  title: "Home",
  description: APP_DESCRIPTION,
};

/**
 * HomePage — Phase 4 production homepage.
 *
 * Sections:
 *  1. Hero
 *  2. Featured hackathons (client — fetches from /hackathons?featured=true)
 *  3. How it works / benefits
 *  4. Discovery modes (online vs offline)
 */
export default function HomePage() {
  return (
    <div className="home-page">
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <Container className="hero-inner">
          <div className="hero-badge">
            <span>🇧🇩</span>
            <span>Bangladesh&apos;s hackathon discovery platform</span>
          </div>

          <h1 className="hero-title">
            Find Your Next{" "}
            <span className="hero-title-accent">Hackathon</span>
            <br />in Bangladesh
          </h1>

          <p className="hero-subtitle">
            Discover hackathons, coding contests, ideathons, and innovation challenges.
            One platform — all events, all cities, all formats.
          </p>

          <div className="hero-cta-group">
            <Link href={ROUTES.hackathons} className="hero-cta-primary" id="hero-browse-btn">
              Browse Hackathons
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link href={ROUTES.register} className="hero-cta-secondary" id="hero-signup-btn">
              Create Account
            </Link>
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {[
              { value: "100+", label: "Hackathons" },
              { value: "50+",  label: "Cities" },
              { value: "4",    label: "Event Types" },
              { value: "Free", label: "Always" },
            ].map(s => (
              <div key={s.label} className="hero-stat-item">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </Container>

        {/* decorative background blobs */}
        <div className="hero-blob hero-blob-1" aria-hidden="true" />
        <div className="hero-blob hero-blob-2" aria-hidden="true" />
      </section>

      {/* ── 2. Featured hackathons ──────────────────────────────────────── */}
      <section className="home-section">
        <Container>
          <SectionHeading
            title="Featured Hackathons"
            subtitle="Hand-picked events you shouldn't miss"
            badge="🌟 Featured"
          />
          <HomeFeaturedSection />
          <div className="home-section-cta">
            <Link href={ROUTES.hackathons} className="hero-cta-secondary" id="featured-view-all-btn">
              View all hackathons →
            </Link>
          </div>
        </Container>
      </section>

      {/* ── 3. How it works ────────────────────────────────────────────── */}
      <section className="home-section home-section-muted">
        <Container>
          <SectionHeading
            title="Why Hackathon Finder?"
            subtitle={`${APP_NAME} makes it easy to stay on top of the tech event scene in Bangladesh.`}
            align="center"
            badge="✨ Benefits"
          />
          <div className="benefits-grid">
            {[
              {
                icon: "🔍",
                title: "Discover faster",
                desc: "Search and filter across all events by city, mode, type, and deadline — in seconds.",
              },
              {
                icon: "📅",
                title: "Never miss a deadline",
                desc: "Each hackathon shows its registration deadline front and center so you always act in time.",
              },
              {
                icon: "🇧🇩",
                title: "Bangladesh-focused",
                desc: "Curated for the Bangladeshi tech community — local events, local cities, local context.",
              },
              {
                icon: "🌐",
                title: "Online & offline",
                desc: "Browse online, offline, and hybrid events. Participate from anywhere or attend in person.",
              },
              {
                icon: "🆓",
                title: "Completely free",
                desc: "No subscription needed. Browse every hackathon and click through to register directly.",
              },
              {
                icon: "🚀",
                title: "All event types",
                desc: "Hackathons, coding contests, ideathons, and innovation challenges — all in one place.",
              },
            ].map(b => (
              <div key={b.title} className="benefit-card">
                <span className="benefit-icon">{b.icon}</span>
                <h3 className="benefit-title">{b.title}</h3>
                <p className="benefit-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 4. Event modes ──────────────────────────────────────────────── */}
      <section className="home-section">
        <Container>
          <SectionHeading
            title="Your way, your format"
            subtitle="Whether you prefer to participate online or show up in person, there's an event for you."
            align="center"
          />
          <div className="modes-grid">
            {[
              {
                icon: "🌐",
                mode: "Online",
                desc: "Participate from anywhere in Bangladesh — or the world. No commute, no limits.",
                href: `${ROUTES.hackathons}?mode=online`,
                color: "mode-card-online",
              },
              {
                icon: "📍",
                mode: "Offline",
                desc: "Show up in person, network with builders, and experience the energy of the room.",
                href: `${ROUTES.hackathons}?mode=offline`,
                color: "mode-card-offline",
              },
              {
                icon: "🔀",
                mode: "Hybrid",
                desc: "The best of both worlds — join remotely or attend in person, your choice.",
                href: `${ROUTES.hackathons}?mode=hybrid`,
                color: "mode-card-hybrid",
              },
            ].map(m => (
              <Link key={m.mode} href={m.href} className={`mode-card ${m.color}`} id={`mode-${m.mode.toLowerCase()}`}>
                <span className="mode-icon">{m.icon}</span>
                <h3 className="mode-title">{m.mode}</h3>
                <p className="mode-desc">{m.desc}</p>
                <span className="mode-cta">Browse {m.mode} events →</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 5. Final CTA ────────────────────────────────────────────────── */}
      <section className="home-section home-cta-section">
        <Container>
          <div className="final-cta-card">
            <h2 className="final-cta-title">Ready to build something amazing?</h2>
            <p className="final-cta-desc">Browse hundreds of hackathons and find your next big challenge.</p>
            <Link href={ROUTES.hackathons} className="hero-cta-primary" id="final-cta-btn">
              Explore Hackathons
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
