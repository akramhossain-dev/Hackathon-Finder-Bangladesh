import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../types";

/**
 * authenticate.ts — JWT verification middleware (Phase 1 scaffold).
 *
 * This file provides the TYPED INTERFACE for the middleware so that
 * controllers written now compile correctly.
 *
 * Phase 2 implementation steps:
 *  1. npm install jsonwebtoken @types/jsonwebtoken
 *  2. Extract `Authorization: Bearer <token>` header
 *  3. jwt.verify(token, env.JWT_SECRET)
 *  4. Look up user in DB, check isActive
 *  5. Attach req.user = { _id, role } — see type below
 *  6. Throw ApiError.unauthorized() on any failure
 *
 * See docs/AUTH.md for the complete token strategy.
 */

// ── Request augmentation — available after authenticate() runs ────────────
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

/**
 * authenticate — verifies the JWT and attaches req.user.
 * Phase 1: stub that throws 501 Not Implemented.
 * Phase 2: replace body with real JWT logic.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // Phase 2: implement JWT verification here
  void req; // suppress unused-var lint
  next(ApiError.notImplemented("Authentication not implemented yet"));
}

/**
 * optionalAuthenticate — attaches req.user if a valid token is present,
 * but does NOT reject the request if no token is provided.
 * Useful for public endpoints that show extra data to logged-in users.
 *
 * Phase 2: implement real logic.
 */
export function optionalAuthenticate(_req: Request, _res: Response, next: NextFunction): void {
  // Phase 2: try to verify token, silently skip if missing/invalid
  next();
}
