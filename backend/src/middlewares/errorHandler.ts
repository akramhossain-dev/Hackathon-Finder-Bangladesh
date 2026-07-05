import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * errorHandler.ts — Global Express error handler (Phase 1).
 *
 * Catches all errors thrown from route handlers and middleware.
 * Distinguishes between:
 *   - ApiError  → operational error, use its statusCode + message
 *   - Error     → unexpected error, return 500 without leaking internals
 *   - unknown   → safety net for non-Error throws
 *
 * Must be registered LAST in app.ts (after all routes).
 * Signature must have 4 parameters — Express uses arity to detect error handlers.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Operational errors thrown by our own code ────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // ── Mongoose validation errors ───────────────────────────────────────────
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "ValidationError"
  ) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err,
    });
    return;
  }

  // ── Mongoose duplicate key error ─────────────────────────────────────────
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
    return;
  }

  // ── Unknown / programming errors — never expose internals in production ──
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  if (process.env.NODE_ENV !== "production") {
    // In development, log the full stack for easier debugging
    console.error("[ErrorHandler]", err);
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" ? "Internal server error" : message,
  });
}
