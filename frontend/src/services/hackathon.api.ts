import api from "@/lib/api";

/**
 * hackathon.api.ts — Frontend hackathon API service (Phase 3).
 *
 * Typed wrappers around all /hackathons/* public endpoints.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventType =
  | "hackathon"
  | "coding-contest"
  | "ideathon"
  | "innovation-challenge";

export type EventMode = "online" | "offline" | "hybrid";

export interface HackathonLocation {
  country?: string;
  city?: string;
  venue?: string;
  address?: string;
}

/** Shape returned by the list endpoint (subset of full fields) */
export interface HackathonCard {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  organizerName: string;
  eventType: EventType;
  mode: EventMode;
  location: HackathonLocation;
  registrationDeadline: string;
  eventStartAt: string;
  eventEndAt: string;
  isFeatured: boolean;
  banner?: string;
  tags: string[];
  status: string;
}

/** Full shape returned by the detail endpoint */
export interface HackathonDetail extends HackathonCard {
  fullDescription?: string;
  organizerWebsite?: string;
  categories: string[];
  registrationOpenAt?: string;
  entryFee?: number;
  teamSizeMin?: number;
  teamSizeMax?: number;
  eligibility: string[];
  rules?: string;
  registrationUrl: string;
  sourceUrl?: string;
  viewsCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface HackathonListParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  mode?: EventMode;
  eventType?: EventType;
  featured?: "true" | "false";
  tag?: string;
  category?: string;
  deadlineStatus?: "upcoming";
  sort?: "latest" | "deadline_asc" | "start_asc";
}

// ── API functions ─────────────────────────────────────────────────────────────

async function list(params?: HackathonListParams): Promise<{
  hackathons: HackathonCard[];
  pagination: PaginationMeta;
}> {
  const res = await api.get<{
    success: true;
    data: { hackathons: HackathonCard[] };
    pagination: PaginationMeta;
  }>("/hackathons", { params });

  return {
    hackathons: res.data.data.hackathons,
    pagination: res.data.pagination,
  };
}

async function getBySlug(slug: string): Promise<HackathonDetail> {
  const res = await api.get<{
    success: true;
    data: { hackathon: HackathonDetail };
  }>(`/hackathons/${slug}`);

  return res.data.data.hackathon;
}

export const hackathonApi = { list, getBySlug };
