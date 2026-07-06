"use client";

import { FormEvent } from "react";
import { EventMode, EventType, HackathonListParams } from "@/services/hackathon.api";

const MODE_OPTIONS = [
  { value: "",        label: "All modes" },
  { value: "online",  label: "🌐 Online" },
  { value: "offline", label: "📍 Offline" },
  { value: "hybrid",  label: "🔀 Hybrid" },
];

const TYPE_OPTIONS = [
  { value: "",                     label: "All types" },
  { value: "hackathon",            label: "Hackathon" },
  { value: "coding-contest",       label: "Coding Contest" },
  { value: "ideathon",             label: "Ideathon" },
  { value: "innovation-challenge", label: "Innovation Challenge" },
];

const SORT_OPTIONS = [
  { value: "latest",       label: "Latest" },
  { value: "deadline_asc", label: "Deadline ↑" },
  { value: "start_asc",    label: "Start date ↑" },
];

export interface FilterState {
  search:    string;
  city:      string;
  mode:      string;
  eventType: string;
  sort:      string;
}

interface HackathonFiltersProps {
  filters:          FilterState;
  onFilterChange:   (key: keyof FilterState, value: string) => void;
  onSubmit:         (e: FormEvent) => void;
  onReset:          () => void;
  hasActiveFilters: boolean;
  totalResults?:    number;
}

/**
 * HackathonFilters — filter bar for the hackathon listing page.
 */
export default function HackathonFilters({
  filters,
  onFilterChange,
  onSubmit,
  onReset,
  hasActiveFilters,
  totalResults,
}: HackathonFiltersProps) {
  return (
    <div className="hf-filters-wrap">
      <form onSubmit={onSubmit} className="filter-bar" role="search" aria-label="Filter hackathons">
        {/* Search */}
        <div className="filter-search-wrap">
          <svg className="filter-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="filter-search"
            type="search"
            placeholder="Search hackathons…"
            value={filters.search}
            onChange={e => onFilterChange("search", e.target.value)}
            className="filter-search-input"
            aria-label="Search hackathons"
          />
        </div>

        {/* City */}
        <input
          id="filter-city"
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={e => onFilterChange("city", e.target.value)}
          className="filter-input"
          aria-label="Filter by city"
        />

        {/* Mode */}
        <select
          id="filter-mode"
          value={filters.mode}
          onChange={e => onFilterChange("mode", e.target.value)}
          className="filter-select"
          aria-label="Filter by mode"
        >
          {MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Event type */}
        <select
          id="filter-type"
          value={filters.eventType}
          onChange={e => onFilterChange("eventType", e.target.value)}
          className="filter-select"
          aria-label="Filter by event type"
        >
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Sort */}
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={e => onFilterChange("sort", e.target.value)}
          className="filter-select"
          aria-label="Sort results"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button type="submit" id="filter-submit" className="filter-btn-primary">
          Search
        </button>

        {hasActiveFilters && (
          <button type="button" id="filter-reset" onClick={onReset} className="filter-btn-ghost">
            Clear
          </button>
        )}
      </form>

      {totalResults !== undefined && (
        <p className="hackathons-count">
          {totalResults} hackathon{totalResults !== 1 ? "s" : ""} found
        </p>
      )}
    </div>
  );
}

// ── Build API params from FilterState ─────────────────────────────────────────

export function filterStateToParams(
  filters: FilterState,
  page: number
): HackathonListParams {
  const params: HackathonListParams = {
    page,
    limit: 12,
    sort: (filters.sort as HackathonListParams["sort"]) ?? "latest",
  };
  if (filters.search)    params.search    = filters.search;
  if (filters.city)      params.city      = filters.city;
  if (filters.mode)      params.mode      = filters.mode as EventMode;
  if (filters.eventType) params.eventType = filters.eventType as EventType;
  return params;
}
