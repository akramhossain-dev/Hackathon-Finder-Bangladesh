import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError";

/**
 * rateLimiter.ts — Rate limiting middleware (Phase 1).
 *
 * Provides two limiters:
 *  - globalLimiter:  applied to ALL routes (200 req / 15 min per IP)
 *  - authLimiter:    applied to auth routes only (10 req / 15 min per IP)
 *
 * Mount in app.ts:
 *   app.use(globalLimiter);
 *   app.use("/api/v1/auth", authLimiter, authRouter);
 *
 * See docs/SECURITY.md for the full rate limit strategy.
 */

const rateLimitHandler = (_req: unknown, _res: unknown, next: (err: unknown) => void) => {
  next(new ApiError(429, "Too many requests. Please try again later."));
};

/** General API rate limiter — applied globally */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: "draft-7", // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Strict limiter for auth endpoints (login, register, refresh) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: rateLimitHandler,
});
