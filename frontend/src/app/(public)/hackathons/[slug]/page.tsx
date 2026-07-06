"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { hackathonApi, HackathonDetail, EventMode, EventType } from "@/services/hackathon.api";
import { Container } from "@/components/shared";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const MODE_LABELS: Record<EventMode, string> = {
  online: "🌐 Online", offline: "📍 Offline", hybrid: "🔀 Hybrid",
};
const TYPE_LABELS: Record<EventType, string> = {
  "hackathon": "Hackathon",
  "coding-contest": "Coding Contest",
  "ideathon": "Ideathon",
  "innovation-challenge": "Innovation Challenge",
};

export default function HackathonDetailPage() {
  const params = useParams();
  const slug   = params["slug"] as string;

  const [hackathon, setHackathon]         = useState<HackathonDetail | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    hackathonApi.getBySlug(slug)
      .then(setHackathon)
      .catch((err: { status?: number }) => {
        if (err?.status === 404) setNotFoundError(true);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (notFoundError) notFound();

  if (isLoading) {
    return (
      <div className="detail-loading">
        <div className="loading-spinner-lg" />
        <p>Loading event details…</p>
      </div>
    );
  }

  if (!hackathon) return null;

  const h = hackathon;
  const deadlinePassed = new Date(h.registrationDeadline) < new Date();

  return (
    <article className="detail-page">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="detail-page-header">
        {h.banner ? (
          <div className="detail-banner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.banner} alt={h.title} className="detail-banner-img" />
            <div className="detail-banner-overlay" />
          </div>
        ) : (
          <div className="detail-banner detail-banner-placeholder">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <Container>
        <div className="detail-content">
          {/* ── Main column ────────────────────────────────────────────── */}
          <main className="detail-main">
            {/* Breadcrumb */}
            <nav className="detail-breadcrumb" aria-label="Breadcrumb">
              <Link href={ROUTES.hackathons} className="detail-breadcrumb-link">Hackathons</Link>
              <span className="detail-breadcrumb-sep">/</span>
              <span className="detail-breadcrumb-current">{h.title}</span>
            </nav>

            {/* Header */}
            <header className="detail-header">
              <div className="detail-badges">
                <span className="badge badge-type">{TYPE_LABELS[h.eventType] ?? h.eventType}</span>
                <span className="badge badge-mode">{MODE_LABELS[h.mode] ?? h.mode}</span>
                {h.isFeatured && <span className="badge badge-featured">⭐ Featured</span>}
              </div>
              <h1 className="detail-title">{h.title}</h1>
              <p className="detail-organizer">Organized by {h.organizerName}</p>
              {h.organizerWebsite && (
                <a href={h.organizerWebsite} target="_blank" rel="noopener noreferrer" className="detail-org-link">
                  {h.organizerWebsite} ↗
                </a>
              )}
            </header>

            {/* Short description */}
            <p className="detail-short-desc">{h.shortDescription}</p>

            {/* Full description */}
            {h.fullDescription && (
              <section className="detail-section">
                <h2 className="detail-section-title">About this event</h2>
                <div className="detail-prose">{h.fullDescription}</div>
              </section>
            )}

            {/* Eligibility */}
            {h.eligibility.length > 0 && (
              <section className="detail-section">
                <h2 className="detail-section-title">Who can participate?</h2>
                <ul className="detail-list">
                  {h.eligibility.map((item, i) => (
                    <li key={i} className="detail-list-item">{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Rules */}
            {h.rules && (
              <section className="detail-section">
                <h2 className="detail-section-title">Rules &amp; Guidelines</h2>
                <div className="detail-prose">{h.rules}</div>
              </section>
            )}

            {/* Categories */}
            {h.categories?.length > 0 && (
              <section className="detail-section">
                <h2 className="detail-section-title">Categories</h2>
                <div className="detail-tags">
                  {h.categories.map(c => <span key={c} className="detail-tag">{c}</span>)}
                </div>
              </section>
            )}

            {/* Tags */}
            {h.tags.length > 0 && (
              <section className="detail-section">
                <h2 className="detail-section-title">Tags</h2>
                <div className="detail-tags">
                  {h.tags.map(tag => <span key={tag} className="detail-tag">{tag}</span>)}
                </div>
              </section>
            )}

            {/* Back */}
            <Link href={ROUTES.hackathons} className="detail-back-link">
              ← Back to all hackathons
            </Link>
          </main>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="detail-sidebar">
            {/* CTA card */}
            <div className="detail-cta-card">
              {deadlinePassed ? (
                <div className="detail-cta-closed">
                  <p className="detail-cta-closed-label">⏰ Registration closed</p>
                  <p className="detail-cta-closed-date">Deadline was {formatDate(h.registrationDeadline)}</p>
                </div>
              ) : (
                <>
                  <p className="detail-cta-deadline">
                    📅 Register by <strong>{formatDate(h.registrationDeadline)}</strong>
                  </p>
                  <a
                    id="detail-register-btn"
                    href={h.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-cta-btn"
                  >
                    Register Now ↗
                  </a>
                  {h.organizerWebsite && (
                    <a
                      href={h.organizerWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-org-sidebar-link"
                    >
                      Visit organizer site ↗
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Event dates */}
            <div className="detail-info-card">
              <h3 className="detail-info-title">Event Dates</h3>
              <dl className="detail-info-list">
                {h.registrationOpenAt && (
                  <><dt>Registration opens</dt><dd>{formatDate(h.registrationOpenAt)}</dd></>
                )}
                <dt>Registration deadline</dt><dd>{formatDate(h.registrationDeadline)}</dd>
                <dt>Event starts</dt><dd>{formatDate(h.eventStartAt)}</dd>
                <dt>Event ends</dt><dd>{formatDate(h.eventEndAt)}</dd>
              </dl>
            </div>

            {/* Location */}
            {(h.location.city || h.location.country || h.location.venue) && (
              <div className="detail-info-card">
                <h3 className="detail-info-title">Location</h3>
                <dl className="detail-info-list">
                  {h.location.venue   && <><dt>Venue</dt>  <dd>{h.location.venue}</dd></>}
                  {h.location.city    && <><dt>City</dt>   <dd>{h.location.city}</dd></>}
                  {h.location.country && <><dt>Country</dt><dd>{h.location.country}</dd></>}
                  {h.location.address && <><dt>Address</dt><dd>{h.location.address}</dd></>}
                </dl>
              </div>
            )}

            {/* Participation */}
            {(h.teamSizeMin || h.teamSizeMax || h.entryFee !== undefined) && (
              <div className="detail-info-card">
                <h3 className="detail-info-title">Participation</h3>
                <dl className="detail-info-list">
                  {h.entryFee !== undefined && (
                    <><dt>Entry fee</dt><dd>{h.entryFee === 0 ? "Free" : `৳${h.entryFee}`}</dd></>
                  )}
                  {(h.teamSizeMin || h.teamSizeMax) && (
                    <><dt>Team size</dt>
                    <dd>
                      {h.teamSizeMin && h.teamSizeMax
                        ? `${h.teamSizeMin}–${h.teamSizeMax} members`
                        : h.teamSizeMin
                        ? `Min ${h.teamSizeMin} members`
                        : `Max ${h.teamSizeMax} members`}
                    </dd></>
                  )}
                </dl>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </article>
  );
}
