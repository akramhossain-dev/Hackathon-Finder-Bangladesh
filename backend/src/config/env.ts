import { z } from "zod";

/**
 * env.ts — Zod-validated environment configuration (Phase 1).
 *
 * All environment variables are validated at startup.
 * If any required variable is missing or malformed, the process exits
 * immediately with a clear error — not silently at runtime.
 *
 * Add new variables here as phases progress.
 */

const envSchema = z.object({
  // ── Server ─────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  // ── Database ────────────────────────────────────────────────────────────
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .startsWith("mongodb", "MONGODB_URI must be a valid MongoDB connection string"),

  // ── Auth (wired in Phase 2) ─────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // ── CORS ────────────────────────────────────────────────────────────────
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").default("http://localhost:3000"),

  // ── Redis / BullMQ (Phase 1+) ───────────────────────────────────────────
  REDIS_URL: z.string().optional(),
});

// Parse and validate — throws ZodError with readable output on failure
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\n❌ Invalid environment variables:\n");
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join(".")} — ${issue.message}`);
  });
  console.error("\nFix your .env file and restart the server.\n");
  process.exit(1);
}

export const env = parsed.data;

// TypeScript type for the validated env object
export type Env = z.infer<typeof envSchema>;
