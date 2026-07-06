import { z } from "zod";

/**
 * auth.validation.ts — Zod v4 schemas for auth endpoints (Phase 2).
 *
 * NOTE: Zod v4 uses `error` instead of `required_error` / `invalid_type_error`.
 * Used with the validateBody() middleware from Phase 1.
 */

// ── Register ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Must be a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Must be a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
