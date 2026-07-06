"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hackathonApi, HackathonCard, PaginationMeta } from "@/services/hackathon.api";
import {
  HackathonList,
  HackathonFilters,
  Pagination,
  FilterState,
  filterStateToParams,
} from "@/components/hackathon";
import { Container } from "@/components/shared";
import { LoadingState } from "@/components/shared";
import { EmptyState }   from "@/components/shared";
import { ErrorState }   from "@/components/shared";
import { buildQueryString } from "@/lib/utils";

/**
 * Hackathons listing page — Phase 4.
 * Replaces Phase 3 inline implementation with component-based architecture.
 */
export default function HackathonsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Filter state from URL ──────────────────────────────────────────────────

  const [filters, setFilters] = useState<FilterState>({
    search:    searchParams.get("search")    ?? "",
    city:      searchParams.get("city")      ?? "",
    mode:      searchParams.get("mode")      ?? "",
    eventType: searchParams.get("eventType") ?? "",
    sort:      searchParams.get("sort")      ?? "latest",
  });

  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const [hackathons, setHackathons]   = useState<HackathonCard[]>([]);
  const [pagination, setPagination]   = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await hackathonApi.list(filterStateToParams(filters, page));
      setHackathons(result.hackathons);
      setPagination(result.pagination);
    } catch {
      setError("Failed to load hackathons. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetch(); }, [fetch]);

  // ── Sync URL ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const qs = buildQueryString({
      search:    filters.search    || undefined,
      city:      filters.city      || undefined,
      mode:      filters.mode      || undefined,
      eventType: filters.eventType || undefined,
      sort:      filters.sort !== "latest" ? filters.sort : undefined,
      page:      page > 1 ? page : undefined,
    });
    router.replace(`/hackathons${qs}`, { scroll: false });
  }, [filters, page, router]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleFilterChange(key: keyof FilterState, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key !== "sort") setPage(1);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    fetch();
  }

  function handleReset() {
    setFilters({ search: "", city: "", mode: "", eventType: "", sort: "latest" });
    setPage(1);
  }

  const hasActiveFilters =
    !!(filters.search || filters.city || filters.mode || filters.eventType);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="hackathons-page">
      {/* Header */}
      <div className="hackathons-header">
        <div className="hackathons-header-inner">
          <h1 className="hackathons-title">Hackathons in Bangladesh</h1>
          <p className="hackathons-subtitle">
            Discover hackathons, coding contests, ideathons, and innovation challenges.
          </p>
        </div>
      </div>

        <Container className="hackathons-body">
        {/* Filter bar */}
        <HackathonFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          hasActiveFilters={hasActiveFilters}
          totalResults={isLoading ? undefined : (pagination?.total ?? hackathons.length)}
        />

        {/* Content */}
        {isLoading ? (
          <LoadingState count={12} />
        ) : error ? (
          <ErrorState description={error} onRetry={fetch} />
        ) : hackathons.length === 0 ? (
          <EmptyState
            title="No hackathons found"
            description="Try adjusting your filters or check back later."
            action={
              hasActiveFilters ? (
                <button onClick={handleReset} className="filter-btn-ghost">
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <HackathonList hackathons={hackathons} />
            {pagination && (
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              />
            )}
          </>
        )}
      </Container>
    </div>
  );
}
