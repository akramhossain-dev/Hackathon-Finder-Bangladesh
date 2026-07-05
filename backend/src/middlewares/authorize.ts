import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";
import { ApiError } from "../utils/ApiError";

/**
 * authorize.ts — Role-based access control middleware (Phase 1).
 *
 * Must be used AFTER authenticate() — depends on req.user being set.
 *
 * Usage (Phase 2+):
 *   router.delete("/hackathons/:id", authenticate, authorize(["admin"]), controller)
 */
export function authorize(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}`
        )
      );
    }

    next();
  };
}
