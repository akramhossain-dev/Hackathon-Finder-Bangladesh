import mongoose from "mongoose";
import Hackathon, { IHackathon } from "../../models/Hackathon";
import { ApiError } from "../../utils/ApiError";
import { toSlug } from "../../utils/slug";
import {
  ListQuery,
  CreateHackathonInput,
  UpdateHackathonInput,
} from "./hackathon.validation";
import {
  PaginationMeta,
  buildPagination,
} from "../../utils/ApiResponse";

/**
 * hackathon.service.ts — Business logic for hackathon endpoints (Phase 3).
 *
 * Public service:
 *   listPublished(query) → paginated hackathon list (status=published only)
 *   getPublishedBySlug(slug) → single hackathon + viewsCount increment
 *
 * Internal/admin service (foundations for Phase 4+):
 *   create(input)
 *   update(id, input)
 *   remove(id)
 */

// ── Public: list published hackathons ─────────────────────────────────────────

export interface HackathonListResult {
  hackathons: IHackathon[];
  pagination: PaginationMeta;
}

export async function listPublished(query: ListQuery): Promise<HackathonListResult> {
  const {
    page,
    limit,
    search,
    city,
    mode,
    eventType,
    featured,
    tag,
    category,
    deadlineStatus,
    sort,
  } = query;

  // ── Build filter ─────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { status: "published" };

  // Keyword search (uses text index on title + shortDescription)
  if (search) {
    filter["$text"] = { $search: search };
  }

  if (city)      filter["location.city"] = { $regex: new RegExp(city, "i") };
  if (mode)      filter["mode"] = mode;
  if (eventType) filter["eventType"] = eventType;
  if (featured === "true")  filter["isFeatured"] = true;
  if (featured === "false") filter["isFeatured"] = false;
  if (tag)       filter["tags"] = { $in: [tag] };
  if (category)  filter["categories"] = { $in: [category] };

  if (deadlineStatus === "upcoming") {
    filter["registrationDeadline"] = { $gte: new Date() };
  }

  // ── Build sort ───────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortOption: Record<string, any> = { createdAt: -1 };

  if (sort === "deadline_asc") {
    sortOption = { registrationDeadline: 1 };
  } else if (sort === "start_asc") {
    sortOption = { eventStartAt: 1 };
  } else if (search) {
    // When doing text search, also consider text score relevance
    sortOption = { score: { $meta: "textScore" }, createdAt: -1 };
  }

  // ── Execute query ────────────────────────────────────────────────────────
  const skip  = (page - 1) * limit;
  const total = await Hackathon.countDocuments(filter);

  const hackathonsQuery = Hackathon.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select(
      "title slug shortDescription organizerName eventType mode location " +
      "registrationDeadline eventStartAt eventEndAt isFeatured banner tags status"
    );

  // Attach textScore projection if doing text search
  if (search) {
    hackathonsQuery.projection({ score: { $meta: "textScore" } });
  }

  const hackathons = await hackathonsQuery.lean();

  return {
    hackathons: hackathons as unknown as IHackathon[],
    pagination: buildPagination(total, page, limit),
  };
}

// ── Public: get single published hackathon by slug ────────────────────────────

export async function getPublishedBySlug(slug: string): Promise<IHackathon> {
  const hackathon = await Hackathon.findOne({ slug, status: "published" }).lean();

  if (!hackathon) {
    throw ApiError.notFound("Hackathon not found");
  }

  // Fire-and-forget view count increment — doesn't block response
  Hackathon.updateOne({ _id: hackathon._id }, { $inc: { viewsCount: 1 } }).catch(
    () => { /* silently ignore */ }
  );

  return hackathon as unknown as IHackathon;
}

// ── Internal: create hackathon (admin foundation — Phase 4+) ─────────────────

export async function create(input: CreateHackathonInput): Promise<IHackathon> {
  // Auto-generate slug if not provided
  const baseSlug = input.slug ?? toSlug(input.title);

  // Ensure slug uniqueness by appending a suffix if needed
  let slug = baseSlug;
  let attempt = 0;

  while (await Hackathon.exists({ slug })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const hackathon = await Hackathon.create({ ...input, slug });
  return hackathon;
}

// ── Internal: update hackathon (admin foundation — Phase 4+) ─────────────────

export async function update(
  id: string,
  input: UpdateHackathonInput
): Promise<IHackathon> {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest("Invalid hackathon ID");
  }

  // If title changed and no explicit slug, regenerate slug
  if (input.title && !input.slug) {
    const newSlug = toSlug(input.title);
    const existing = await Hackathon.findOne({ slug: newSlug, _id: { $ne: id } });
    if (!existing) input.slug = newSlug;
  }

  const hackathon = await Hackathon.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true }
  ).lean();

  if (!hackathon) throw ApiError.notFound("Hackathon not found");
  return hackathon as unknown as IHackathon;
}

// ── Internal: delete hackathon (admin foundation — Phase 4+) ─────────────────

export async function remove(id: string): Promise<void> {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest("Invalid hackathon ID");
  }

  const result = await Hackathon.findByIdAndDelete(id);
  if (!result) throw ApiError.notFound("Hackathon not found");
}
