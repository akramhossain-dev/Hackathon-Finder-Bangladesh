import Link from "next/link";
import { HackathonCard as HackathonCardType, EventType, EventMode } from "@/services/hackathon.api";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const MODE_LABELS: Record<EventMode, string> = {
  online:  "🌐 Online",
  offline: "📍 Offline",
  hybrid:  "🔀 Hybrid",
};

const TYPE_LABELS: Record<EventType, string> = {
  "hackathon":             "Hackathon",
  "coding-contest":        "Coding Contest",
  "ideathon":              "Ideathon",
  "innovation-challenge":  "Innovation Challenge",
};

interface HackathonCardProps {
  hackathon: HackathonCardType;
  /** compact variant for homepage grids */
  variant?: "default" | "compact";
}

/**
 * HackathonCard — reusable card used on listing page, homepage, etc.
 */
export default function HackathonCard({ hackathon: h, variant = "default" }: HackathonCardProps) {
  const deadlinePassed = new Date(h.registrationDeadline) < new Date();
  const isCompact = variant === "compact";

  return (
    <Link href={ROUTES.hackathon(h.slug)} className="hackathon-card" aria-label={`View ${h.title}`}>
      {/* Banner */}
      {!isCompact && (
        h.banner ? (
          <div className="hackathon-card-banner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.banner} alt="" className="hackathon-card-banner-img" />
          </div>
        ) : (
          <div className="hackathon-card-banner hackathon-card-banner-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        )
      )}

      {/* Body */}
      <div className={`hackathon-card-body ${isCompact ? "hackathon-card-body-compact" : ""}`}>
        {/* Badges */}
        <div className="hackathon-card-badges">
          <span className="badge badge-type">{TYPE_LABELS[h.eventType] ?? h.eventType}</span>
          <span className="badge badge-mode">{MODE_LABELS[h.mode] ?? h.mode}</span>
          {h.isFeatured && <span className="badge badge-featured">⭐ Featured</span>}
        </div>

        {/* Title */}
        <h3 className="hackathon-card-title">{h.title}</h3>

        {/* Organizer */}
        <p className="hackathon-card-organizer">{h.organizerName}</p>

        {/* Short desc — only on default variant */}
        {!isCompact && (
          <p className="hackathon-card-desc">{h.shortDescription}</p>
        )}

        {/* Meta */}
        <div className="hackathon-card-meta">
          {h.location.city && (
            <span className="hackathon-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {h.location.city}
            </span>
          )}
          <span className="hackathon-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(h.eventStartAt)}
          </span>
        </div>

        {/* Deadline */}
        <div className={`hackathon-card-deadline ${deadlinePassed ? "deadline-passed" : "deadline-open"}`}>
          {deadlinePassed
            ? "⏰ Registration closed"
            : `📅 Register by ${formatDate(h.registrationDeadline)}`}
        </div>
      </div>
    </Link>
  );
}
