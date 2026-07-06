"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  hackathonApi,
  HackathonCard,
  HackathonListParams,
  EventMode,
  EventType,
  PaginationMeta,
} from "@/services/hackathon.api";
import { formatDate, buildQueryString } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

// ── Label maps ────────────────────────────────────────────────────────────────

const MODE_LABELS: Record<EventMode, string> = {
  online: "🌐 Online",
  offline: "📍 Offline",
  hybrid: "🔀 Hybrid",
};

const TYPE_LABELS: Record<EventType, string> = {
  "hackathon": "Hackathon",
  "coding-contest": "Coding Contest",
  "ideathon": "Ideathon",
  "innovation-challenge": "Innovation Challenge",
};

const MODE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All modes" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All types" },
  { value: "hackathon", label: "Hackathon" },
  { value: "coding-contest", label: "Coding Contest" },
  { value: "ideathon", label: "Ideathon" },
  { value: "innovation-challenge", label: "Innovation Challenge" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HackathonsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filters from URL
  const [search, setSearch]     = useState(searchParams.get("search") ?? "");
  const [city, setCity]         = useState(searchParams.get("city") ?? "");
  const [mode, setMode]         = useState(searchParams.get("mode") ?? "");
  const [eventType, setEventType] = useState(searchParams.get("eventType") ?? "");
  const [page, setPage]         = useState(Number(searchParams.get("page") ?? 1));

  const [hackathons, setHackathons]   = useState<HackathonCard[]>([]);
  const [pagination, setPagination]   = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchHackathons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: HackathonListParams = { page, limit: 12, sort: "latest" };
      if (search)    params.search    = search;
      if (city)      params.city      = city;
      if (mode)      params.mode      = mode as EventMode;
      if (eventType) params.eventType = eventType as EventType;

      const result = await hackathonApi.list(params);
      setHackathons(result.hackathons);
      setPagination(result.pagination);
    } catch {
      setError("Failed to load hackathons. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, city, mode, eventType]);

  useEffect(() => { fetchHackathons(); }, [fetchHackathons]);

  // ── Sync filters to URL ────────────────────────────────────────────────────

  useEffect(() => {
    const qs = buildQueryString({ search, city, mode, eventType, page: page > 1 ? page : undefined });
    router.replace(`/hackathons${qs}`, { scroll: false });
  }, [search, city, mode, eventType, page, router]);

  // ── Filter submit ──────────────────────────────────────────────────────────

  function handleFilterSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchHackathons();
  }

  function handleReset() {
    setSearch(""); setCity(""); setMode(""); setEventType(""); setPage(1);
  }

  const hasFilters = search || city || mode || eventType;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="hackathons-page">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="hackathons-header">
        <div className="hackathons-header-inner">
          <h1 className="hackathons-title">Hackathons in Bangladesh</h1>
          <p className="hackathons-subtitle">
            Discover hackathons, coding contests, and innovation challenges across the country.
          </p>
        </div>
      </div>

      <div className="hackathons-body">
        {/* ── Filter bar ───────────────────────────────────────────────────── */}
        <form onSubmit={handleFilterSubmit} className="filter-bar">
          {/* Search */}
          <div className="filter-search-wrap">
            <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              id="hackathon-search"
              placeholder="Search hackathons…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="filter-search-input"
            />
          </div>

          {/* City */}
          <input
            type="text"
            id="hackathon-city"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="filter-input"
          />

          {/* Mode */}
          <select
            id="hackathon-mode"
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="filter-select"
          >
            {MODE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Event type */}
          <select
            id="hackathon-type"
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            className="filter-select"
          >
            {TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button type="submit" id="hackathon-filter-submit" className="filter-btn-primary">
            Search
          </button>

          {hasFilters && (
            <button type="button" onClick={handleReset} className="filter-btn-ghost">
              Clear
            </button>
          )}
        </form>

        {/* ── Content area ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="hackathons-loading">
            <div className="loading-spinner-lg" />
            <p>Loading hackathons…</p>
          </div>
        ) : error ? (
          <div className="hackathons-error">
            <p>{error}</p>
            <button onClick={fetchHackathons} className="filter-btn-primary">Retry</button>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="hackathons-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="hackathons-empty-title">No hackathons found</p>
            <p className="hackathons-empty-sub">Try adjusting your filters or check back later.</p>
            {hasFilters && <button onClick={handleReset} className="filter-btn-ghost">Clear filters</button>}
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="hackathons-count">
              {pagination?.total ?? hackathons.length} hackathon{(pagination?.total ?? 0) !== 1 ? "s" : ""} found
            </p>

            {/* Grid */}
            <div className="hackathons-grid">
              {hackathons.map(h => (
                <HackathonCardItem key={h._id} hackathon={h} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  id="hackathon-prev-page"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="pagination-btn"
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  id="hackathon-next-page"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Hackathon card ────────────────────────────────────────────────────────────

function HackathonCardItem({ hackathon: h }: { hackathon: HackathonCard }) {
  const deadlinePassed = new Date(h.registrationDeadline) < new Date();

  return (
    <Link href={ROUTES.hackathon(h.slug)} className="hackathon-card">
      {/* Banner */}
      {h.banner ? (
        <div className="hackathon-card-banner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={h.banner} alt={h.title} className="hackathon-card-banner-img" />
        </div>
      ) : (
        <div className="hackathon-card-banner hackathon-card-banner-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      )}

      {/* Body */}
      <div className="hackathon-card-body">
        {/* Badges */}
        <div className="hackathon-card-badges">
          <span className="badge badge-type">{TYPE_LABELS[h.eventType] ?? h.eventType}</span>
          <span className="badge badge-mode">{MODE_LABELS[h.mode] ?? h.mode}</span>
          {h.isFeatured && <span className="badge badge-featured">⭐ Featured</span>}
        </div>

        {/* Title */}
        <h2 className="hackathon-card-title">{h.title}</h2>

        {/* Organizer */}
        <p className="hackathon-card-organizer">{h.organizerName}</p>

        {/* Short desc */}
        <p className="hackathon-card-desc">{h.shortDescription}</p>

        {/* Meta row */}
        <div className="hackathon-card-meta">
          {h.location.city && (
            <span className="hackathon-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {h.location.city}
            </span>
          )}
          <span className="hackathon-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Starts {formatDate(h.eventStartAt)}
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
