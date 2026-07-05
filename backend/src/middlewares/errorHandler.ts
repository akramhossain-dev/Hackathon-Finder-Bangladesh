/**
 * errorHandler.ts — Global Express error handler (Phase 0 skeleton).
 *
 * Phase 1 upgrade:
 *  - Catch ApiError instances and return structured JSON
 *  - Handle Mongoose ValidationError, CastError
 *  - Differentiate operational vs programming errors
 *  - Add structured logging (e.g., Pino / Winston)
 */
import { Request, Response, NextFunction } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[ErrorHandler]", err);
  res.status(500).json({ success: false, message: "Internal server error" });
}
