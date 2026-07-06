import { z } from "zod";

/**
 * hackathon.validation.ts — Zod v4 schemas for hackathon endpoints (Phase 3).
 */

// ── Shared enum values ────────────────────────────────────────────────────────

const EVENT_TYPES = ["hackathon", "coding-contest", "ideathon", "innovation-challenge"] as const;
const MODES       = ["online", "offline", "hybrid"] as const;
const STATUSES    = ["draft", "published", "archived"] as const;
const SORT_OPTIONS = ["latest", "deadline_asc", "start_asc"] as const;

// ── List query validation ─────────────────────────────────────────────────────

export const listQuerySchema = z.object({
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(12),
  search:         z.string().trim().max(200).optional(),
  city:           z.string().trim().max(100).optional(),
  mode:           z.enum(MODES).optional(),
  eventType:      z.enum(EVENT_TYPES).optional(),
  featured:       z.enum(["true", "false"]).optional(),
  tag:            z.string().trim().max(80).optional(),
  category:       z.string().trim().max(80).optional(),
  deadlineStatus: z.enum(["upcoming"]).optional(),
  sort:           z.enum(SORT_OPTIONS).default("latest"),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

// ── Slug param validation ─────────────────────────────────────────────────────

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});

export type SlugParam = z.infer<typeof slugParamSchema>;

// ── Create hackathon validation (internal/admin — Phase 4+) ──────────────────

export const createHackathonSchema = z.object({
  title:                z.string().trim().min(3).max(200),
  slug:                 z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  shortDescription:     z.string().trim().min(10).max(500),
  fullDescription:      z.string().trim().optional(),
  banner:               z.string().url().optional(),
  organizerName:        z.string().trim().min(1).max(200),
  organizerWebsite:     z.string().url().optional(),
  eventType:            z.enum(EVENT_TYPES),
  mode:                 z.enum(MODES),
  tags:                 z.array(z.string().trim().max(50)).max(20).default([]),
  categories:           z.array(z.string().trim().max(80)).max(10).default([]),
  registrationOpenAt:   z.coerce.date().optional(),
  registrationDeadline: z.coerce.date(),
  eventStartAt:         z.coerce.date(),
  eventEndAt:           z.coerce.date(),
  location: z.object({
    country: z.string().trim().max(100).optional(),
    city:    z.string().trim().max(100).optional(),
    venue:   z.string().trim().max(200).optional(),
    address: z.string().trim().max(500).optional(),
  }).default({}),
  entryFee:        z.number().min(0).optional(),
  teamSizeMin:     z.number().int().min(1).optional(),
  teamSizeMax:     z.number().int().min(1).optional(),
  eligibility:     z.array(z.string().trim().max(200)).max(20).default([]),
  rules:           z.string().trim().optional(),
  registrationUrl: z.string().url(),
  sourceUrl:       z.string().url().optional(),
  status:          z.enum(STATUSES).default("draft"),
  isFeatured:      z.boolean().default(false),
});

export type CreateHackathonInput = z.infer<typeof createHackathonSchema>;

// ── Update hackathon validation (internal/admin — partial) ────────────────────

export const updateHackathonSchema = createHackathonSchema.partial();
export type UpdateHackathonInput = z.infer<typeof updateHackathonSchema>;
