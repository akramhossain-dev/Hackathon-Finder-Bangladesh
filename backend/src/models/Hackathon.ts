import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * Hackathon.ts — Mongoose Hackathon model (Phase 3).
 *
 * Indexes:
 *   - slug (unique)
 *   - status, eventStartAt, registrationDeadline (common filter fields)
 *   - isFeatured, eventType, mode (card filter combos)
 *   - location.city (city filter)
 *   - text index on title + shortDescription (keyword search)
 */

// ── Type definitions ──────────────────────────────────────────────────────────

export type HackathonStatus = "draft" | "published" | "archived";
export type EventType =
  | "hackathon"
  | "coding-contest"
  | "ideathon"
  | "innovation-challenge";
export type EventMode = "online" | "offline" | "hybrid";

export interface ILocation {
  country?: string;
  city?: string;
  venue?: string;
  address?: string;
}

export interface IHackathon extends Document {
  // ── Identity / content ──────────────────────────────────────────────────
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  banner?: string;

  // ── Organizer ────────────────────────────────────────────────────────────
  organizerName: string;
  organizerWebsite?: string;
  organizerId?: mongoose.Types.ObjectId;

  // ── Classification ───────────────────────────────────────────────────────
  eventType: EventType;
  mode: EventMode;
  tags: string[];
  categories: string[];

  // ── Dates ────────────────────────────────────────────────────────────────
  registrationOpenAt?: Date;
  registrationDeadline: Date;
  eventStartAt: Date;
  eventEndAt: Date;

  // ── Location ─────────────────────────────────────────────────────────────
  location: ILocation;

  // ── Participation ────────────────────────────────────────────────────────
  entryFee?: number;
  teamSizeMin?: number;
  teamSizeMax?: number;
  eligibility: string[];
  rules?: string;

  // ── External / registration ──────────────────────────────────────────────
  registrationUrl: string;
  sourceUrl?: string;

  // ── Publishing ───────────────────────────────────────────────────────────
  status: HackathonStatus;
  isFeatured: boolean;

  // ── Metrics (safe to increment, never exposed as critical data) ──────────
  viewsCount: number;
  bookmarkCount: number;

  // ── Timestamps ───────────────────────────────────────────────────────────
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const locationSchema = new Schema<ILocation>(
  {
    country: { type: String, trim: true },
    city:    { type: String, trim: true, index: true },
    venue:   { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const hackathonSchema = new Schema<IHackathon>(
  {
    // Identity / content
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must be at most 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [500, "Short description must be at most 500 characters"],
    },
    fullDescription: { type: String, trim: true },
    banner:          { type: String, trim: true },

    // Organizer
    organizerName:    { type: String, required: [true, "Organizer name is required"], trim: true },
    organizerWebsite: { type: String, trim: true },
    organizerId:      { type: Schema.Types.ObjectId, ref: "Organizer" },

    // Classification
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: ["hackathon", "coding-contest", "ideathon", "innovation-challenge"] satisfies EventType[],
      index: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: ["online", "offline", "hybrid"] satisfies EventMode[],
      index: true,
    },
    tags:       { type: [String], default: [] },
    categories: { type: [String], default: [] },

    // Dates
    registrationOpenAt:   { type: Date },
    registrationDeadline: { type: Date, required: [true, "Registration deadline is required"], index: true },
    eventStartAt:         { type: Date, required: [true, "Event start date is required"], index: true },
    eventEndAt:           { type: Date, required: [true, "Event end date is required"] },

    // Location
    location: { type: locationSchema, default: () => ({}) },

    // Participation
    entryFee:    { type: Number, min: 0 },
    teamSizeMin: { type: Number, min: 1 },
    teamSizeMax: { type: Number, min: 1 },
    eligibility: { type: [String], default: [] },
    rules:       { type: String, trim: true },

    // External
    registrationUrl: { type: String, required: [true, "Registration URL is required"], trim: true },
    sourceUrl:       { type: String, trim: true },

    // Publishing
    status: {
      type: String,
      enum: ["draft", "published", "archived"] satisfies HackathonStatus[],
      default: "draft",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },

    // Metrics
    viewsCount:    { type: Number, default: 0, min: 0 },
    bookmarkCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Text search index (title + shortDescription) ──────────────────────────────
// Allows $text queries for keyword search across these two fields.
// Weight: title (10) > shortDescription (5)
hackathonSchema.index(
  { title: "text", shortDescription: "text" },
  { weights: { title: 10, shortDescription: 5 }, name: "hackathon_text_search" }
);

// ── Compound indexes for common list queries ──────────────────────────────────
hackathonSchema.index({ status: 1, eventStartAt: 1 });
hackathonSchema.index({ status: 1, registrationDeadline: 1 });
hackathonSchema.index({ status: 1, isFeatured: -1, eventStartAt: 1 });

// ── Model ─────────────────────────────────────────────────────────────────────

const Hackathon: Model<IHackathon> = mongoose.model<IHackathon>(
  "Hackathon",
  hackathonSchema
);

export default Hackathon;
