/**
 * env.ts — Environment variable loader (Phase 0 version).
 *
 * Phase 1 upgrade plan:
 *  - Replace this with a Zod schema validation (z.object({...}).parse(process.env))
 *  - This enforces all required env vars at startup, not at runtime.
 *  - See docs/ARCHITECTURE.md §3 config/env.ts
 */

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test",

  PORT: parseInt(process.env.PORT ?? "5000", 10),

  // Phase 1: will be validated with Zod — fail-fast if missing
  MONGODB_URI: process.env.MONGODB_URI ?? "",

  JWT_SECRET: process.env.JWT_SECRET ?? "",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  CLIENT_URL: requireEnv("CLIENT_URL", "http://localhost:3000"),

  // Phase 1+: Redis
  REDIS_URL: process.env.REDIS_URL ?? "",
} as const;
