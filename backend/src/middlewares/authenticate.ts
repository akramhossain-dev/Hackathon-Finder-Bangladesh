import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";
import { UserRole } from "../types";

/**
 * authenticate.ts — JWT verification middleware (Phase 2).
 *
 * Reads the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to req.user.
 *
 * Usage:
 *   router.get("/me", authenticate, controller.me)
 */

// ── Request augmentation — available after authenticate() runs ────────────────

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthUser {
  _id: string;
  role: UserRole;
}

// ── authenticate ──────────────────────────────────────────────────────────────

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Access token required");
    }

    const decoded = verifyAccessToken(token);

    req.user = { _id: decoded._id, role: decoded.role };
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
    } else {
      // JWT errors (TokenExpiredError, JsonWebTokenError, etc.)
      next(ApiError.unauthorized("Invalid or expired access token"));
    }
  }
}

// ── optionalAuthenticate ──────────────────────────────────────────────────────

/**
 * Attaches req.user if a valid Bearer token is present,
 * but does NOT reject requests with no token.
 * Useful for public endpoints that show extra data to logged-in users.
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = verifyAccessToken(token);
        req.user = { _id: decoded._id, role: decoded.role };
      }
    }
  } catch {
    // Silently ignore invalid/missing tokens for optional auth
  }
  next();
}
